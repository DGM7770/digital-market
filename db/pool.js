const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('[DB] DATABASE_URL no configurada. El sistema de cuentas/saldo no funcionará hasta que se configure.');
}

// La Internal Database URL de Render (recomendada, más rápida) viaja dentro de
// su red privada y NO requiere SSL. La External Database URL sí lo requiere
// porque sale a internet. DB_SSL permite forzar el comportamiento si hace falta.
function resolveSSL() {
  if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false };
  if (process.env.DB_SSL === 'false') return false;
  // Auto-detección: las URLs externas de Render incluyen ".render.com" en el host
  const url = process.env.DATABASE_URL || '';
  return url.includes('.render.com') ? { rejectUnauthorized: false } : false;
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: resolveSSL(),
    })
  : null;

async function query(text, params) {
  if (!pool) throw new Error('Base de datos no configurada');
  return pool.query(text, params);
}

module.exports = { pool, query };
