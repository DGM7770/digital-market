const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { query, pool } = require('./pool');
const { hashPassword, verifyPassword, signToken, requireAuth, requireAdmin } = require('./auth');

const router = express.Router();

function validar(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, mensaje: 'Datos inválidos', detalles: errors.array().map(e => e.msg) });
  }
  next();
}

const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiados intentos. Intenta en 15 minutos.' },
});

// RENOVAR TOKEN (para sesiones activas)
router.post('/auth/refresh', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT id, nombre, correo, rol, saldo FROM usuarios WHERE id = $1 AND activo = true', [req.user.id]);
    if (result.rows.length === 0) return res.status(401).json({ ok: false, mensaje: 'Sesión inválida' });
    const user = result.rows[0];
    const token = signToken({ id: user.id, correo: user.correo, rol: user.rol });
    res.json({ ok: true, token, user });
  } catch (e) {
    console.error('[refresh] Error:', e.message);
    res.status(500).json({ ok: false, mensaje: 'Error al renovar sesión' });
  }
});

// REGISTRO
router.post('/auth/registro',
  limiterAuth,
  [
    body('nombre').isString().trim().isLength({ min: 2, max: 150 }),
    body('correo').isEmail().normalizeEmail().isLength({ max: 200 }),
    body('password').isString().isLength({ min: 8, max: 100 }),
    body('telefono').optional().isString().trim().isLength({ max: 30 }),
  ],
  validar,
  async (req, res) => {
    try {
      const { nombre, correo, password, telefono } = req.body;
      const existe = await query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
      if (existe.rows.length > 0) {
        return res.json({ ok: false, mensaje: 'No se pudo completar el registro con esos datos' });
      }
      const hash = await hashPassword(password);
      const result = await query(
        `INSERT INTO usuarios (nombre, correo, password_hash, telefono, rol, saldo)
         VALUES ($1,$2,$3,$4,'cliente',0) RETURNING id, nombre, correo, rol, saldo`,
        [nombre, correo, hash, telefono || null]
      );
      const user = result.rows[0];
      const token = signToken({ id: user.id, correo: user.correo, rol: user.rol });
      res.json({ ok: true, token, user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol, saldo: user.saldo } });
    } catch (e) {
      console.error('[registro] Error:', e.message);
      res.status(500).json({ ok: false, mensaje: 'Error al registrar. Intenta de nuevo.' });
    }
  }
);

// LOGIN
router.post('/auth/login',
  limiterAuth,
  [
    body('correo').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 1, max: 100 }),
  ],
  validar,
  async (req, res) => {
    try {
      const { correo, password } = req.body;
      const result = await query('SELECT * FROM usuarios WHERE correo = $1 AND activo = true', [correo]);
      const MENSAJE_GENERICO = 'Correo o contraseña incorrectos';
      if (result.rows.length === 0) return res.json({ ok: false, mensaje: MENSAJE_GENERICO });
      const user = result.rows[0];
      const valido = await verifyPassword(password, user.password_hash);
      if (!valido) return res.json({ ok: false, mensaje: MENSAJE_GENERICO });
      const token = signToken({ id: user.id, correo: user.correo, rol: user.rol });
      res.json({ ok: true, token, user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol, saldo: user.saldo } });
    } catch (e) {
      console.error('[login] Error:', e.message);
      res.status(500).json({ ok: false, mensaje: 'Error al iniciar sesión. Intenta de nuevo.' });
    }
  }
);

// PERFIL DEL USUARIO ACTUAL
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT id, nombre, correo, telefono, rol, saldo, creado_en FROM usuarios WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    res.json({ ok: true, user: result.rows[0] });
  } catch (e) {
    console.error('[me] Error:', e.message);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener perfil' });
  }
});

