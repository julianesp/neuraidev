-- Crear tabla de administradores
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_super_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de sesiones de admin
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de auditoría para productos
CREATE TABLE IF NOT EXISTS product_audit_log (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    admin_id INTEGER REFERENCES admin_users(id),
    action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_product_audit_product ON product_audit_log(product_id);
CREATE INDEX IF NOT EXISTS idx_product_audit_admin ON product_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_product_audit_created ON product_audit_log(created_at);

-- Actualizar tabla productos si no tiene los campos necesarios
DO $$
BEGIN
    -- Agregar campos si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='disponible') THEN
        ALTER TABLE productos ADD COLUMN disponible BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='cantidad') THEN
        ALTER TABLE productos ADD COLUMN cantidad INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='caracteristicas') THEN
        ALTER TABLE productos ADD COLUMN caracteristicas JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='peso') THEN
        ALTER TABLE productos ADD COLUMN peso VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='dimensiones') THEN
        ALTER TABLE productos ADD COLUMN dimensiones VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='vendido') THEN
        ALTER TABLE productos ADD COLUMN vendido BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;