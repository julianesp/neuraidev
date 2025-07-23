-- Script para crear tabla productos
-- Ejecutar como: sudo -u postgres psql -d anuncios_db -f create-productos-table.sql

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    imagen_principal TEXT,
    imagenes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio);
CREATE INDEX IF NOT EXISTS idx_productos_created_at ON productos(created_at);

-- Dar permisos al usuario neuraidev
GRANT ALL PRIVILEGES ON TABLE productos TO neuraidev;
GRANT ALL PRIVILEGES ON SEQUENCE productos_id_seq TO neuraidev;

-- Mostrar información de la tabla
\d productos;