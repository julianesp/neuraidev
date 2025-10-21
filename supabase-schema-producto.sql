-- ============================================
-- CREAR TABLA PRODUCTO EN SUPABASE
-- ============================================
-- Ejecuta este script en Supabase Dashboard > SQL Editor
-- O desde la terminal si tienes CLI de Supabase

-- 1. Crear la tabla Producto
CREATE TABLE IF NOT EXISTS public."Producto" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    cantidad INTEGER NOT NULL DEFAULT 0,
    categoria VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    disponible BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    "imagenPrincipal" TEXT,
    imagenes JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_producto_categoria ON public."Producto"(categoria);
CREATE INDEX IF NOT EXISTS idx_producto_disponible ON public."Producto"(disponible);
CREATE INDEX IF NOT EXISTS idx_producto_destacado ON public."Producto"(destacado);
CREATE INDEX IF NOT EXISTS idx_producto_sku ON public."Producto"(sku);

-- 3. Crear función para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para actualizar updatedAt
DROP TRIGGER IF EXISTS update_producto_updated_at ON public."Producto";
CREATE TRIGGER update_producto_updated_at
    BEFORE UPDATE ON public."Producto"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public."Producto" ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas de seguridad

-- Política: Cualquiera puede VER productos disponibles
CREATE POLICY "Productos disponibles son visibles públicamente"
    ON public."Producto"
    FOR SELECT
    USING (disponible = true);

-- Política: Usuarios autenticados pueden ver TODOS los productos
CREATE POLICY "Usuarios autenticados pueden ver todos los productos"
    ON public."Producto"
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: Usuarios autenticados pueden INSERTAR productos
CREATE POLICY "Usuarios autenticados pueden insertar productos"
    ON public."Producto"
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política: Usuarios autenticados pueden ACTUALIZAR productos
CREATE POLICY "Usuarios autenticados pueden actualizar productos"
    ON public."Producto"
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política: Usuarios autenticados pueden ELIMINAR productos
CREATE POLICY "Usuarios autenticados pueden eliminar productos"
    ON public."Producto"
    FOR DELETE
    TO authenticated
    USING (true);

-- 7. Insertar productos de ejemplo (OPCIONAL - comenta si no los quieres)
INSERT INTO public."Producto" (nombre, descripcion, precio, stock, cantidad, categoria, sku, disponible, destacado)
VALUES
    ('Laptop HP Pavilion', 'Laptop HP Pavilion 15.6" Intel Core i5 8GB RAM 256GB SSD', 2500000, 5, 5, 'computadoras', 'HP-PAV-001', true, true),
    ('Mouse Logitech', 'Mouse inalámbrico Logitech M170', 45000, 20, 20, 'computadoras', 'LOG-M170-001', true, false),
    ('Teclado Mecánico RGB', 'Teclado mecánico gaming con iluminación RGB', 180000, 10, 10, 'computadoras', 'TEC-RGB-001', true, true),
    ('Funda Samsung S21', 'Funda protectora para Samsung Galaxy S21', 25000, 30, 30, 'celulares', 'FUND-S21-001', true, false),
    ('Cargador Rápido', 'Cargador rápido 25W USB-C', 35000, 15, 15, 'celulares', 'CARG-25W-001', true, false)
ON CONFLICT (sku) DO NOTHING;

-- ============================================
-- VERIFICAR QUE TODO FUNCIONA
-- ============================================
-- Ejecuta esta query para verificar:
-- SELECT COUNT(*) as total_productos FROM public."Producto";
-- SELECT * FROM public."Producto" LIMIT 5;
