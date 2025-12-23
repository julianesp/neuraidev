-- Script para arreglar el trigger de order_status_history
-- Ejecutar esto en Supabase SQL Editor

-- Paso 1: Deshabilitar el trigger temporalmente (ignorar error si no existe)
DO $$
BEGIN
  -- Intentar deshabilitar el trigger, ignorar si no existe
  EXECUTE 'ALTER TABLE orders DISABLE TRIGGER log_order_status_change_trigger';
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'Trigger no existe, continuando...';
END $$;

-- Paso 2: Verificar si la tabla order_status_history existe
DO $$
BEGIN
  -- Si la tabla no existe, crearla
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_status_history') THEN
    CREATE TABLE order_status_history (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      status_anterior TEXT,
      status_nuevo TEXT NOT NULL,
      notas TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Habilitar RLS
    ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE 'Tabla order_status_history creada';
  ELSE
    -- Si existe, verificar y agregar la columna status_anterior si no existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'order_status_history'
      AND column_name = 'status_anterior'
    ) THEN
      ALTER TABLE order_status_history ADD COLUMN status_anterior TEXT;
      RAISE NOTICE 'Columna status_anterior agregada';
    ELSE
      RAISE NOTICE 'Tabla order_status_history ya está correctamente configurada';
    END IF;
  END IF;
END $$;

-- Paso 3: Recrear la función del trigger con la columna correcta
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo registrar si el estado cambió
  IF (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado) THEN
    INSERT INTO order_status_history (
      order_id,
      status_anterior,
      status_nuevo,
      notas,
      created_at
    ) VALUES (
      NEW.id,
      OLD.estado,
      NEW.estado,
      CASE
        WHEN NEW.estado = 'completado' THEN 'Pedido completado automáticamente'
        WHEN NEW.estado = 'cancelado' THEN 'Pedido cancelado'
        ELSE NULL
      END,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Paso 4: Recrear el trigger
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;
CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Paso 5: Actualizar el pedido de Angela
UPDATE orders
SET estado = 'completado', estado_pago = 'completado'
WHERE numero_orden = 'NRD-1766447396250-35njb8rll';

-- Paso 6: Verificar que se actualizó
SELECT
  numero_orden,
  customer_name,
  customer_email,
  total,
  estado,
  estado_pago,
  created_at
FROM orders
WHERE numero_orden = 'NRD-1766447396250-35njb8rll';
