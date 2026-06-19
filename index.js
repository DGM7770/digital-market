require('dotenv').config();
var express = require('express');
var google = require('googleapis').google;
var cron = require('node-cron');
var cors = require('cors');
var path = require('path');
var helmet = require('helmet');
var rateLimit = require('express-rate-limit');

var app = express();

// ─── SEGURIDAD: HEADERS HTTP ──────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // el frontend React maneja su propio CSP
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS: solo el dominio propio puede hacer peticiones a la API ─────────────
var ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://digital-market-9wfa.onrender.com').split(',');
app.use(cors({
  origin: function(origin, callback) {
    // permitir requests sin origin (apps moviles, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.some(o => origin.startsWith(o.trim()))) {
      return callback(null, true);
    }
    callback(new Error('No permitido por CORS'));
  },
  methods: ['GET', 'POST'],
  credentials: false,
}));

// ─── RATE LIMITING POR ENDPOINT ───────────────────────────────────────────────
var limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiadas peticiones. Intenta en 15 minutos.' },
});

var limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // máximo 10 intentos por IP en 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiados intentos. Intenta en 15 minutos.' },
  // No usamos skipSuccessfulRequests porque el endpoint siempre responde 200
  // (éxito o fracaso van en el campo "ok" del JSON, no en el status HTTP).
  // Por eso TODOS los intentos cuentan contra el límite, lo cual es correcto
  // para frenar fuerza bruta sin importar si acertaron o no.
});

var limiterReporte = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 reportes por hora por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Límite de reportes alcanzado. Intenta en 1 hora.' },
});

app.use(limiterGeneral);

// ─── BODY PARSING con limites ajustados por ruta ─────────────────────────────
// Solo /reporte-error necesita 20mb (imagen base64). El resto usa 50kb máximo.
app.use('/reporte-error', express.json({ limit: '20mb' }));
app.use(express.json({ limit: '50kb' }));

// ─── OAUTH2 GOOGLE ────────────────────────────────────────────────────────────
var oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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
  var query = '';
  if (plataforma === 'netflix') {
    query = 'from:account.netflix.com (subject:"código de acceso temporal" OR subject:"código de inicio de sesión") newer_than:15m';
  } else if (plataforma === 'disney') {
    query = 'from:mail2.disneyplus.com subject:"Tu código de acceso único para Disney+" newer_than:15m';
  } else {
    query = '(from:account.netflix.com (subject:"código de acceso temporal" OR subject:"código de inicio de sesión") OR from:mail2.disneyplus.com subject:"Tu código de acceso único para Disney+") newer_than:15m';
  }

  gmail.users.messages.list({ userId: 'me', q: query, maxResults: 20 })
  .then(function(res) {
    var mensajes = res.data.messages || [];
    // LOG SIN DATOS SENSIBLES: solo cantidad, nunca correos ni contenido
    console.log('[buscarCodigo] Mensajes encontrados:', mensajes.length, 'plataforma:', plataforma);
    if (mensajes.length === 0) return callback(null);
    var promesas = mensajes.map(function(m) {
      return gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' });
    });
    return Promise.all(promesas);
  })
  .then(function(msgs) {
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
  .catch(function(e) {
    console.error('[buscarCodigo] Error:', e.message);
    callback(null);
  });
}

// ─── CREDENCIALES DEL VALIDADOR (SOLO desde variables de entorno) ─────────────
// ⚠️  NUNCA valores por defecto aquí — si no están configuradas, el endpoint falla seguro
var VALIDADOR_USER = process.env.VALIDADOR_USER;
var VALIDADOR_PASS = process.env.VALIDADOR_PASS;

if (!VALIDADOR_USER || !VALIDADOR_PASS) {
  console.warn('[SEGURIDAD] VALIDADOR_USER o VALIDADOR_PASS no configurados en variables de entorno. El endpoint /auth-validador rechazará todas las peticiones.');
}

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

// POST /auth-validador — con rate limiting estricto contra fuerza bruta
app.post('/auth-validador', limiterAuth, function(req, res) {
  var user = (req.body.user || '').trim();
  var pass = (req.body.pass || '').trim();
  if (!user || !pass) return res.json({ ok: false, mensaje: 'Faltan credenciales' });
  // Si no hay credenciales configuradas en el servidor, siempre rechazar
  if (!VALIDADOR_USER || !VALIDADOR_PASS) return res.json({ ok: false, mensaje: 'Servicio no disponible' });
  if (user === VALIDADOR_USER && pass === VALIDADOR_PASS) {
    res.json({ ok: true });
  } else {
    res.json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
  }
});

// POST /buscar-correo
app.post('/buscar-correo', function(req, res) {
  var email = (req.body.email || '').trim();
  var plataforma = (req.body.plataforma || 'ambas').trim();
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) return res.json({ ok: false, mensaje: 'Correo inválido' });
  if (!['netflix','disney','ambas'].includes(plataforma)) plataforma = 'ambas';
  buscarCodigo(plataforma, email, function(correo) {
    if (correo) {
      res.json({ ok: true, correo: correo });
    } else {
      res.json({ ok: false, mensaje: 'No se encontró ningún código de acceso temporal para ese correo en los últimos 15 minutos. Espera 2-3 minutos y vuelve a intentar.' });
    }
  });
});

// POST /reporte-error — con rate limiting más estricto
app.post('/reporte-error', limiterReporte, function(req, res) {
  var correo = (req.body.correo || '').trim();
  var descripcion = (req.body.descripcion || '').trim();
  var imagen = req.body.imagen || '';
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!descripcion) return res.json({ ok: false, mensaje: 'Falta la descripción' });
  if (!correo || !emailRegex.test(correo)) return res.json({ ok: false, mensaje: 'Correo inválido' });
  if (descripcion.length > 2000) return res.json({ ok: false, mensaje: 'Descripción muy larga' });

  // Validar que la imagen sea realmente una imagen (si se proporcionó)
  if (imagen && !imagen.match(/^data:image\/(jpeg|jpg|png|webp|gif|bmp);base64,[A-Za-z0-9+/]+=*$/)) {
    imagen = ''; // descartar si no es una imagen válida
  }

  // Sanitizar contra CRLF injection
  var correoSeguro = correo.replace(/[\r\n]/g, '').slice(0, 200);
  var descripcionSegura = descripcion.replace(/[\r\n]+/g, '\n').slice(0, 2000);

  try {
    var gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    var match = imagen.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    var boundary = 'reporte_boundary_' + Date.now();
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

    if (match) {
      var mimeType = match[1];
      var base64Data = match[2];
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
    .then(function() { res.json({ ok: true }); })
    .catch(function(e) {
      console.error('[reporte-error] Error Gmail:', e.message);
      res.json({ ok: true }); // no bloquear al cliente
    });
  } catch (e) {
    console.error('[reporte-error] Error:', e.message);
    res.json({ ok: true });
  }
});

// ─── CONFIG PÚBLICA (solo datos NO sensibles que el frontend necesita) ────────
// El token TMDB y el número de WA viven en variables de entorno, no en el JS del navegador
app.get('/api/config', function(req, res) {
  res.json({
    waNumber: process.env.WA_NUMBER || '',
    tmdbToken: process.env.TMDB_TOKEN || '',
  });
});

// ─── FRONTEND ESTÁTICO ────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'frontend', 'build')));
app.get('/{*splat}', function(req, res) {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

var PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', function() {
  console.log('Servidor corriendo en puerto ' + PORT);
});