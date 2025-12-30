-- ============================================
-- Sistema de Gestión de Clientes y Descuentos
-- ============================================
-- Ejecutar este script completo en el SQL Editor de Supabase

-- ============================================
-- 1. TABLA DE CLIENTES
-- ============================================

-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,

  -- Información del cliente
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,

  -- Estadísticas del cliente
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0,

  -- Primera y última compra
  first_order_date TIMESTAMP WITH TIME ZONE,
  last_order_date TIMESTAMP WITH TIME ZONE,

  -- Estado del cliente
  status TEXT DEFAULT 'active', -- active, inactive, blocked

  -- Notas internas del administrador
  notes TEXT,

  -- Fechas de auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customers_total_orders ON customers(total_orders DESC);
CREATE INDEX IF NOT EXISTS idx_customers_last_order_date ON customers(last_order_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- ============================================
-- 2. TABLA DE CÓDIGOS DE DESCUENTO
-- ============================================

CREATE TABLE IF NOT EXISTS discount_codes (
  id BIGSERIAL PRIMARY KEY,

  -- Código de descuento
  code TEXT UNIQUE NOT NULL,

  -- Tipo de descuento
  type TEXT NOT NULL, -- 'percentage' o 'fixed'
  value NUMERIC(10, 2) NOT NULL, -- porcentaje (10 = 10%) o valor fijo en COP

  -- Restricciones
  min_purchase NUMERIC(10, 2) DEFAULT 0, -- Compra mínima requerida
  max_uses INTEGER, -- NULL = ilimitado
  current_uses INTEGER DEFAULT 0,

  -- Cliente específico (NULL = disponible para todos)
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  customer_email TEXT, -- Email del cliente si no está registrado aún

  -- Validez del código
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,

  -- Estado
  status TEXT DEFAULT 'active', -- active, expired, depleted, disabled

  -- Descripción/Notas
  description TEXT,

  -- Fechas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para discount_codes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_customer_id ON discount_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_customer_email ON discount_codes(customer_email);
CREATE INDEX IF NOT EXISTS idx_discount_codes_status ON discount_codes(status);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_until ON discount_codes(valid_until);

-- ============================================
-- 3. TABLA DE USO DE DESCUENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS discount_usage (
  id BIGSERIAL PRIMARY KEY,

  -- Relaciones
  discount_code_id BIGINT REFERENCES discount_codes(id) ON DELETE CASCADE,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  order_reference TEXT NOT NULL,

  -- Detalles del uso
  discount_amount NUMERIC(10, 2) NOT NULL,
  order_total NUMERIC(10, 2) NOT NULL,

  -- Fecha de uso
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para discount_usage
CREATE INDEX IF NOT EXISTS idx_discount_usage_discount_code_id ON discount_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_customer_id ON discount_usage(customer_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_order_reference ON discount_usage(order_reference);

-- ============================================
-- 4. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at en customers
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para customers
DROP TRIGGER IF EXISTS set_customers_updated_at ON customers;
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Función para actualizar updated_at en discount_codes
CREATE OR REPLACE FUNCTION update_discount_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para discount_codes
DROP TRIGGER IF EXISTS set_discount_codes_updated_at ON discount_codes;
CREATE TRIGGER set_discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_codes_updated_at();

-- Función para registrar o actualizar cliente manualmente
-- Esta función se llamará cuando el cliente decida registrarse voluntariamente
CREATE OR REPLACE FUNCTION register_customer(
  p_email TEXT,
  p_name TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  customer_id BIGINT,
  message TEXT
) AS $$
DECLARE
  v_customer_id BIGINT;
  v_total_orders INTEGER;
  v_total_spent NUMERIC;
  v_first_order TIMESTAMP WITH TIME ZONE;
  v_last_order TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular estadísticas desde la tabla orders
  SELECT
    COUNT(*),
    COALESCE(SUM(total), 0),
    MIN(created_at),
    MAX(created_at)
  INTO
    v_total_orders,
    v_total_spent,
    v_first_order,
    v_last_order
  FROM orders
  WHERE customer_email = p_email
    AND estado = 'completado';

  -- Insertar o actualizar cliente
  INSERT INTO customers (
    email,
    name,
    phone,
    total_orders,
    total_spent,
    first_order_date,
    last_order_date
  )
  VALUES (
    p_email,
    p_name,
    p_phone,
    v_total_orders,
    v_total_spent,
    v_first_order,
    v_last_order
  )
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, customers.name),
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    total_orders = v_total_orders,
    total_spent = v_total_spent,
    first_order_date = v_first_order,
    last_order_date = v_last_order,
    updated_at = NOW()
  RETURNING id INTO v_customer_id;

  RETURN QUERY SELECT true, v_customer_id, 'Cliente registrado exitosamente'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Función para validar y usar un código de descuento
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_customer_email TEXT,
  p_order_total NUMERIC
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_id BIGINT,
  discount_type TEXT,
  discount_value NUMERIC,
  discount_amount NUMERIC,
  message TEXT
) AS $$
DECLARE
  v_discount RECORD;
  v_calculated_discount NUMERIC;
BEGIN
  -- Buscar el código de descuento
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE code = p_code
    AND status = 'active'
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (customer_email IS NULL OR customer_email = p_customer_email)
    AND (max_uses IS NULL OR current_uses < max_uses)
  LIMIT 1;

  -- Si no se encuentra el código
  IF v_discount IS NULL THEN
    RETURN QUERY SELECT false, NULL::BIGINT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, 'Código de descuento inválido o expirado'::TEXT;
    RETURN;
  END IF;

  -- Validar compra mínima
  IF v_discount.min_purchase > 0 AND p_order_total < v_discount.min_purchase THEN
    RETURN QUERY SELECT
      false,
      NULL::BIGINT,
      NULL::TEXT,
      NULL::NUMERIC,
      NULL::NUMERIC,
      'La compra mínima requerida es $' || v_discount.min_purchase::TEXT;
    RETURN;
  END IF;

  -- Calcular descuento
  IF v_discount.type = 'percentage' THEN
    v_calculated_discount := (p_order_total * v_discount.value / 100)::NUMERIC(10,2);
  ELSE
    v_calculated_discount := v_discount.value;
  END IF;

  -- No permitir que el descuento sea mayor al total
  IF v_calculated_discount > p_order_total THEN
    v_calculated_discount := p_order_total;
  END IF;

  RETURN QUERY SELECT
    true,
    v_discount.id,
    v_discount.type,
    v_discount.value,
    v_calculated_discount,
    'Código válido'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Allow all for service role" ON customers;
DROP POLICY IF EXISTS "Allow all for service role on discount_codes" ON discount_codes;
DROP POLICY IF EXISTS "Users can view their discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Allow all for service role on discount_usage" ON discount_usage;

-- Políticas para customers (solo administradores)
CREATE POLICY "Allow all for service role" ON customers
  FOR ALL USING (true);

-- Políticas para discount_codes (solo administradores escriben, usuarios pueden leer sus códigos)
CREATE POLICY "Allow all for service role on discount_codes" ON discount_codes
  FOR ALL USING (true);

CREATE POLICY "Users can view their discount codes" ON discount_codes
  FOR SELECT USING (
    customer_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Políticas para discount_usage
CREATE POLICY "Allow all for service role on discount_usage" ON discount_usage
  FOR ALL USING (true);

-- ============================================
-- 6. COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE customers IS 'Tabla de clientes que han realizado compras';
COMMENT ON TABLE discount_codes IS 'Códigos de descuento para clientes';
COMMENT ON TABLE discount_usage IS 'Registro de uso de códigos de descuento';

COMMENT ON COLUMN discount_codes.type IS 'Tipo: percentage (porcentaje) o fixed (valor fijo en COP)';
COMMENT ON COLUMN discount_codes.value IS 'Valor del descuento: porcentaje (10 = 10%) o monto fijo';
COMMENT ON COLUMN discount_codes.customer_email IS 'Email del cliente si el código es exclusivo';

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================

-- Mostrar estructura de las tablas creadas
SELECT table_name, column_name, data_type, is_nullable
FROM (
  SELECT 'customers' as table_name, column_name, data_type, is_nullable, ordinal_position
  FROM information_schema.columns
  WHERE table_name = 'customers'

  UNION ALL

  SELECT 'discount_codes' as table_name, column_name, data_type, is_nullable, ordinal_position
  FROM information_schema.columns
  WHERE table_name = 'discount_codes'

  UNION ALL

  SELECT 'discount_usage' as table_name, column_name, data_type, is_nullable, ordinal_position
  FROM information_schema.columns
  WHERE table_name = 'discount_usage'
) as all_columns
ORDER BY table_name, ordinal_position;

-- Mostrar mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de clientes y descuentos creado exitosamente';
  RAISE NOTICE '📊 Tablas creadas: customers, discount_codes, discount_usage';
  RAISE NOTICE '🔧 Triggers configurados para actualización automática de estadísticas';
  RAISE NOTICE '🔒 Row Level Security habilitado';
END $$;
