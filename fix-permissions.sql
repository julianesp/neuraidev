-- Script para corregir permisos de función
-- Ejecutar como: sudo -u postgres psql -d anuncios_db -f fix-permissions.sql

-- Eliminar función existente y recrearla con el usuario correcto
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Crear función como usuario neuraidev
ALTER FUNCTION update_updated_at_column() OWNER TO neuraidev;

-- Dar permisos completos al usuario neuraidev
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO neuraidev;
GRANT ALL PRIVILEGES ON ALL PROCEDURES IN SCHEMA public TO neuraidev;

-- Configurar permisos por defecto
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO neuraidev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON PROCEDURES TO neuraidev;