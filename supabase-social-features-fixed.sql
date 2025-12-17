-- =====================================================
-- SISTEMA DE COMENTARIOS Y LIKES PARA PRODUCTOS
-- Base de datos: Supabase (PostgreSQL)
-- VERSIÓN CORREGIDA PARA TABLA "products"
-- =====================================================

-- =====================================================
-- TABLA: product_comments
-- Almacena los comentarios de usuarios en productos
-- =====================================================
CREATE TABLE IF NOT EXISTS product_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL,  -- ID del producto desde la tabla products
  user_id TEXT NOT NULL,       -- Clerk user ID
  user_name TEXT NOT NULL,     -- Nombre del usuario
  user_email TEXT,             -- Email del usuario
  user_image TEXT,             -- Foto de perfil del usuario
  comment_text TEXT NOT NULL,  -- Texto del comentario
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- Calificación opcional (1-5 estrellas)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,

  -- Relación con la tabla de productos
  CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_comments_producto ON product_comments(producto_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON product_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON product_comments(created_at DESC);

-- =====================================================
-- TABLA: product_likes
-- Almacena los "me gusta" de usuarios en productos
-- =====================================================
CREATE TABLE IF NOT EXISTS product_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL,  -- ID del producto desde la tabla products
  user_id TEXT NOT NULL,       -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un usuario solo puede dar like una vez por producto
  UNIQUE(producto_id, user_id),

  -- Relación con la tabla de productos
  CONSTRAINT fk_producto_like FOREIGN KEY (producto_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_likes_producto ON product_likes(producto_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON product_likes(user_id);

-- =====================================================
-- TABLA: comment_likes
-- Almacena los "me gusta" en comentarios
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL,    -- ID del comentario
  user_id TEXT NOT NULL,       -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un usuario solo puede dar like una vez por comentario
  UNIQUE(comment_id, user_id),

  -- Relación con la tabla de comentarios
  CONSTRAINT fk_comment FOREIGN KEY (comment_id) REFERENCES product_comments(id) ON DELETE CASCADE
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_id);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para obtener comentarios con conteo de likes
CREATE OR REPLACE VIEW comments_with_likes AS
SELECT
  pc.*,
  COUNT(cl.id) as likes_count
FROM product_comments pc
LEFT JOIN comment_likes cl ON pc.id = cl.comment_id
WHERE pc.is_deleted = FALSE
GROUP BY pc.id;

-- Vista para obtener estadísticas de productos
CREATE OR REPLACE VIEW product_stats AS
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

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en comentarios
DROP TRIGGER IF EXISTS update_product_comments_updated_at ON product_comments;
CREATE TRIGGER update_product_comments_updated_at
BEFORE UPDATE ON product_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener comentarios de un producto con paginación
CREATE OR REPLACE FUNCTION get_product_comments(
  p_producto_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  producto_id UUID,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  user_image TEXT,
  comment_text TEXT,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN,
  likes_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.producto_id,
    pc.user_id,
    pc.user_name,
    pc.user_email,
    pc.user_image,
    pc.comment_text,
    pc.rating,
    pc.created_at,
    pc.updated_at,
    pc.is_edited,
    COUNT(cl.id) as likes_count
  FROM product_comments pc
  LEFT JOIN comment_likes cl ON pc.id = cl.comment_id
  WHERE pc.producto_id = p_producto_id AND pc.is_deleted = FALSE
  GROUP BY pc.id
  ORDER BY pc.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- =====================================================

-- Habilitar RLS en las tablas
ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer comentarios
DROP POLICY IF EXISTS "Cualquiera puede leer comentarios" ON product_comments;
CREATE POLICY "Cualquiera puede leer comentarios" ON product_comments
  FOR SELECT USING (is_deleted = FALSE);

-- Política: Usuarios autenticados pueden crear comentarios
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear comentarios" ON product_comments;
CREATE POLICY "Usuarios autenticados pueden crear comentarios" ON product_comments
  FOR INSERT WITH CHECK (true);

-- Política: Usuarios solo pueden editar sus propios comentarios
DROP POLICY IF EXISTS "Usuarios pueden editar sus comentarios" ON product_comments;
CREATE POLICY "Usuarios pueden editar sus comentarios" ON product_comments
  FOR UPDATE USING (true) WITH CHECK (true);

-- Política: Cualquiera puede leer likes de productos
DROP POLICY IF EXISTS "Cualquiera puede leer likes" ON product_likes;
CREATE POLICY "Cualquiera puede leer likes" ON product_likes
  FOR SELECT USING (true);

-- Política: Usuarios autenticados pueden dar like
DROP POLICY IF EXISTS "Usuarios autenticados pueden dar like" ON product_likes;
CREATE POLICY "Usuarios autenticados pueden dar like" ON product_likes
  FOR INSERT WITH CHECK (true);

-- Política: Usuarios pueden quitar su propio like
DROP POLICY IF EXISTS "Usuarios pueden quitar su like" ON product_likes;
CREATE POLICY "Usuarios pueden quitar su like" ON product_likes
  FOR DELETE USING (true);

-- Política: Cualquiera puede leer likes de comentarios
DROP POLICY IF EXISTS "Cualquiera puede leer likes de comentarios" ON comment_likes;
CREATE POLICY "Cualquiera puede leer likes de comentarios" ON comment_likes
  FOR SELECT USING (true);

-- Política: Usuarios autenticados pueden dar like a comentarios
DROP POLICY IF EXISTS "Usuarios autenticados pueden dar like a comentarios" ON comment_likes;
CREATE POLICY "Usuarios autenticados pueden dar like a comentarios" ON comment_likes
  FOR INSERT WITH CHECK (true);

-- Política: Usuarios pueden quitar su like de comentario
DROP POLICY IF EXISTS "Usuarios pueden quitar su like de comentario" ON comment_likes;
CREATE POLICY "Usuarios pueden quitar su like de comentario" ON comment_likes
  FOR DELETE USING (true);

-- =====================================================
-- CONSULTAS ÚTILES PARA VERIFICACIÓN
-- =====================================================

-- Ver comentarios con likes de un producto (usar UUID del producto)
-- SELECT * FROM get_product_comments('05a01c4d-91bd-49df-8d79-d44ab7aedb01', 10, 0);

-- Ver estadísticas de todos los productos
-- SELECT * FROM product_stats ORDER BY total_likes DESC;

-- Contar comentarios por producto
-- SELECT producto_id, COUNT(*) as total FROM product_comments WHERE is_deleted = FALSE GROUP BY producto_id;

-- Ver usuarios más activos comentando
-- SELECT user_name, COUNT(*) as total_comments FROM product_comments WHERE is_deleted = FALSE GROUP BY user_name ORDER BY total_comments DESC;
