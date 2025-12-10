-- Script para agregar soporte de video a los productos
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columna para almacenar la URL del video
ALTER TABLE products
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Agregar columna para el tipo de video (youtube, vimeo, directo)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) DEFAULT 'direct';

-- Agregar comentarios para documentación
COMMENT ON COLUMN products.video_url IS 'URL del video de presentación del producto. Puede ser YouTube, Vimeo o un archivo directo';
COMMENT ON COLUMN products.video_type IS 'Tipo de video: youtube, vimeo, direct (archivo subido directamente)';

-- Crear índice para búsqueda rápida de productos con video
CREATE INDEX IF NOT EXISTS idx_products_video ON products(video_url) WHERE video_url IS NOT NULL;
