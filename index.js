require('dotenv').config();
var express = require('express');
var google = require('googleapis').google;
var cron = require('node-cron');
var cors = require('cors');
var path = require('path');

var app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));

var oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

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

  gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 20
  }).then(function(res) {
    var mensajes = res.data.messages || [];
    console.log('Mensajes encontrados para', plataforma, ':', mensajes.length);
    if (mensajes.length === 0) return callback(null);
    var promesas = mensajes.map(function(m) {
      return gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' });
    });
    return Promise.all(promesas);
  }).then(function(msgs) {
    if (!msgs) return callback(null);
    for (var i = 0; i < msgs.length; i++) {
      var msg = msgs[i];
      var headers = msg.data.payload.headers;
      var para = '';
      var asunto = '';
      var de = '';
      for (var j = 0; j < headers.length; j++) {
        if (headers[j].name === 'To') para = headers[j].value;
        if (headers[j].name === 'Subject') asunto = headers[j].value;
        if (headers[j].name === 'From') de = headers[j].value;
      }
      var textoPlano = extraerTexto(msg.data.payload);
      var emailLower = emailBuscado.toLowerCase();
      var paraLower = para.toLowerCase();
      var textoLower = textoPlano.toLowerCase();
      var esGmailPrincipal = emailLower === (process.env.GMAIL_USER || '').toLowerCase();
      
      console.log('Revisando - Para:', para, '| Email buscado:', emailBuscado);
      
      if (paraLower.indexOf(emailLower) >= 0 || textoLower.indexOf(emailLower) >= 0 || esGmailPrincipal) {
        var fecha = new Date(parseInt(msg.data.internalDate));
        var cuerpo = extraerHtml(msg.data.payload) || textoPlano;
        return callback({ asunto: asunto, de: de, cuerpo: cuerpo, hora: fecha.toLocaleString('es') });
      }
    }
    callback(null);
  }).catch(function(e) {
    console.error('Error:', e.message);
    callback(null);
  });
}

// Credenciales del validador — seguras en el backend, no en el frontend
var VALIDADOR_USER = process.env.VALIDADOR_USER || 'dgm2026';
var VALIDADOR_PASS = process.env.VALIDADOR_PASS || 'Dgm1010';

app.post('/auth-validador', function(req, res) {
  var user = (req.body.user || '').trim();
  var pass = (req.body.pass || '').trim();
  if (user === VALIDADOR_USER && pass === VALIDADOR_PASS) {
    res.json({ ok: true });
  } else {
    res.json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
  }
});

app.post('/buscar-correo', function(req, res) {
  var email = (req.body.email || '').trim();
  var plataforma = (req.body.plataforma || 'ambas').trim();
  if (!email) return res.json({ ok: false, mensaje: 'Escribe tu correo' });
  buscarCodigo(plataforma, email, function(correo) {
    if (correo) {
      res.json({ ok: true, correo: correo });
    } else {
      res.json({ ok: false, mensaje: 'No se encontró ningún código de acceso temporal para ese correo en los últimos 15 minutos. Espera 2-3 minutos y vuelve a intentar.' });
    }
  });
});

app.post('/reporte-error', function(req, res) {
  var correo = (req.body.correo || '').trim();
  var descripcion = (req.body.descripcion || '').trim();
  var imagen = req.body.imagen || ''; // data:image/png;base64,xxxx
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!descripcion) return res.json({ ok: false, mensaje: 'Falta la descripción' });
  if (!correo || !emailRegex.test(correo)) return res.json({ ok: false, mensaje: 'Correo inválido' });
  if (descripcion.length > 2000) return res.json({ ok: false, mensaje: 'Descripción muy larga' });

  // Sanitizar para evitar inyección de cabeceras en el correo (CRLF injection)
  var correoSeguro = correo.replace(/[\r\n]/g, '').slice(0, 200);
  var descripcionSegura = descripcion.replace(/[\r\n]+/g, '\n').slice(0, 2000);

  try {
    var gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    var match = imagen.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    var boundary = 'reporte_boundary_' + Date.now();
    var destinatario = process.env.GMAIL_USER || 'me';

    var mensaje = '';
    mensaje += 'To: ' + destinatario + '\r\n';
    mensaje += 'Subject: =?utf-8?B?' + Buffer.from('🚩 Nuevo reporte de error - Digital Market').toString('base64') + '?=\r\n';
    mensaje += 'MIME-Version: 1.0\r\n';
    mensaje += 'Content-Type: multipart/mixed; boundary="' + boundary + '"\r\n\r\n';
    mensaje += '--' + boundary + '\r\n';
    mensaje += 'Content-Type: text/plain; charset="UTF-8"\r\n\r\n';
    mensaje += 'Nuevo reporte de error recibido desde la web:\n\n';
    mensaje += 'Correo de la cuenta: ' + correoSeguro + '\n\n';
    mensaje += 'Descripción: ' + descripcionSegura + '\n\n';
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

    gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    }).then(function() {
      res.json({ ok: true });
    }).catch(function(e) {
      console.error('Error enviando reporte:', e.message);
      res.json({ ok: true }); // No bloquear al cliente aunque falle el correo interno
    });
  } catch (e) {
    console.error('Error reporte-error:', e.message);
    res.json({ ok: true });
  }
});

app.use(express.static(path.join(__dirname, 'frontend', 'build')));
app.get('/{*splat}', function(req, res) {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

var PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', function() {
  console.log('Servidor corriendo en puerto ' + PORT);
});
