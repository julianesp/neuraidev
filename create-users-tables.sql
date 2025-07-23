-- Script para crear tablas de usuarios y favoritos
-- Ejecutar como: PGPASSWORD='dataNeuraidev_25@' psql -h localhost -U neuraidev -d anuncios_db -f create-users-tables.sql

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT true
);

-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_product ON user_favorites(user_id, product_id);

-- Dar permisos al usuario neuraidev
GRANT ALL PRIVILEGES ON TABLE users TO neuraidev;
GRANT ALL PRIVILEGES ON TABLE user_favorites TO neuraidev;
GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO neuraidev;
GRANT ALL PRIVILEGES ON SEQUENCE user_favorites_id_seq TO neuraidev;

-- Mostrar información de las tablas
\d users;
\d user_favorites;