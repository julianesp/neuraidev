-- Script para crear usuario neuraidev y configurar permisos
-- Ejecutar como: sudo -u postgres psql -f create-user.sql

-- Crear usuario neuraidev si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'neuraidev') THEN
        CREATE USER neuraidev WITH PASSWORD 'dataNeuraidev_25@';
        RAISE NOTICE 'Usuario neuraidev creado';
    ELSE
        RAISE NOTICE 'Usuario neuraidev ya existe';
    END IF;
END
$$;

-- Dar permisos al usuario
ALTER USER neuraidev CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE anuncios_db TO neuraidev;

-- Conectar a la base de datos anuncios_db y dar permisos sobre el schema public
\c anuncios_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO neuraidev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neuraidev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neuraidev;

-- Dar permisos para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO neuraidev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO neuraidev;

-- Mostrar información
\du neuraidev
\l anuncios_db