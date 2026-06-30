-- ════════════════════════════════════════════════════════════════════════════
-- DIGITAL MARKET - Esquema de base de datos
-- Sistema de usuarios, saldo, compras y movimientos
-- Supabase ya incluye gen_random_uuid() nativamente, sin necesitar pgcrypto
-- ════════════════════════════════════════════════════════════════════════════

-- ─── USUARIOS (clientes y administradores) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(30),
  rol VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente','admin')),
  saldo INTEGER NOT NULL DEFAULT 0 CHECK (saldo >= 0), -- saldo en pesos COP, siempre entero, nunca negativo
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);

-- ─── INVENTARIO DE CUENTAS (stock de usuario/contraseña/perfil por producto) ──
CREATE TABLE IF NOT EXISTS inventario_cuentas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id VARCHAR(100) NOT NULL,      -- coincide con el id del producto en el catálogo del frontend
  producto_nombre VARCHAR(200) NOT NULL,
  cuenta_usuario VARCHAR(200) NOT NULL,
  cuenta_password VARCHAR(200) NOT NULL,
  perfil VARCHAR(100),                     -- ej. "Perfil 2", "Pantalla 3"
  notas TEXT,                              -- instrucciones extra para el cliente
  estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible','asignada','agotada')),
  asignada_a UUID REFERENCES usuarios(id),
  asignada_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventario_producto_estado ON inventario_cuentas(producto_id, estado);

-- ─── COMPRAS (cada vez que un cliente compra con saldo) ───────────────────────
CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  producto_id VARCHAR(100) NOT NULL,
  producto_nombre VARCHAR(200) NOT NULL,
  precio INTEGER NOT NULL,
  inventario_id UUID REFERENCES inventario_cuentas(id), -- qué cuenta específica se le asignó
  estado VARCHAR(20) NOT NULL DEFAULT 'completada' CHECK (estado IN ('completada','sin_stock','cancelada')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compras_usuario ON compras(usuario_id);

-- ─── MOVIMIENTOS DE SALDO (historial: recargas, compras, ajustes) ─────────────
CREATE TABLE IF NOT EXISTS movimientos_saldo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('recarga','compra','ajuste','reembolso')),
  monto INTEGER NOT NULL,             -- positivo = entra saldo, negativo = sale saldo
  saldo_resultante INTEGER NOT NULL,  -- saldo del usuario justo después de este movimiento
  descripcion TEXT,
  realizado_por UUID REFERENCES usuarios(id), -- qué admin hizo la recarga (null si fue el sistema/compra)
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_usuario ON movimientos_saldo(usuario_id);

-- ─── SESIONES (para poder invalidar tokens si es necesario) ───────────────────
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  token_hash VARCHAR(255) NOT NULL,
  expira_en TIMESTAMPTZ NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);

-- MIGRACION: campos adicionales para inventario
ALTER TABLE inventario_cuentas ADD COLUMN IF NOT EXISTS pin VARCHAR(50);
ALTER TABLE inventario_cuentas ADD COLUMN IF NOT EXISTS servidor VARCHAR(500);
