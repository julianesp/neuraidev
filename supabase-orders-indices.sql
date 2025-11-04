-- PASO 2: Crear índices
-- Ejecuta esto después de crear la tabla

CREATE INDEX IF NOT EXISTS idx_orders_invoice ON orders(invoice);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
