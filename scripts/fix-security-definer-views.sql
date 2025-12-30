-- ========================================
-- FIX: Eliminar SECURITY DEFINER de vistas
-- ========================================
-- Este script corrige el problema de seguridad detectado por Supabase
-- donde las vistas con SECURITY DEFINER pueden bypass RLS
-- Fecha: 2025-12-30

-- ========================================
-- 1. Recrear vista: product_stats
-- ========================================
-- Reemplazar con SECURITY INVOKER para respetar permisos del usuario

DROP VIEW IF EXISTS product_stats;

CREATE OR REPLACE VIEW product_stats
WITH (security_invoker = true) AS
SELECT
  p.id as producto_id,
  p.nombre as producto_nombre,
  COUNT(DISTINCT pl.id) as total_likes,
  COUNT(DISTINCT pc.id) as total_comments,
  AVG(pc.rating) as average_rating,
  COUNT(DISTINCT pc.id) FILTER (WHERE pc.created_at >= NOW() - INTERVAL '7 days') as comments_last_week
FROM products p
LEFT JOIN product_likes pl ON p.id = pl.producto_id
LEFT JOIN product_comments pc ON p.id = pc.producto_id AND pc.is_deleted = FALSE
GROUP BY p.id, p.nombre;

-- ========================================
-- 2. Recrear vista: comments_with_likes
-- ========================================
-- Reemplazar con SECURITY INVOKER para respetar permisos del usuario

DROP VIEW IF EXISTS comments_with_likes;

CREATE OR REPLACE VIEW comments_with_likes
WITH (security_invoker = true) AS
SELECT
  pc.*,
  COUNT(cl.id) as likes_count
FROM product_comments pc
LEFT JOIN comment_likes cl ON pc.id = cl.comment_id
WHERE pc.is_deleted = FALSE
GROUP BY pc.id;

-- ========================================
-- 3. Recrear vista: solicitudes_eliminacion_stats
-- ========================================
-- Reemplazar con SECURITY INVOKER para respetar permisos del usuario

DROP VIEW IF EXISTS solicitudes_eliminacion_stats;

CREATE OR REPLACE VIEW solicitudes_eliminacion_stats
WITH (security_invoker = true) AS
SELECT
  estado,
  COUNT(*) as total,
  COUNT(CASE WHEN fecha_solicitud > NOW() - INTERVAL '30 days' THEN 1 END) as ultimos_30_dias,
  COUNT(CASE WHEN fecha_solicitud > NOW() - INTERVAL '7 days' THEN 1 END) as ultimos_7_dias,
  AVG(EXTRACT(EPOCH FROM (COALESCE(fecha_completado, NOW()) - fecha_solicitud)) / 86400)::numeric(10,2) as dias_promedio_procesamiento
FROM solicitudes_eliminacion
GROUP BY estado;

-- ========================================
-- 4. Verificar que las vistas se crearon correctamente
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Vistas recreadas con SECURITY INVOKER';
  RAISE NOTICE '🔍 Verifica que las vistas están disponibles:';
  RAISE NOTICE '   - product_stats';
  RAISE NOTICE '   - comments_with_likes';
  RAISE NOTICE '   - solicitudes_eliminacion_stats';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Las vistas ahora respetan RLS y permisos del usuario que consulta';
END $$;

-- ========================================
-- 5. Verificar configuración de seguridad
-- ========================================

-- Mostrar información de las vistas para confirmar
SELECT
  schemaname,
  viewname,
  viewowner
FROM pg_views
WHERE viewname IN ('product_stats', 'comments_with_likes', 'solicitudes_eliminacion_stats');
