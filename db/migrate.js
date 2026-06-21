const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function migrate() {
  if (!pool) {
    console.warn('[DB] Migración omitida: no hay DATABASE_URL configurada.');
    return false;
  }
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);
    console.log('[DB] Migración aplicada correctamente.');
    return true;
  } catch (e) {
    console.error('[DB] Error aplicando migración:', e.message);
    return false;
  }
}

module.exports = { migrate };
