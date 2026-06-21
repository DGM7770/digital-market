require('dotenv').config();
var express = require('express');
var google = require('googleapis').google;
var cron = require('node-cron');
var cors = require('cors');
var path = require('path');
var helmet = require('helmet');
var { migrate } = require('./db/migrate');
var dbRoutes = require('./db/routes');
var rateLimit = require('express-rate-limit');
var compression = require('compression');
var crypto = require('crypto');
var { body, param, validationResult } = require('express-validator');
var winston = require('winston');

// LOGGER (Winston) - logs estructurados, sin datos sensibles
var logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'digital-market-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});

function logEvent(tipo, req, extra) {
  logger.info(tipo, Object.assign({
    ip: req.ip,
    endpoint: req.originalUrl,
    method: req.method,
  }, extra || {}));
}

var app = express();

var REQUIRED_ENV = ['CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN', 'WA_NUMBER', 'TMDB_TOKEN'];
var missingEnv = REQUIRED_ENV.filter(function(k){ return !process.env[k]; });
if (missingEnv.length) {
  logger.warn('Variables de entorno faltantes: ' + missingEnv.join(', '));
}

var FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://digital-market-9wfa.onrender.com';
var IS_PROD = process.env.NODE_ENV === 'production';

// 1) TRUST PROXY - necesario en Render para que rate-limit identifique IPs reales
app.set('trust proxy', 1);

// 2) COMPRESION
app.use(compression());

// 3) HELMET + CSP ESTRICTA (protege contra XSS, clickjacking, sniffing)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://image.tmdb.org", "https://*.googleusercontent.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// 4) CORS ESTRICTO - comparacion EXACTA de hostname, no startsWith()
var ALLOWED_HOSTNAMES = (process.env.ALLOWED_ORIGINS || FRONTEND_ORIGIN)
  .split(',')
  .map(function(o) {
    try { return new URL(o.trim()).hostname; } catch (e) { return null; }
  })
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true;
  try {
    var hostname = new URL(origin).hostname;
    return ALLOWED_HOSTNAMES.indexOf(hostname) !== -1;
  } catch (e) {
    return false;
  }
}

app.use(cors({
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) return callback(null, true);
    callback(new Error('Origen no permitido por CORS'));
  },
  methods: ['GET', 'POST'],
  credentials: false,
  maxAge: 600,
}));

// 5) RATE LIMITING POR ENDPOINT
function makeLimiter(opts) {
  return rateLimit(Object.assign({
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res, next, options) {
      logEvent('rate_limit_exceeded', req, { limite: options.max, ventana_ms: options.windowMs });
      res.status(429).json(options.message);
    },
  }, opts));
}

var limiterGeneral = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { ok: false, mensaje: 'Demasiadas peticiones. Intenta en unos minutos.' },
});

var limiterAuth = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { ok: false, mensaje: 'Demasiados intentos de acceso. Intenta en 15 minutos.' },
});

var limiterBuscarCorreo = makeLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: { ok: false, mensaje: 'Demasiadas búsquedas. Espera unos minutos.' },
});

var limiterReporte = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { ok: false, mensaje: 'Límite de reportes alcanzado. Intenta en 1 hora.' },
});

var limiterTmdb = makeLimiter({
  windowMs: 60 * 1000,
  max: 40,
  message: { ok: false, mensaje: 'Demasiadas solicitudes a contenido. Espera un momento.' },
});

app.use(limiterGeneral);

// 6) BODY PARSING - limites estrictos por ruta (anti payload-flood / DoS)
app.use('/reporte-error', express.json({ limit: '21mb' }));
app.use(express.json({ limit: '50kb' }));

// 7) MIDDLEWARE DE VALIDACION GENERICO (express-validator)
function validar(req, res, next) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', detalles: errors.array().map(function(e){ return e.msg; }) });
  }
  next();
}

