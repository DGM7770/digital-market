require('dotenv').config();
var express = require('express');
var google = require('googleapis').google;
var cron = require('node-cron');
var cors = require('cors');
var path = require('path');

var app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

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

app.use(express.static(path.join(__dirname, 'frontend', 'build')));
app.get('/{*splat}', function(req, res) {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

var PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', function() {
  console.log('Servidor corriendo en puerto ' + PORT);
});
