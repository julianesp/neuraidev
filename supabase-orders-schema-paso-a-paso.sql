-- PASO 1: Crear la tabla orders
-- Ejecuta esto primero

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
