-- Tabla de órdenes de compra para integración con ePayco
-- Ejecuta este script en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Información de la orden
  invoice TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'epayco',

  -- Información del cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_document TEXT,

  -- Productos comprados (JSON)
  items JSONB NOT NULL,

  -- Montos
  total DECIMAL(10, 2) NOT NULL,

  -- Información de pago de ePayco
  transaction_id TEXT,
  ref_payco TEXT,
  payment_response JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_invoice ON orders(invoice);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT a usuarios autenticados (opcional, ajustar según necesidades)
CREATE POLICY "Allow authenticated users to read their own orders" ON orders
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Permitir INSERT desde el servidor (usando service_role)
CREATE POLICY "Allow service role to insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Permitir UPDATE desde el servidor (usando service_role)
CREATE POLICY "Allow service role to update orders" ON orders
  FOR UPDATE
  USING (true);

COMMENT ON TABLE orders IS 'Tabla de órdenes de compra para integración con ePayco';
COMMENT ON COLUMN orders.invoice IS 'Número de factura único generado para la orden';
COMMENT ON COLUMN orders.status IS 'Estado de la orden: pending, paid, failed, cancelled';
COMMENT ON COLUMN orders.payment_status IS 'Estado del pago: pending, approved, rejected, failed';
COMMENT ON COLUMN orders.items IS 'Array JSON con los productos comprados';
COMMENT ON COLUMN orders.payment_response IS 'Respuesta completa del webhook de ePayco';
