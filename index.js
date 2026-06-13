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
    query = 'from:account.netflix.com subject:"Tu código de acceso temporal" newer_than:15m';
  } else if (plataforma === 'disney') {
    query = 'from:mail2.disneyplus.com subject:"Tu código de acceso único para Disney+" newer_than:15m';
  } else {
    query = '(from:account.netflix.com subject:"Tu código de acceso temporal" OR from:mail2.disneyplus.com subject:"Tu código de acceso único para Disney+") newer_than:15m';
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

// ── ENDPOINT TEMPORAL DE DIAGNOSTICO ── eliminar despues de revisar ──
app.get('/debug-correos', function(req, res) {
  var gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  gmail.users.messages.list({ userId: 'me', q: 'newer_than:1d', maxResults: 15 })
    .then(function(listRes) {
      var mensajes = listRes.data.messages || [];
      if (mensajes.length === 0) return res.json({ ok: true, total: 0, mensajes: [] });
      var promesas = mensajes.map(function(m) {
        return gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['From','To','Subject','Date'] });
      });
      Promise.all(promesas).then(function(msgs) {
        var resumen = msgs.map(function(msg) {
          var headers = msg.data.payload.headers || [];
          var obj = {};
          headers.forEach(function(h) { obj[h.name] = h.value; });
          return { from: obj.From, to: obj.To, subject: obj.Subject, date: obj.Date };
        });
        res.json({ ok: true, total: resumen.length, mensajes: resumen });
      }).catch(function(e) { res.json({ ok: false, error: e.message }); });
    })
    .catch(function(e) { res.json({ ok: false, error: e.message }); });
});

// ── ENDPOINT TEMPORAL: probar query exacta de busqueda ── eliminar despues ──
app.get('/debug-query', function(req, res) {
  var gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  var plataforma = req.query.plataforma || 'disney';
  var query = '';
  if (plataforma === 'netflix') {
    query = 'from:account.netflix.com subject:"Tu código de acceso temporal" newer_than:1d';
  } else if (plataforma === 'disney') {
    query = 'from:mail2.disneyplus.com subject:"Tu código de acceso único para Disney+" newer_than:1d';
  }
  gmail.users.messages.list({ userId: 'me', q: query, maxResults: 10 })
    .then(function(listRes) {
      res.json({ ok: true, query: query, total: (listRes.data.messages || []).length, ids: listRes.data.messages || [] });
    })
    .catch(function(e) { res.json({ ok: false, query: query, error: e.message }); });
});

app.use(express.static(path.join(__dirname, 'frontend', 'build')));
app.get('/{*splat}', function(req, res) {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

var PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', function() {
  console.log('Servidor corriendo en puerto ' + PORT);
});
