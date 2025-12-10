-- Agregar columnas de información del cliente a la tabla orders
-- Ejecutar este script en el SQL Editor de Supabase

-- Agregar columna customer_name si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_name TEXT;
    RAISE NOTICE 'Columna customer_name agregada';
  ELSE
    RAISE NOTICE 'Columna customer_name ya existe';
  END IF;
END $$;

-- Agregar columna customer_email si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_email TEXT;
    RAISE NOTICE 'Columna customer_email agregada';
  ELSE
    RAISE NOTICE 'Columna customer_email ya existe';
  END IF;
END $$;

-- Agregar columna customer_phone si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_phone TEXT;
    RAISE NOTICE 'Columna customer_phone agregada';
  ELSE
    RAISE NOTICE 'Columna customer_phone ya existe';
  END IF;
END $$;

-- Verificar que las columnas fueron agregadas correctamente
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('customer_name', 'customer_email', 'customer_phone')
ORDER BY column_name;

-- Comentario: Estas columnas almacenarán la información del cliente
-- que realiza la compra en el momento de crear la orden.
