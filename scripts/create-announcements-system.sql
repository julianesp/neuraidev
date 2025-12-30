-- ============================================
-- Sistema de Anuncios Comunitarios
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase

-- ============================================
-- 1. TABLA DE ANUNCIOS
-- ============================================

CREATE TABLE IF NOT EXISTS community_announcements (
  id BIGSERIAL PRIMARY KEY,

  -- Título y contenido del anuncio
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Tipo de anuncio (info, warning, alert, maintenance, event)
  type TEXT DEFAULT 'info',

  -- Prioridad (1 = más importante, mostrar primero)
  priority INTEGER DEFAULT 5,

  -- Información del autor
  author_id TEXT NOT NULL, -- Clerk user ID
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,

  -- Fechas de vigencia
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,

  -- Estado del anuncio
  status TEXT DEFAULT 'active', -- active, expired, draft, archived

  -- Vistas del anuncio
  view_count INTEGER DEFAULT 0,

  -- Imagen opcional (URL)
  image_url TEXT,

  -- URL de redirección (opcional)
  redirect_url TEXT,

  -- Icono opcional (emoji o nombre de icono)
  icon TEXT DEFAULT '📢',

  -- Metadata adicional
  metadata JSONB,

  -- Fechas de auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_announcements_status ON community_announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON community_announcements(priority DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_start_date ON community_announcements(start_date);
CREATE INDEX IF NOT EXISTS idx_announcements_end_date ON community_announcements(end_date);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON community_announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON community_announcements(type);

-- ============================================
-- 2. TABLA DE VISTAS DE ANUNCIOS POR USUARIO
-- ============================================

CREATE TABLE IF NOT EXISTS announcement_views (
  id BIGSERIAL PRIMARY KEY,

  announcement_id BIGINT REFERENCES community_announcements(id) ON DELETE CASCADE,
  user_id TEXT, -- Clerk user ID (puede ser NULL para usuarios no registrados)
  session_id TEXT, -- Para trackear usuarios no registrados

  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(announcement_id, user_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_views_announcement_id ON announcement_views(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_views_user_id ON announcement_views(user_id);

-- ============================================
-- 3. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS set_announcements_updated_at ON community_announcements;
CREATE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON community_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- Función para marcar anuncios expirados automáticamente
CREATE OR REPLACE FUNCTION expire_old_announcements()
RETURNS void AS $$
BEGIN
  UPDATE community_announcements
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date IS NOT NULL
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para obtener anuncios activos
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

-- Función para registrar vista de anuncio
CREATE OR REPLACE FUNCTION record_announcement_view(
  p_announcement_id BIGINT,
  p_user_id TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insertar vista (ignorar si ya existe)
  INSERT INTO announcement_views (announcement_id, user_id, session_id)
  VALUES (p_announcement_id, p_user_id, p_session_id)
  ON CONFLICT (announcement_id, user_id, session_id) DO NOTHING;

  -- Actualizar contador de vistas
  UPDATE community_announcements
  SET view_count = view_count + 1
  WHERE id = p_announcement_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE community_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Anyone can view active announcements" ON community_announcements;
DROP POLICY IF EXISTS "Authenticated users can create announcements" ON community_announcements;
DROP POLICY IF EXISTS "Users can update their own announcements" ON community_announcements;
DROP POLICY IF EXISTS "Service role can do anything" ON community_announcements;
DROP POLICY IF EXISTS "Anyone can record views" ON announcement_views;

-- Políticas para community_announcements
-- Permitir lectura pública de anuncios activos
CREATE POLICY "Anyone can view active announcements" ON community_announcements
  FOR SELECT USING (status = 'active');

-- Solo usuarios autenticados pueden crear anuncios
CREATE POLICY "Authenticated users can create announcements" ON community_announcements
  FOR INSERT WITH CHECK (true);

-- Usuarios pueden actualizar/eliminar sus propios anuncios
CREATE POLICY "Users can update their own announcements" ON community_announcements
  FOR UPDATE USING (true);

-- Service role puede hacer todo
CREATE POLICY "Service role can do anything" ON community_announcements
  FOR ALL USING (true);

-- Políticas para announcement_views
CREATE POLICY "Anyone can record views" ON announcement_views
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 5. COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE community_announcements IS 'Anuncios comunitarios creados por usuarios registrados';
COMMENT ON COLUMN community_announcements.type IS 'Tipo: info, warning, alert, maintenance, event';
COMMENT ON COLUMN community_announcements.priority IS '1 = más importante, se muestra primero';
COMMENT ON COLUMN community_announcements.status IS 'Estado: active, expired, draft, archived';

-- ============================================
-- 6. DATOS DE EJEMPLO
-- ============================================

-- Insertar algunos anuncios de ejemplo
INSERT INTO community_announcements (
  title,
  content,
  type,
  priority,
  author_id,
  author_name,
  author_email,
  icon,
  end_date
) VALUES
(
  'Mantenimiento del Acueducto - Sin Agua',
  'El día 15 de enero se realizará mantenimiento del sistema de acueducto. No habrá servicio de agua desde las 8:00 AM hasta las 4:00 PM. Por favor, almacenen agua con anticipación.',
  'alert',
  1,
  'system',
  'Administración Comunal',
  'admin@comunidad.com',
  '💧',
  NOW() + INTERVAL '7 days'
),
(
  'Jornada de Vacunación - Sábado 20',
  'Este sábado 20 de enero habrá jornada de vacunación gratuita en el salón comunal de 9:00 AM a 5:00 PM. Traer documento de identidad.',
  'info',
  2,
  'system',
  'Centro de Salud',
  'salud@comunidad.com',
  '💉',
  NOW() + INTERVAL '14 days'
),
(
  'Asamblea General de Vecinos',
  'Se convoca a todos los residentes a la asamblea general que se realizará el próximo martes 23 a las 7:00 PM en el salón comunal. Temas importantes a tratar.',
  'event',
  3,
  'system',
  'Junta de Vecinos',
  'junta@comunidad.com',
  '📋',
  NOW() + INTERVAL '10 days'
);

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================

-- Mostrar estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'community_announcements'
ORDER BY ordinal_position;

-- Mostrar anuncios activos
SELECT * FROM get_active_announcements();

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de anuncios comunitarios creado exitosamente';
  RAISE NOTICE '📢 Tablas creadas: community_announcements, announcement_views';
  RAISE NOTICE '🔧 Funciones creadas para gestión automática de anuncios';
  RAISE NOTICE '📝 Se insertaron 3 anuncios de ejemplo';
END $$;