// OAUTH2 GOOGLE
var oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// HELPERS DE PARSEO DE CORREO
function extraerHtml(payload) {
  if (payload.mimeType === 'text/html' && payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  if (payload.parts) {
    for (var i = 0; i < payload.parts.length; i++) {
      var r = extraerHtml(payload.parts[i]);
      if (r) return r;
    }
  }
  return '';
}

function extraerTexto(payload) {
  if (payload.mimeType === 'text/plain' && payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  if (payload.parts) {
    for (var i = 0; i < payload.parts.length; i++) {
      var r = extraerTexto(payload.parts[i]);
      if (r) return r;
    }
  }
  return '';
}

function buscarCodigo(plataforma, emailBuscado, callback) {
  var gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  var gquery = '';
  if (plataforma === 'netflix') {
    gquery = 'from:account.netflix.com (subject:"código de acceso temporal" OR subject:"código de inicio de sesión") newer_than:15m';
  } else if (plataforma === 'disney') {
    gquery = 'from:mail2.disneyplus.com subject:"Tu código de acceso único para Disney+" newer_than:15m';
  } else {
    gquery = '(from:account.netflix.com (subject:"código de acceso temporal" OR subject:"código de inicio de sesión") OR from:mail2.disneyplus.com subject:"Tu código de acceso único para Disney+") newer_than:15m';
  }

  gmail.users.messages.list({ userId: 'me', q: gquery, maxResults: 20 })
    .then(function (res) {
      var mensajes = res.data.messages || [];
      logger.info('busqueda_codigo', { plataforma: plataforma, encontrados: mensajes.length });
      if (mensajes.length === 0) return callback(null);
      var promesas = mensajes.map(function (m) {
        return gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' });
      });
      return Promise.all(promesas);
    })
    .then(function (msgs) {
      if (!msgs) return callback(null);
      for (var i = 0; i < msgs.length; i++) {
        var msg = msgs[i];
        var headers = msg.data.payload.headers;
        var para = '', asunto = '', de = '';
        for (var j = 0; j < headers.length; j++) {
          if (headers[j].name === 'To') para = headers[j].value;
          if (headers[j].name === 'Subject') asunto = headers[j].value;
          if (headers[j].name === 'From') de = headers[j].value;
        }
        var textoPlano = extraerTexto(msg.data.payload);
        var emailLower = emailBuscado.toLowerCase();
        var esGmailPrincipal = emailLower === (process.env.GMAIL_USER || '').toLowerCase();
        if (para.toLowerCase().indexOf(emailLower) >= 0 || textoPlano.toLowerCase().indexOf(emailLower) >= 0 || esGmailPrincipal) {
          var fecha = new Date(parseInt(msg.data.internalDate));
          var cuerpo = extraerHtml(msg.data.payload) || textoPlano;
          return callback({ asunto: asunto, de: de, cuerpo: cuerpo, hora: fecha.toLocaleString('es') });
        }
      }
      callback(null);
    })
    .catch(function (e) {
      logger.error('error_busqueda_codigo', { error: e.message });
      callback(null);
    });
}

// 8) AUTENTICACION DEL VALIDADOR - timingSafeEqual + sin valores por defecto
var VALIDADOR_USER = process.env.VALIDADOR_USER || '';
var VALIDADOR_PASS = process.env.VALIDADOR_PASS || '';

if (!VALIDADOR_USER || !VALIDADOR_PASS) {
  logger.warn('VALIDADOR_USER o VALIDADOR_PASS no configurados. /auth-validador rechazara todo.');
}

function compararSeguro(a, b) {
  var bufA = Buffer.from(String(a));
  var bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// POST /auth-validador
app.post('/auth-validador',
  limiterAuth,
  [
    body('user').isString().trim().isLength({ min: 1, max: 100 }).escape(),
    body('pass').isString().isLength({ min: 1, max: 200 }),
  ],
  validar,
  function (req, res) {
    var user = req.body.user.trim();
    var pass = req.body.pass;

    if (!VALIDADOR_USER || !VALIDADOR_PASS) {
      logEvent('auth_validador_sin_configurar', req);
      return res.json({ ok: false, mensaje: 'Servicio no disponible' });
    }

    var userOk = compararSeguro(user, VALIDADOR_USER);
    var passOk = compararSeguro(pass, VALIDADOR_PASS);

    if (userOk && passOk) {
      logEvent('auth_validador_exitoso', req);
      return res.json({ ok: true });
    }
    logEvent('auth_validador_fallido', req);
    res.json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
  }
);

// POST /buscar-correo
app.post('/buscar-correo',
  limiterBuscarCorreo,
  [
    body('email').isEmail().normalizeEmail().isLength({ max: 200 }),
    body('plataforma').optional().isIn(['netflix', 'disney', 'ambas']),
  ],
  validar,
  function (req, res) {
    var email = req.body.email;
    var plataforma = req.body.plataforma || 'ambas';
    var MENSAJE_GENERICO = 'No se encontró ningún código de acceso temporal para ese correo en los últimos 15 minutos. Espera 2-3 minutos y vuelve a intentar.';

    buscarCodigo(plataforma, email, function (correo) {
      logEvent('busqueda_correo', req, { encontrado: !!correo, plataforma: plataforma });
      if (correo) {
        return res.json({ ok: true, correo: correo });
      }
      res.json({ ok: false, mensaje: MENSAJE_GENERICO });
    });
  }
);

// POST /reporte-error
app.post('/reporte-error',
  limiterReporte,
  [
    body('correo').isEmail().normalizeEmail().isLength({ max: 200 }),
    body('descripcion').isString().trim().isLength({ min: 1, max: 2000 }),
    body('imagen').optional().isString().isLength({ max: 21 * 1024 * 1024 }),
  ],
  validar,
  function (req, res) {
    var correo = req.body.correo;
    var descripcion = req.body.descripcion;
    var imagen = req.body.imagen || '';

    var MIME_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/heic'];
    var imagenValida = '';
    if (imagen) {
      var match = imagen.match(/^data:(image\/[a-zA-Z+]+);base64,([A-Za-z0-9+/]+=*)$/);
      if (match && MIME_PERMITIDOS.indexOf(match[1].toLowerCase()) !== -1) {
        var bytesReales = Buffer.byteLength(match[2], 'base64');
        if (bytesReales <= 15 * 1024 * 1024) {
          imagenValida = imagen;
        } else {
          logEvent('reporte_imagen_rechazada_tamano', req, { bytes: bytesReales });
        }
      } else if (match) {
        logEvent('reporte_imagen_rechazada_mime', req, { mime: match[1] });
      }
    }

    var correoSeguro = correo.replace(/[\r\n]/g, '').slice(0, 200);
    var descripcionSegura = descripcion.replace(/[\r\n]+/g, '\n').slice(0, 2000);

    try {
      var gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      var match2 = imagenValida.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      var boundary = 'reporte_boundary_' + crypto.randomBytes(8).toString('hex');
      var destinatario = process.env.GMAIL_USER || 'me';

      var mensaje = '';
      mensaje += 'To: ' + destinatario + '\r\n';
      mensaje += 'Subject: =?utf-8?B?' + Buffer.from('Nuevo reporte de error - Digital Market').toString('base64') + '?=\r\n';
      mensaje += 'MIME-Version: 1.0\r\n';
      mensaje += 'Content-Type: multipart/mixed; boundary="' + boundary + '"\r\n\r\n';
      mensaje += '--' + boundary + '\r\n';
      mensaje += 'Content-Type: text/plain; charset="UTF-8"\r\n\r\n';
      mensaje += 'Nuevo reporte de error recibido desde la web:\n\n';
      mensaje += 'Correo de la cuenta: ' + correoSeguro + '\n\n';
      mensaje += 'Descripcion: ' + descripcionSegura + '\n\n';
      mensaje += 'Fecha: ' + new Date().toLocaleString('es-CO') + '\r\n\r\n';

      if (match2) {
        var mimeType = match2[1];
        var base64Data = match2[2];
        var ext = mimeType.split('/')[1] || 'jpg';
        mensaje += '--' + boundary + '\r\n';
        mensaje += 'Content-Type: ' + mimeType + '\r\n';
        mensaje += 'Content-Transfer-Encoding: base64\r\n';
        mensaje += 'Content-Disposition: attachment; filename="captura.' + ext + '"\r\n\r\n';
        mensaje += base64Data + '\r\n\r\n';
      }
      mensaje += '--' + boundary + '--';

      var encodedMessage = Buffer.from(mensaje).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedMessage } })
        .then(function () {
          logEvent('reporte_enviado', req);
          res.json({ ok: true });
        })
        .catch(function (e) {
          logger.error('error_envio_reporte', { error: e.message });
          res.json({ ok: true });
        });
    } catch (e) {
      logger.error('error_reporte', { error: e.message });
      res.json({ ok: true });
    }
  }
);

