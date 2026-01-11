-- Tabla para gestionar créditos/fiados a clientes
CREATE TABLE IF NOT EXISTS creditos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información del cliente
  nombre_cliente VARCHAR(255) NOT NULL,
  email_cliente VARCHAR(255) NOT NULL,
  telefono_cliente VARCHAR(50),
  cedula_cliente VARCHAR(50),

  -- Información del crédito
  producto_id UUID REFERENCES products(id) ON DELETE SET NULL,
  producto_nombre VARCHAR(255) NOT NULL,
  producto_precio DECIMAL(10, 2) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  monto_total DECIMAL(10, 2) NOT NULL,
  monto_pagado DECIMAL(10, 2) NOT NULL DEFAULT 0,
  monto_pendiente DECIMAL(10, 2) NOT NULL,

  -- Fechas y plazos
  fecha_credito TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_limite_pago TIMESTAMP WITH TIME ZONE NOT NULL,
  dias_plazo INTEGER NOT NULL DEFAULT 30,

  -- Estado del crédito
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado_parcial', 'pagado_total', 'vencido', 'cancelado')),

  -- Notificaciones
  recordatorio_enviado BOOLEAN DEFAULT FALSE,
  fecha_ultimo_recordatorio TIMESTAMP WITH TIME ZONE,
  numero_recordatorios INTEGER DEFAULT 0,

  -- Notas y comentarios
  notas TEXT,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) -- Clerk user ID del admin que creó el crédito
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_creditos_cliente_email ON creditos(email_cliente);
CREATE INDEX idx_creditos_estado ON creditos(estado);
CREATE INDEX idx_creditos_fecha_limite ON creditos(fecha_limite_pago);
CREATE INDEX idx_creditos_producto_id ON creditos(producto_id);

-- Tabla para registrar pagos parciales
CREATE TABLE IF NOT EXISTS pagos_credito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credito_id UUID NOT NULL REFERENCES creditos(id) ON DELETE CASCADE,

  monto_pago DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(100), -- efectivo, transferencia, etc.

  fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comprobante_url TEXT, -- URL del comprobante de pago si existe

  notas TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) -- Clerk user ID del admin que registró el pago
);

-- Crear índice para pagos
CREATE INDEX idx_pagos_credito_id ON pagos_credito(credito_id);

-- Función para actualizar el timestamp updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en la tabla creditos
CREATE TRIGGER update_creditos_updated_at
  BEFORE UPDATE ON creditos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar automáticamente el monto_pendiente
CREATE OR REPLACE FUNCTION actualizar_monto_pendiente()
RETURNS TRIGGER AS $$
BEGIN
  NEW.monto_pendiente = NEW.monto_total - NEW.monto_pagado;

  -- Actualizar el estado según el monto pagado
  IF NEW.monto_pagado >= NEW.monto_total THEN
    NEW.estado = 'pagado_total';
  ELSIF NEW.monto_pagado > 0 THEN
    NEW.estado = 'pagado_parcial';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular monto_pendiente antes de insertar o actualizar
CREATE TRIGGER calcular_monto_pendiente
  BEFORE INSERT OR UPDATE ON creditos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_monto_pendiente();

-- Función para marcar créditos vencidos
CREATE OR REPLACE FUNCTION marcar_creditos_vencidos()
RETURNS void AS $$
BEGIN
  UPDATE creditos
  SET estado = 'vencido'
  WHERE fecha_limite_pago < NOW()
    AND estado IN ('pendiente', 'pagado_parcial');
END;
$$ LANGUAGE plpgsql;

-- Habilitar Row Level Security (RLS)
ALTER TABLE creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_credito ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: solo usuarios autenticados pueden acceder
-- (En producción deberías refinar esto para verificar roles de admin)
CREATE POLICY "Permitir todo para usuarios autenticados" ON creditos
  FOR ALL USING (true);

CREATE POLICY "Permitir todo para usuarios autenticados" ON pagos_credito
  FOR ALL USING (true);

-- Comentarios en las tablas
COMMENT ON TABLE creditos IS 'Tabla para gestionar créditos/fiados a clientes';
COMMENT ON TABLE pagos_credito IS 'Tabla para registrar pagos parciales de créditos';
