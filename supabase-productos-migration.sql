-- ============================================
-- ACTUALIZACIÓN DE TABLA PRODUCTOS PARA NEURAI.DEV
-- ============================================

-- Modificar la tabla products para que sea compatible con los datos actuales de JSON
-- Hacemos que store_id sea opcional para usar como tienda única

ALTER TABLE products ALTER COLUMN store_id DROP NOT NULL;

-- Agregar columnas adicionales que están en tus archivos JSON
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS imagen_principal TEXT,
  ADD COLUMN IF NOT EXISTS marca TEXT,
  ADD COLUMN IF NOT EXISTS garantia INTEGER,
  ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'nuevo',
  ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS fecha_ingreso DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS cantidad INTEGER DEFAULT 0;

-- Cambiar el nombre de "imagenes" a algo más específico y agregar imagen principal
-- (ya tenemos imagenes como TEXT[])

-- Crear índices adicionales para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_disponible ON products(disponible);
CREATE INDEX IF NOT EXISTS idx_products_marca ON products(marca);
CREATE INDEX IF NOT EXISTS idx_products_fecha_ingreso ON products(fecha_ingreso);

-- Actualizar política RLS para permitir ver productos sin store_id (tienda única)
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (
    activo = true AND disponible = true AND
    (store_id IN (SELECT id FROM stores WHERE activa = true) OR store_id IS NULL)
  );

-- Comentario: Los productos con store_id NULL son de la tienda principal (neurai.dev)
COMMENT ON COLUMN products.store_id IS 'ID de la tienda (NULL para tienda principal neurai.dev)';
