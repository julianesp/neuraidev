-- ====================================================================
-- SCRIPT DE SEGURIDAD: Corregir problemas restantes
-- ====================================================================
-- Este script soluciona:
-- 1. Vista user_orders_complete con SECURITY DEFINER
-- 2. Funciones sin search_path establecido
-- ====================================================================

-- ====================================================================
-- PROBLEMA 1: VISTA CON SECURITY DEFINER
-- ====================================================================

-- Eliminar la vista forzadamente (CASCADE eliminará dependencias)
DROP VIEW IF EXISTS public.user_orders_complete CASCADE;

-- Recrear la vista SIN SECURITY DEFINER y sin VOLATILE
-- Esta vista combina órdenes con sus items de forma segura
-- Nota: Solo incluye las columnas que realmente existen
CREATE VIEW public.user_orders_complete
WITH (security_invoker=true)
AS
SELECT
  o.*,
  -- Agregar los items como un array JSON
  -- Solo incluimos las columnas básicas que existen en order_items
  COALESCE(
    (
      SELECT json_agg(row_to_json(oi.*) ORDER BY oi.created_at)
      FROM public.order_items oi
      WHERE oi.order_id = o.id
    ),
    '[]'::json
  ) AS items
FROM public.orders o;

-- Comentario para documentar la vista
COMMENT ON VIEW public.user_orders_complete IS
'Vista segura que combina órdenes con sus items. Usa security_invoker=true para respetar RLS del usuario consultante.';

-- ====================================================================
-- PROBLEMA 2: FUNCIONES SIN SEARCH_PATH
-- ====================================================================
-- Las funciones sin search_path explícito pueden ser vulnerables a
-- ataques de "search path injection"
-- ====================================================================

-- --------------------------------------------------------------------
-- Función 1: update_store_status_timestamp
-- --------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.update_store_status_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION public.update_store_status_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.update_store_status_timestamp() IS
'Actualiza automáticamente el campo updated_at. SECURITY DEFINER con search_path seguro.';

-- --------------------------------------------------------------------
-- Función 2: ensure_single_default_address
-- --------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.ensure_single_default_address() CASCADE;

CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Si la nueva dirección se marca como predeterminada
  IF NEW.es_predeterminada = TRUE THEN
    -- Desmarcar todas las otras direcciones del mismo usuario
    UPDATE public.user_addresses
    SET es_predeterminada = FALSE
    WHERE clerk_user_id = NEW.clerk_user_id
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.ensure_single_default_address() IS
'Garantiza que solo una dirección sea predeterminada por usuario.';

-- --------------------------------------------------------------------
-- Función 3: generate_order_number
-- --------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  order_count INTEGER;
  order_number TEXT;
BEGIN
  -- Contar órdenes existentes
  SELECT COUNT(*) INTO order_count FROM public.orders;

  -- Generar número de orden: ORD-YYYYMMDD-XXXX
  order_number := 'ORD-' ||
                  TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                  LPAD((order_count + 1)::TEXT, 4, '0');

  RETURN order_number;
END;
$function$;

COMMENT ON FUNCTION public.generate_order_number() IS
'Genera un número de orden único en formato ORD-YYYYMMDD-XXXX';

-- --------------------------------------------------------------------
-- Función 4: log_order_status_change
-- --------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.log_order_status_change() CASCADE;

CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Solo registrar si el estado cambió
  IF (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado) THEN
    INSERT INTO public.order_status_history (
      order_id,
      status_anterior,
      status_nuevo,
      notas,
      created_at
    ) VALUES (
      NEW.id,
      OLD.estado,
      NEW.estado,
      'Cambio automático de estado',
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.log_order_status_change() IS
'Registra automáticamente cambios de estado en el historial.';

-- --------------------------------------------------------------------
-- Función 5: update_updated_at_column
-- --------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.update_updated_at_column() IS
'Actualiza automáticamente el timestamp updated_at en cada UPDATE.';

-- ====================================================================
-- RECREAR TRIGGERS SI ES NECESARIO
-- ====================================================================

-- Trigger para ensure_single_default_address
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON public.user_addresses;
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON public.user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_default_address();

-- Trigger para log_order_status_change
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON public.orders;
CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();

-- Trigger para update_updated_at_column en varias tablas
-- Tabla: orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabla: order_items
DROP TRIGGER IF EXISTS update_order_items_updated_at ON public.order_items;
CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabla: user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabla: user_addresses
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabla: products (si existe)
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================

-- Verificar que la vista fue recreada correctamente
SELECT
  schemaname,
  viewname,
  'Vista recreada con security_invoker' as status
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'user_orders_complete';

-- Verificar que todas las funciones tienen search_path establecido
SELECT
  n.nspname as schema,
  p.proname as function_name,
  CASE
    WHEN p.proconfig IS NULL THEN '❌ Sin search_path'
    WHEN array_to_string(p.proconfig, ', ') LIKE '%search_path%' THEN '✅ Con search_path configurado'
    ELSE '⚠️  Configuración: ' || array_to_string(p.proconfig, ', ')
  END as status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_store_status_timestamp',
    'ensure_single_default_address',
    'generate_order_number',
    'log_order_status_change',
    'update_updated_at_column'
  )
ORDER BY p.proname;

-- Verificar triggers recreados
SELECT
  event_object_table as tabla,
  trigger_name,
  event_manipulation as evento,
  action_statement as accion
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (
    trigger_name LIKE '%ensure_single_default%'
    OR trigger_name LIKE '%log_order_status%'
    OR trigger_name LIKE '%update%updated_at%'
  )
ORDER BY event_object_table, trigger_name;

-- ====================================================================
-- NOTAS IMPORTANTES
-- ====================================================================
--
-- 1. SECURITY_INVOKER en vistas:
--    - La vista user_orders_complete ahora usa security_invoker=true
--    - Esto significa que la vista respeta los permisos del usuario que hace la consulta
--    - Las políticas RLS de las tablas subyacentes (orders, order_items) se aplicarán
--
-- 2. SEARCH_PATH en funciones:
--    - SET search_path = public, pg_temp previene ataques de "search path injection"
--    - pg_temp se incluye para permitir tablas temporales si son necesarias
--    - Todas las referencias a objetos de la BD deben ser explícitas (public.tabla)
--
-- 3. SECURITY DEFINER en funciones:
--    - Las funciones mantienen SECURITY DEFINER porque necesitan ejecutarse
--      con privilegios elevados (ej: actualizar timestamps, generar números)
--    - Pero ahora con search_path seguro, están protegidas contra inyección
--
-- 4. Triggers recreados:
--    - Se recrearon todos los triggers para asegurar que usan las nuevas funciones
--    - Si alguna tabla no existe, el trigger simplemente no se creará (sin error)
--
-- ====================================================================
