-- 📹 EJEMPLO: Cómo agregar video a un producto existente
-- Copia y pega este script en Supabase SQL Editor

-- ====================================
-- PASO 1: Ver productos sin video
-- ====================================
SELECT id, title, video_url, video_type
FROM products
WHERE video_url IS NULL
LIMIT 10;

-- ====================================
-- PASO 2: Agregar video de YouTube a un producto
-- ====================================

-- Reemplaza 'ID_DEL_PRODUCTO' con el ID real de tu producto
UPDATE products
SET
  video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  video_type = 'youtube',
  updated_at = NOW()
WHERE id = 'ID_DEL_PRODUCTO';  -- ⬅️ CAMBIA ESTO

-- ====================================
-- PASO 3: Verificar que se guardó correctamente
-- ====================================
SELECT id, title, video_url, video_type
FROM products
WHERE video_url IS NOT NULL;

-- ====================================
-- EJEMPLOS ADICIONALES
-- ====================================

-- Ejemplo 1: Video directo desde Supabase Storage
UPDATE products
SET
  video_url = 'https://abc123.supabase.co/storage/v1/object/public/product-videos/demo.mp4',
  video_type = 'direct',
  updated_at = NOW()
WHERE title = 'iPhone 15 Pro Max';

-- Ejemplo 2: Video de Vimeo
UPDATE products
SET
  video_url = 'https://vimeo.com/123456789',
  video_type = 'vimeo',
  updated_at = NOW()
WHERE title = 'Samsung Galaxy S24';

-- Ejemplo 3: Agregar video a múltiples productos de una categoría
UPDATE products
SET
  video_url = 'https://youtu.be/ABC123',
  video_type = 'youtube',
  updated_at = NOW()
WHERE categoria = 'celulares' AND video_url IS NULL;

-- ====================================
-- ELIMINAR VIDEO DE UN PRODUCTO
-- ====================================
UPDATE products
SET
  video_url = NULL,
  video_type = NULL,
  updated_at = NOW()
WHERE id = 'ID_DEL_PRODUCTO';  -- ⬅️ CAMBIA ESTO

-- ====================================
-- ESTADÍSTICAS DE VIDEOS
-- ====================================

-- Ver cuántos productos tienen video
SELECT
  COUNT(*) as total_productos,
  COUNT(video_url) as productos_con_video,
  COUNT(*) - COUNT(video_url) as productos_sin_video
FROM products;

-- Ver productos por tipo de video
SELECT
  video_type,
  COUNT(*) as cantidad
FROM products
WHERE video_url IS NOT NULL
GROUP BY video_type;

-- Ver productos por categoría con video
SELECT
  categoria,
  COUNT(*) as total,
  COUNT(video_url) as con_video
FROM products
GROUP BY categoria
ORDER BY categoria;
