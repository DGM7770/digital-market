const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET; // OBLIGATORIO en producción, sin valor por defecto
const JWT_EXPIRES = '7d';

if (!JWT_SECRET) {
  console.warn('[AUTH] JWT_SECRET no configurado. El login no funcionará hasta que se configure.');
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(payload) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET no configurado');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET no configurado');
  return jwt.verify(token, JWT_SECRET);
}

// Middleware: requiere estar autenticado (cualquier rol)
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, mensaje: 'No autenticado' });
  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, correo, rol }
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, mensaje: 'Sesión inválida o expirada' });
  }
}

// Middleware: requiere rol admin específicamente
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ ok: false, mensaje: 'No autorizado' });
    }
    next();
  });
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, requireAuth, requireAdmin };