// MOVIMIENTOS DE SALDO
router.get('/me/movimientos', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, tipo, monto, saldo_resultante, descripcion, creado_en
       FROM movimientos_saldo WHERE usuario_id = $1 ORDER BY creado_en DESC LIMIT 100`,
      [req.user.id]
    );
    res.json({ ok: true, movimientos: result.rows });
  } catch (e) {
    console.error('[movimientos] Error:', e.message);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener movimientos' });
  }
});

// COMPRAS DEL USUARIO ACTUAL
router.get('/me/compras', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.producto_id, c.producto_nombre, c.precio, c.estado, c.creado_en,
              i.cuenta_usuario, i.cuenta_password, i.perfil, i.notas
       FROM compras c
       LEFT JOIN inventario_cuentas i ON i.id = c.inventario_id
       WHERE c.usuario_id = $1 ORDER BY c.creado_en DESC LIMIT 100`,
      [req.user.id]
    );
    res.json({ ok: true, compras: result.rows });
  } catch (e) {
    console.error('[compras] Error:', e.message);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener compras' });
  }
});

// COMPRAR UN PRODUCTO CON SALDO (transaccion atomica)
router.post('/comprar',
  requireAuth,
  [
    body('producto_id').isString().trim().isLength({ min: 1, max: 100 }),
    body('producto_nombre').isString().trim().isLength({ min: 1, max: 200 }),
    body('precio').isInt({ min: 1, max: 10000000 }),
  ],
  validar,
  async (req, res) => {
    const { producto_id, producto_nombre, precio } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query('SELECT saldo FROM usuarios WHERE id = $1 FOR UPDATE', [req.user.id]);
      if (userResult.rows.length === 0) throw new Error('Usuario no encontrado');
      const saldoActual = userResult.rows[0].saldo;

      if (saldoActual < precio) {
        await client.query('ROLLBACK');
        return res.json({ ok: false, mensaje: 'Saldo insuficiente', saldo: saldoActual });
      }

      const invResult = await client.query(
        `SELECT id, cuenta_usuario, cuenta_password, perfil, notas FROM inventario_cuentas
         WHERE producto_id = $1 AND estado = 'disponible' LIMIT 1 FOR UPDATE`,
        [producto_id]
      );

      const nuevoSaldo = saldoActual - precio;
      let inventarioId = null;
      let estadoCompra = 'completada';
      let cuentaAsignada = null;

      if (invResult.rows.length === 0) {
        estadoCompra = 'sin_stock';
      } else {
        const cuenta = invResult.rows[0];
        inventarioId = cuenta.id;
        cuentaAsignada = cuenta;
        await client.query(
          `UPDATE inventario_cuentas SET estado='asignada', asignada_a=$1, asignada_en=now() WHERE id=$2`,
          [req.user.id, cuenta.id]
        );
      }

      await client.query('UPDATE usuarios SET saldo = $1, actualizado_en = now() WHERE id = $2', [nuevoSaldo, req.user.id]);

      const compraResult = await client.query(
        `INSERT INTO compras (usuario_id, producto_id, producto_nombre, precio, inventario_id, estado)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, creado_en`,
        [req.user.id, producto_id, producto_nombre, precio, inventarioId, estadoCompra]
      );

      await client.query(
        `INSERT INTO movimientos_saldo (usuario_id, tipo, monto, saldo_resultante, descripcion)
         VALUES ($1,'compra',$2,$3,$4)`,
        [req.user.id, -precio, nuevoSaldo, `Compra: ${producto_nombre}`]
      );

      await client.query('COMMIT');

      res.json({
        ok: true,
        saldo: nuevoSaldo,
        compra: {
          id: compraResult.rows[0].id,
          producto_nombre,
          precio,
          estado: estadoCompra,
          creado_en: compraResult.rows[0].creado_en,
          cuenta: cuentaAsignada ? {
            usuario: cuentaAsignada.cuenta_usuario,
            password: cuentaAsignada.cuenta_password,
            perfil: cuentaAsignada.perfil,
            notas: cuentaAsignada.notas,
          } : null,
        },
      });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('[comprar] Error:', e.message);
      res.status(500).json({ ok: false, mensaje: 'Error al procesar la compra. Intenta de nuevo.' });
    } finally {
      client.release();
    }
  }
);

