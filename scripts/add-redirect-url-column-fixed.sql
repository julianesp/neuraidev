-- ============================================
-- Agregar columna redirect_url a community_announcements
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase

-- Paso 1: Agregar la columna redirect_url si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_announcements'
    AND column_name = 'redirect_url'
  ) THEN
    ALTER TABLE community_announcements
    ADD COLUMN redirect_url TEXT;

    RAISE NOTICE '✅ Columna redirect_url agregada exitosamente';
  ELSE
    RAISE NOTICE '⚠️  La columna redirect_url ya existe';
  END IF;
END $$;

-- Paso 2: Eliminar la función existente
DROP FUNCTION IF EXISTS get_active_announcements();

-- Paso 3: Recrear la función con el nuevo campo
CREATE OR REPLACE FUNCTION get_active_announcements()
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  content TEXT,
  type TEXT,
  priority INTEGER,
  author_name TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  view_count INTEGER,
  image_url TEXT,
  redirect_url TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Primero expirar los anuncios vencidos
  PERFORM expire_old_announcements();

  -- Retornar anuncios activos ordenados por prioridad y fecha
  RETURN QUERY
  SELECT
    ca.id,
    ca.title,
    ca.content,
    ca.type,
    ca.priority,
    ca.author_name,
    ca.start_date,
    ca.end_date,
    ca.view_count,
    ca.image_url,
    ca.redirect_url,
    ca.icon,
    ca.created_at
  FROM community_announcements ca
  WHERE ca.status = 'active'
    AND (ca.start_date IS NULL OR ca.start_date <= NOW())
    AND (ca.end_date IS NULL OR ca.end_date >= NOW())
  ORDER BY ca.priority ASC, ca.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Verificar que todo funcione
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'community_announcements'
AND column_name = 'redirect_url';

-- Probar la función
SELECT * FROM get_active_announcements();

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada exitosamente';
  RAISE NOTICE '📝 La columna redirect_url está lista para usar';
  RAISE NOTICE '🔧 La función get_active_announcements fue actualizada';
END $$;
