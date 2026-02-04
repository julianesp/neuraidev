-- ====================================================================
-- SCRIPT DE VERIFICACIÓN: Tipos de datos de columnas
-- ====================================================================
-- Este script te ayudará a identificar los tipos exactos de las columnas
-- para corregir el script principal
-- ====================================================================

-- Verificar tipo de clerk_user_id en user_profiles
SELECT
  'user_profiles.clerk_user_id' as columna,
  data_type,
  udt_name as tipo_postgres
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name = 'clerk_user_id';

-- Verificar tipo de id en user_profiles
SELECT
  'user_profiles.id' as columna,
  data_type,
  udt_name as tipo_postgres
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name = 'id';

-- Verificar tipo de vendedor_id en ventas
SELECT
  'ventas.vendedor_id' as columna,
  data_type,
  udt_name as tipo_postgres
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ventas'
  AND column_name = 'vendedor_id';

-- Verificar tipo de clerk_user_id en orders
SELECT
  'orders.clerk_user_id' as columna,
  data_type,
  udt_name as tipo_postgres
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name = 'clerk_user_id';

-- ====================================================================
-- INTERPRETACIÓN DE RESULTADOS
-- ====================================================================
-- Si ves 'uuid' → La columna es de tipo UUID
-- Si ves 'text' o 'character varying' o 'varchar' → La columna es de tipo TEXT
-- ====================================================================