// 9) PROXY SEGURO PARA TMDB - el token NUNCA llega al navegador
var TMDB_BASE = 'https://api.themoviedb.org/3';
var TMDB_RUTAS_PERMITIDAS = ['trending/all/week', 'movie/top_rated', 'tv/top_rated', 'movie/popular', 'tv/popular'];

app.get('/api/tmdb/movie/:id',
  limiterTmdb,
  [ param('id').isInt({ min: 1, max: 99999999 }) ],
  validar,
  function (req, res) {
    fetch(TMDB_BASE + '/movie/' + req.params.id + '?language=es-CO', {
      headers: { Authorization: 'Bearer ' + process.env.TMDB_TOKEN },
    })
      .then(function(r){ return r.json(); })
      .then(function(data){ res.json(data); })
      .catch(function(e) {
        logger.error('error_tmdb_proxy', { error: e.message });
        res.status(502).json({ ok: false, mensaje: 'No se pudo cargar la información' });
      });
  }
);

app.get('/api/tmdb/{*ruta}',
  limiterTmdb,
  function (req, res) {
    // En Express 5, un wildcard {*nombre} entrega un array de segmentos, no un string
    var segmentos = req.params.ruta;
    var ruta = Array.isArray(segmentos) ? segmentos.join('/') : String(segmentos || '');
    if (TMDB_RUTAS_PERMITIDAS.indexOf(ruta) === -1) {
      return res.status(404).json({ ok: false, mensaje: 'Ruta no disponible' });
    }
    var pagina = parseInt(req.query.page) || 1;
    if (pagina < 1 || pagina > 50) pagina = 1;
    var url = TMDB_BASE + '/' + ruta + '?language=es-CO&page=' + pagina;
    fetch(url, { headers: { Authorization: 'Bearer ' + process.env.TMDB_TOKEN } })
      .then(function(r){ return r.json(); })
      .then(function(data){ res.json(data); })
      .catch(function(e) {
        logger.error('error_tmdb_proxy', { error: e.message });
        res.status(502).json({ ok: false, mensaje: 'No se pudo cargar la información' });
      });
  }
);

