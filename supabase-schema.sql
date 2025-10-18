-- ============================================
-- SCHEMA DE BASE DE DATOS PARA SISTEMA MULTI-TENANT
-- Neurai.dev - Sistema de Tiendas Online
-- ============================================

-- IMPORTANTE: Ejecuta estos scripts en el SQL Editor de Supabase
-- https://app.supabase.com/project/_/sql

-- ============================================
-- 1. TABLA DE PERFILES DE USUARIOS
-- ============================================
-- Extiende la información del usuario de Clerk con datos adicionales
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  nombre_completo TEXT,
  telefono TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda rápida por clerk_user_id
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);

-- ============================================
-- 2. TABLA DE TIENDAS
-- ============================================
-- Cada usuario puede tener una o más tiendas
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nombre_tienda TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  logo_url TEXT,
  banner_url TEXT,
  dominio_personalizado TEXT,
  activa BOOLEAN DEFAULT true,
  configuracion JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_stores_profile_id ON stores(profile_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_activa ON stores(activa);

-- ============================================
-- 3. TABLA DE PRODUCTOS
-- ============================================
-- Los productos pertenecen a una tienda específica
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  precio_oferta DECIMAL(10, 2),
  categoria TEXT,
  subcategoria TEXT,
  imagenes TEXT[], -- Array de URLs de imágenes
  stock INTEGER DEFAULT 0,
  sku TEXT,
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria);
CREATE INDEX IF NOT EXISTS idx_products_activo ON products(activo);
CREATE INDEX IF NOT EXISTS idx_products_destacado ON products(destacado);

-- ============================================
-- 4. TABLA DE PEDIDOS/ÓRDENES
-- ============================================
-- Rastrea todas las órdenes de compra
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  numero_orden TEXT UNIQUE NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT,
  cliente_direccion JSONB,
  items JSONB NOT NULL, -- Array de productos comprados
  subtotal DECIMAL(10, 2) NOT NULL,
  impuestos DECIMAL(10, 2) DEFAULT 0,
  envio DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  estado TEXT DEFAULT 'pendiente', -- pendiente, procesando, enviado, entregado, cancelado
  metodo_pago TEXT,
  estado_pago TEXT DEFAULT 'pendiente', -- pendiente, pagado, fallido, reembolsado
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_numero_orden ON orders(numero_orden);
CREATE INDEX IF NOT EXISTS idx_orders_estado ON orders(estado);
CREATE INDEX IF NOT EXISTS idx_orders_estado_pago ON orders(estado_pago);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA PROFILES
-- ============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- POLÍTICAS PARA STORES
-- ============================================

-- Todos pueden ver tiendas activas (público)
CREATE POLICY "Anyone can view active stores"
  ON stores
  FOR SELECT
  USING (activa = true);

-- Los propietarios pueden ver sus propias tiendas (incluso inactivas)
CREATE POLICY "Owners can view own stores"
  ON stores
  FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Los propietarios pueden crear tiendas
CREATE POLICY "Owners can create stores"
  ON stores
  FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Los propietarios pueden actualizar sus propias tiendas
CREATE POLICY "Owners can update own stores"
  ON stores
  FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Los propietarios pueden eliminar sus propias tiendas
CREATE POLICY "Owners can delete own stores"
  ON stores
  FOR DELETE
  USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ============================================
-- POLÍTICAS PARA PRODUCTS
-- ============================================

-- Todos pueden ver productos activos de tiendas activas (público)
CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (
    activo = true AND
    store_id IN (SELECT id FROM stores WHERE activa = true)
  );

-- Los propietarios pueden ver todos sus productos
CREATE POLICY "Owners can view own products"
  ON products
  FOR SELECT
  USING (
    store_id IN (
      SELECT s.id FROM stores s
      INNER JOIN profiles p ON s.profile_id = p.id
      WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Los propietarios pueden crear productos en sus tiendas
CREATE POLICY "Owners can create products"
  ON products
  FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT s.id FROM stores s
      INNER JOIN profiles p ON s.profile_id = p.id
      WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Los propietarios pueden actualizar sus productos
CREATE POLICY "Owners can update own products"
  ON products
  FOR UPDATE
  USING (
    store_id IN (
      SELECT s.id FROM stores s
      INNER JOIN profiles p ON s.profile_id = p.id
      WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Los propietarios pueden eliminar sus productos
CREATE POLICY "Owners can delete own products"
  ON products
  FOR DELETE
  USING (
    store_id IN (
      SELECT s.id FROM stores s
      INNER JOIN profiles p ON s.profile_id = p.id
      WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ============================================
-- POLÍTICAS PARA ORDERS
-- ============================================

-- Los propietarios de tiendas pueden ver sus órdenes
CREATE POLICY "Store owners can view own orders"
  ON orders
  FOR SELECT
  USING (
    store_id IN (
      SELECT s.id FROM stores s
      INNER JOIN profiles p ON s.profile_id = p.id
      WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Cualquiera puede crear una orden (clientes comprando)
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- Solo los propietarios pueden actualizar el estado de sus órdenes
CREATE POLICY "Store owners can update own orders"
  ON orders
  FOR UPDATE
  USING (
    store_id IN (
      SELECT s.id FROM stores s
      INNER JOIN profiles p ON s.profile_id = p.id
      WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

-- NOTA: Después de ejecutar este script:
-- 1. Verifica que todas las tablas se crearon correctamente
-- 2. Verifica que RLS esté habilitado
-- 3. Prueba las políticas con diferentes usuarios
-- 4. Ajusta las políticas según tus necesidades específicas
