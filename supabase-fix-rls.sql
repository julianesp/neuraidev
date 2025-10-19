-- ============================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA PRODUCTOS
-- ============================================
-- Ejecuta esto en Supabase SQL Editor

-- 1. Eliminar la política antigua que requiere autenticación
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

-- 2. Crear nueva política que permita acceso público a productos
CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  USING (
    -- Permitir ver productos activos y disponibles de la tienda principal
    (store_id IS NULL AND activo = true AND disponible = true)
    OR
    -- O productos de tiendas activas (multi-tenant)
    (store_id IN (SELECT id FROM stores WHERE activa = true) AND activo = true)
  );

-- 3. Política adicional para permitir a usuarios autenticados ver todos los productos
CREATE POLICY "Authenticated users can view all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Puedes probar la consulta después de ejecutar esto:
-- SELECT COUNT(*) FROM products WHERE store_id IS NULL;
