-- Ejecuta este SQL en el Dashboard de Supabase > SQL Editor
-- URL: https://supabase.com/dashboard/project/yfglwidanlpqsmbnound/sql

-- Tabla de clientes frecuentes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  identificacion VARCHAR(50),
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  total_compras INTEGER DEFAULT 0,
  total_gastado DECIMAL(10,2) DEFAULT 0,
  descuento_fidelidad INTEGER DEFAULT 0,
  nivel_fidelidad VARCHAR(20) DEFAULT 'bronce',
  fecha_primera_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_ultima_compra TIMESTAMP WITH TIME ZONE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_factura VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_identificacion VARCHAR(50),
  cliente_telefono VARCHAR(20),
  cliente_email VARCHAR(255),
  cliente_direccion TEXT,
  mi_telefono VARCHAR(20),
  mi_email VARCHAR(255),
  servicios JSONB DEFAULT '[]',
  productos JSONB DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  descuento_porcentaje INTEGER DEFAULT 0,
  descuento_monto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  notas TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_nombre ON facturas(cliente_nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_identificacion ON clientes(identificacion);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facturas_updated_at ON facturas;
CREATE TRIGGER update_facturas_updated_at
  BEFORE UPDATE ON facturas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas de cliente
CREATE OR REPLACE FUNCTION actualizar_estadisticas_cliente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cliente_id IS NOT NULL THEN
    UPDATE clientes
    SET
      total_compras = total_compras + 1,
      total_gastado = total_gastado + NEW.total,
      fecha_ultima_compra = NEW.fecha,
      nivel_fidelidad = CASE
        WHEN total_gastado + NEW.total >= 5000000 THEN 'platino'
        WHEN total_gastado + NEW.total >= 2000000 THEN 'oro'
        WHEN total_gastado + NEW.total >= 500000 THEN 'plata'
        ELSE 'bronce'
      END,
      descuento_fidelidad = CASE
        WHEN total_gastado + NEW.total >= 5000000 THEN 15
        WHEN total_gastado + NEW.total >= 2000000 THEN 10
        WHEN total_gastado + NEW.total >= 500000 THEN 5
        ELSE 0
      END
    WHERE id = NEW.cliente_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar estadísticas
DROP TRIGGER IF EXISTS actualizar_estadisticas_cliente_trigger ON facturas;
CREATE TRIGGER actualizar_estadisticas_cliente_trigger
  AFTER INSERT ON facturas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_estadisticas_cliente();

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Políticas (permitir acceso completo - ajusta según tus necesidades)
DROP POLICY IF EXISTS "Enable read access for all users" ON clientes;
CREATE POLICY "Enable read access for all users" ON clientes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON clientes;
CREATE POLICY "Enable insert access for all users" ON clientes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON clientes;
CREATE POLICY "Enable update access for all users" ON clientes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON facturas;
CREATE POLICY "Enable read access for all users" ON facturas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON facturas;
CREATE POLICY "Enable insert access for all users" ON facturas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON facturas;
CREATE POLICY "Enable update access for all users" ON facturas FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON facturas;
CREATE POLICY "Enable delete access for all users" ON facturas FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON clientes;
CREATE POLICY "Enable delete access for all users" ON clientes FOR DELETE USING (true);