// PANEL ADMIN: listar usuarios
router.get('/admin/usuarios', requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nombre, correo, telefono, rol, saldo, activo, creado_en
       FROM usuarios ORDER BY creado_en DESC LIMIT 500`
    );
    res.json({ ok: true, usuarios: result.rows });
  } catch (e) {
    console.error('[admin/usuarios] Error:', e.message);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener usuarios' });
  }
});

// PANEL ADMIN: recargar saldo
router.post('/admin/recargar',
  requireAdmin,
  [
    body('usuario_id').isUUID(),
    body('monto').isInt({ min: 1, max: 10000000 }),
    body('descripcion').optional().isString().trim().isLength({ max: 300 }),
  ],
  validar,
  async (req, res) => {
    const { usuario_id, monto, descripcion } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const userResult = await client.query('SELECT saldo FROM usuarios WHERE id = $1 FOR UPDATE', [usuario_id]);
      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      }
      const nuevoSaldo = userResult.rows[0].saldo + monto;
      await client.query('UPDATE usuarios SET saldo = $1, actualizado_en = now() WHERE id = $2', [nuevoSaldo, usuario_id]);
      await client.query(
        `INSERT INTO movimientos_saldo (usuario_id, tipo, monto, saldo_resultante, descripcion, realizado_por)
         VALUES ($1,'recarga',$2,$3,$4,$5)`,
        [usuario_id, monto, nuevoSaldo, descripcion || 'Recarga manual por administrador', req.user.id]
      );
      await client.query('COMMIT');
      res.json({ ok: true, saldo: nuevoSaldo });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('[admin/recargar] Error:', e.message);
      res.status(500).json({ ok: false, mensaje: 'Error al recargar saldo' });
    } finally {
      client.release();
    }
  }
);

// PANEL ADMIN: agregar cuentas al inventario
router.post('/admin/inventario',
  requireAdmin,
  [
    body('producto_id').isString().trim().isLength({ min: 1, max: 100 }),
    body('producto_nombre').isString().trim().isLength({ min: 1, max: 200 }),
    body('cuenta_usuario').isString().trim().isLength({ min: 1, max: 200 }),
    body('cuenta_password').isString().trim().isLength({ min: 1, max: 200 }),
    body('perfil').optional().isString().trim().isLength({ max: 100 }),
    body('notas').optional().isString().trim().isLength({ max: 1000 }),
  ],
  validar,
  async (req, res) => {
    try {
      const { producto_id, producto_nombre, cuenta_usuario, cuenta_password, perfil, notas } = req.body;
      const result = await query(
        `INSERT INTO inventario_cuentas (producto_id, producto_nombre, cuenta_usuario, cuenta_password, perfil, notas)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [producto_id, producto_nombre, cuenta_usuario, cuenta_password, perfil || null, notas || null]
      );
      res.json({ ok: true, id: result.rows[0].id });
    } catch (e) {
      console.error('[admin/inventario POST] Error:', e.message);
      res.status(500).json({ ok: false, mensaje: 'Error al agregar al inventario' });
    }
  }
);

// PANEL ADMIN: ver resumen de inventario
router.get('/admin/inventario', requireAdmin, async (req, res) => {
  try {
    const resumen = await query(
      `SELECT producto_id, producto_nombre,
              COUNT(*) FILTER (WHERE estado='disponible') as disponibles,
              COUNT(*) FILTER (WHERE estado='asignada') as asignadas
       FROM inventario_cuentas GROUP BY producto_id, producto_nombre ORDER BY producto_nombre`
    );
    res.json({ ok: true, resumen: resumen.rows });
  } catch (e) {
    console.error('[admin/inventario GET] Error:', e.message);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener inventario' });
  }
});

module.exports = router;
