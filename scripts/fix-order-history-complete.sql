-- Script completo para arreglar order_status_history
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Eliminar el trigger actual para evitar conflictos
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;

-- Paso 2: Verificar estructura actual de la tabla y corregirla
DO $$
BEGIN
  -- Si la tabla existe, eliminarla y recrearla correctamente
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_status_history') THEN
    DROP TABLE order_status_history CASCADE;
    RAISE NOTICE 'Tabla order_status_history eliminada';
  END IF;

  -- Crear la tabla con la estructura correcta
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

  -- Crear política para que los usuarios puedan ver el historial de sus órdenes
  CREATE POLICY "Users can view their order history"
    ON order_status_history
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_status_history.order_id
        AND (orders.clerk_user_id = auth.uid()::text OR auth.uid() IS NULL)
      )
    );

  RAISE NOTICE 'Tabla order_status_history creada correctamente';
END $$;

-- Paso 3: Crear la función del trigger
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
        WHEN NEW.estado = 'en_proceso' THEN 'Pedido en proceso'
        ELSE NULL
      END,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Paso 4: Crear el trigger
CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Paso 5: Actualizar el pedido de Angela
UPDATE orders
SET estado = 'completado', estado_pago = 'completado'
WHERE numero_orden = 'NRD-1766447396250-35njb8rll';

-- Paso 6: Verificar que se actualizó correctamente
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

-- Paso 7: Verificar que se creó el registro en el historial
SELECT
  h.status_anterior,
  h.status_nuevo,
  h.notas,
  h.created_at,
  o.numero_orden
FROM order_status_history h
JOIN orders o ON h.order_id = o.id
WHERE o.numero_orden = 'NRD-1766447396250-35njb8rll'
ORDER BY h.created_at DESC;
