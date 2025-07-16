-- Esquema de base de datos PostgreSQL para el sistema de anuncios

-- Tabla principal de anuncios
CREATE TABLE IF NOT EXISTS anuncios (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    link_url TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Información de contacto
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    contact_address TEXT,
    
    -- Campos adicionales para futuras funcionalidades
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Índices para mejorar el rendimiento
    CONSTRAINT chk_category CHECK (category IN ('general', 'restaurant', 'shop', 'service', 'technology', 'health', 'education', 'entertainment'))
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_anuncios_category ON anuncios(category);
CREATE INDEX IF NOT EXISTS idx_anuncios_active ON anuncios(active);
CREATE INDEX IF NOT EXISTS idx_anuncios_featured ON anuncios(featured);
CREATE INDEX IF NOT EXISTS idx_anuncios_created_at ON anuncios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anuncios_expires_at ON anuncios(expires_at);

-- Índice compuesto para consultas comunes
CREATE INDEX IF NOT EXISTS idx_anuncios_active_featured ON anuncios(active, featured, created_at DESC);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_anuncios_updated_at 
    BEFORE UPDATE ON anuncios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabla de categorías (opcional, para expandir funcionalidades)
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías por defecto
INSERT INTO categorias (name, display_name, description) VALUES 
('general', 'General', 'Anuncios generales'),
('restaurant', 'Restaurante', 'Restaurantes y comida'),
('shop', 'Tienda', 'Tiendas y comercio'),
('service', 'Servicio', 'Servicios profesionales'),
('technology', 'Tecnología', 'Tecnología y electrónicos'),
('health', 'Salud', 'Servicios de salud'),
('education', 'Educación', 'Servicios educativos'),
('entertainment', 'Entretenimiento', 'Entretenimiento y recreación');

-- Tabla de estadísticas de anuncios (para analytics)
CREATE TABLE IF NOT EXISTS anuncio_stats (
    id SERIAL PRIMARY KEY,
    anuncio_id INTEGER NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL, -- 'view', 'click', 'contact'
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    count INTEGER DEFAULT 1,
    
    -- Índices para evitar duplicados y optimizar consultas
    UNIQUE(anuncio_id, event_type, event_date)
);

CREATE INDEX IF NOT EXISTS idx_anuncio_stats_anuncio_id ON anuncio_stats(anuncio_id);
CREATE INDEX IF NOT EXISTS idx_anuncio_stats_event_date ON anuncio_stats(event_date DESC);

-- Tabla de usuarios administradores (opcional)
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tabla de audit log para cambios en anuncios
CREATE TABLE IF NOT EXISTS anuncio_audit_log (
    id SERIAL PRIMARY KEY,
    anuncio_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE'
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER REFERENCES admin_users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_anuncio_id ON anuncio_audit_log(anuncio_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON anuncio_audit_log(changed_at DESC);

-- Función para insertar datos de ejemplo
CREATE OR REPLACE FUNCTION insert_sample_data()
RETURNS VOID AS $$
BEGIN
    INSERT INTO anuncios (
        business_name, 
        description, 
        image_url, 
        link_url, 
        category, 
        featured, 
        contact_phone, 
        contact_email, 
        contact_address
    ) VALUES 
    (
        'Café Central',
        'El mejor café de la ciudad. Disfruta de nuestros granos artesanales y ambiente acogedor.',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        'https://cafe-central.com',
        'restaurant',
        true,
        '+57 300 123 4567',
        'info@cafecentral.com',
        'Calle 10 #15-30, Centro'
    ),
    (
        'TechnoStore',
        'Tecnología de última generación. Computadores, celulares y accesorios al mejor precio.',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        'https://technostore.com',
        'technology',
        false,
        '+57 310 987 6543',
        'ventas@technostore.com',
        'Centro Comercial Plaza, Local 201'
    ),
    (
        'Clínica Salud Integral',
        'Servicios médicos especializados. Consulta general, odontología y medicina estética.',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        '',
        'health',
        true,
        '+57 320 555 1234',
        'citas@saludintegral.com',
        'Avenida Salud #25-40'
    );
END;
$$ LANGUAGE plpgsql;

-- Vistas útiles para reportes
CREATE VIEW anuncios_with_stats AS
SELECT 
    a.*,
    COALESCE(views.total_views, 0) as total_views,
    COALESCE(clicks.total_clicks, 0) as total_clicks,
    COALESCE(contacts.total_contacts, 0) as total_contacts
FROM anuncios a
LEFT JOIN (
    SELECT anuncio_id, SUM(count) as total_views 
    FROM anuncio_stats 
    WHERE event_type = 'view' 
    GROUP BY anuncio_id
) views ON a.id = views.anuncio_id
LEFT JOIN (
    SELECT anuncio_id, SUM(count) as total_clicks 
    FROM anuncio_stats 
    WHERE event_type = 'click' 
    GROUP BY anuncio_id
) clicks ON a.id = clicks.anuncio_id
LEFT JOIN (
    SELECT anuncio_id, SUM(count) as total_contacts 
    FROM anuncio_stats 
    WHERE event_type = 'contact' 
    GROUP BY anuncio_id
) contacts ON a.id = contacts.anuncio_id;

-- Vista para anuncios activos y públicos
CREATE VIEW anuncios_publicos AS
SELECT 
    id,
    business_name,
    description,
    image_url,
    link_url,
    category,
    featured,
    contact_phone,
    contact_email,
    contact_address,
    created_at
FROM anuncios 
WHERE active = true 
AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
ORDER BY featured DESC, created_at DESC;

-- Funciones de utilidad para la aplicación

-- Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_anuncio_view(anuncio_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO anuncio_stats (anuncio_id, event_type, event_date, count)
    VALUES (anuncio_id_param, 'view', CURRENT_DATE, 1)
    ON CONFLICT (anuncio_id, event_type, event_date)
    DO UPDATE SET count = anuncio_stats.count + 1;
    
    UPDATE anuncios SET views_count = views_count + 1 WHERE id = anuncio_id_param;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar clicks
CREATE OR REPLACE FUNCTION increment_anuncio_click(anuncio_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO anuncio_stats (anuncio_id, event_type, event_date, count)
    VALUES (anuncio_id_param, 'click', CURRENT_DATE, 1)
    ON CONFLICT (anuncio_id, event_type, event_date)
    DO UPDATE SET count = anuncio_stats.count + 1;
    
    UPDATE anuncios SET clicks_count = clicks_count + 1 WHERE id = anuncio_id_param;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas generales
CREATE OR REPLACE FUNCTION get_general_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_anuncios', (SELECT COUNT(*) FROM anuncios),
        'anuncios_activos', (SELECT COUNT(*) FROM anuncios WHERE active = true),
        'anuncios_destacados', (SELECT COUNT(*) FROM anuncios WHERE featured = true AND active = true),
        'anuncios_inactivos', (SELECT COUNT(*) FROM anuncios WHERE active = false),
        'total_vistas', (SELECT COALESCE(SUM(views_count), 0) FROM anuncios),
        'total_clicks', (SELECT COALESCE(SUM(clicks_count), 0) FROM anuncios),
        'categorias_count', (
            SELECT json_object_agg(category, count)
            FROM (
                SELECT category, COUNT(*) as count 
                FROM anuncios 
                WHERE active = true 
                GROUP BY category
            ) t
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Configuración de políticas de seguridad (RLS) - opcional
-- ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;

-- Ejecutar función de datos de ejemplo (comentar en producción)
-- SELECT insert_sample_data();

-- Comentarios sobre el esquema
COMMENT ON TABLE anuncios IS 'Tabla principal que almacena todos los anuncios del sistema';
COMMENT ON COLUMN anuncios.business_name IS 'Nombre del negocio o anunciante';
COMMENT ON COLUMN anuncios.description IS 'Descripción detallada del anuncio';
COMMENT ON COLUMN anuncios.featured IS 'Indica si el anuncio es destacado (aparece primero)';
COMMENT ON COLUMN anuncios.expires_at IS 'Fecha de expiración del anuncio (NULL = sin expiración)';
COMMENT ON TABLE anuncio_stats IS 'Tabla para tracking de estadísticas de los anuncios';
COMMENT ON TABLE anuncio_audit_log IS 'Log de auditoría para todos los cambios en anuncios';