// 10) CONFIG PUBLICA - SOLO datos no sensibles (ya sin TMDB_TOKEN)
app.get('/api/config', function (req, res) {
  res.json({
    waNumber: process.env.WA_NUMBER || '',
  });
});

// 12) SISTEMA DE CUENTAS, SALDO Y COMPRAS (registro, login, panel admin)
app.use('/api', dbRoutes);

// FRONTEND ESTATICO
app.use(express.static(path.join(__dirname, 'frontend', 'build'), {
  maxAge: IS_PROD ? '1d' : 0,
}));

app.get('/{*splat}', function (req, res) {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// 11) MANEJO GLOBAL DE ERRORES - nunca exponer stack traces ni detalles internos
app.use(function (err, req, res, next) {
  logger.error('error_no_controlado', {
    error: err.message,
    stack: IS_PROD ? undefined : err.stack,
    endpoint: req.originalUrl,
  });

  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ ok: false, mensaje: 'Acceso no autorizado' });
  }

  res.status(500).json({
    ok: false,
    mensaje: 'Ocurrió un error interno. Intenta de nuevo más tarde.',
  });
});

process.on('unhandledRejection', function (reason) {
  logger.error('unhandled_rejection', { reason: String(reason) });
});
process.on('uncaughtException', function (err) {
  logger.error('uncaught_exception', { error: err.message, stack: err.stack });
});

var PORT = process.env.PORT || 10000;
migrate().finally(function () {
  app.listen(PORT, '0.0.0.0', function () {
    logger.info('servidor_iniciado', { puerto: PORT, entorno: process.env.NODE_ENV || 'development' });
  });
});
