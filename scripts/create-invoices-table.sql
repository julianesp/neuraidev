-- Crear tabla de facturas electrónicas
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear tabla invoices si no existe
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,

  -- Número de factura único
  invoice_number TEXT UNIQUE NOT NULL,

  -- Referencia a la orden
  order_reference TEXT NOT NULL,

  -- Información del cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_type_doc TEXT DEFAULT 'CC', -- CC, NIT, CE, etc.
  customer_number_doc TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_region TEXT,

  -- Información de la transacción
  transaction_id TEXT,
  payment_method TEXT,

  -- Detalles de la factura
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  tax NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'COP',

  -- Estado de la factura
  status TEXT DEFAULT 'issued', -- issued, cancelled, refunded

  -- URL del PDF generado (si se almacena externamente)
  pdf_url TEXT,

  -- Fechas
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_order_reference ON invoices(order_reference);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at ON invoices(issued_at);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS set_invoices_updated_at ON invoices;
CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias facturas
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Política: Permitir inserción desde el servidor (sin autenticación de usuario)
CREATE POLICY "Allow insert from server"
  ON invoices FOR INSERT
  WITH CHECK (true);

-- Política: Permitir actualización desde el servidor
CREATE POLICY "Allow update from server"
  ON invoices FOR UPDATE
  USING (true);

-- Comentarios en la tabla
COMMENT ON TABLE invoices IS 'Tabla de facturas electrónicas generadas por ventas';
COMMENT ON COLUMN invoices.invoice_number IS 'Número único de factura (ej: FAC-2024-00001)';
COMMENT ON COLUMN invoices.order_reference IS 'Referencia de la orden asociada';
COMMENT ON COLUMN invoices.items IS 'JSON con los productos comprados: [{id, name, quantity, price}]';
COMMENT ON COLUMN invoices.status IS 'Estado de la factura: issued, cancelled, refunded';

-- Verificar que la tabla fue creada correctamente
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;
