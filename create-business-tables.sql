-- Script para crear tablas de gestión de negocios
-- Ejecutar como: PGPASSWORD='dataNeuraidev_25@' psql -h localhost -U neuraidev -d anuncios_db -f create-business-tables.sql

-- Crear tabla de planes de suscripción
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    duration_days INTEGER NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    max_products INTEGER DEFAULT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de negocios registrados
CREATE TABLE IF NOT EXISTS business_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(100) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    description TEXT,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    logo_url TEXT,
    category_id INTEGER REFERENCES categorias(id),
    status VARCHAR(20) DEFAULT 'trial', -- trial, active, suspended, cancelled
    trial_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS business_subscriptions (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES business_accounts(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, cancelled, expired
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMP,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de pagos
CREATE TABLE IF NOT EXISTS business_payments (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES business_accounts(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES business_subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    payment_method VARCHAR(50),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar planes de suscripción por defecto
INSERT INTO subscription_plans (name, price, duration_days, features, max_products) VALUES
('Plan Básico', 49900, 30, '["Hasta 50 productos", "Panel de administración", "Soporte por email", "Análisis básicos"]', 50),
('Plan Profesional', 89900, 30, '["Hasta 200 productos", "Panel avanzado", "Soporte prioritario", "Análisis avanzados", "Personalización"]', 200),
('Plan Empresarial', 149900, 30, '["Productos ilimitados", "Panel completo", "Soporte 24/7", "Análisis completos", "API personalizada"]', NULL)
ON CONFLICT DO NOTHING;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_business_accounts_user_id ON business_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_business_accounts_status ON business_accounts(status);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_business_id ON business_subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_business_payments_business_id ON business_payments(business_id);

-- Dar permisos al usuario neuraidev
GRANT ALL PRIVILEGES ON TABLE subscription_plans TO neuraidev;
GRANT ALL PRIVILEGES ON TABLE business_accounts TO neuraidev;
GRANT ALL PRIVILEGES ON TABLE business_subscriptions TO neuraidev;
GRANT ALL PRIVILEGES ON TABLE business_payments TO neuraidev;
GRANT ALL PRIVILEGES ON SEQUENCE subscription_plans_id_seq TO neuraidev;
GRANT ALL PRIVILEGES ON SEQUENCE business_accounts_id_seq TO neuraidev;
GRANT ALL PRIVILEGES ON SEQUENCE business_subscriptions_id_seq TO neuraidev;
GRANT ALL PRIVILEGES ON SEQUENCE business_payments_id_seq TO neuraidev;

-- Mostrar información de las tablas
\d subscription_plans;
\d business_accounts;