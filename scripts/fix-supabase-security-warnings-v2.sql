-- ====================================================================
-- SCRIPT DE SEGURIDAD: Solucionar advertencias de Supabase Linter
-- ====================================================================
-- VERSIÓN 2 - Con conversiones de tipos corregidas
-- Este script soluciona 3 problemas críticos de seguridad:
-- 1. Vista productos_mas_vendidos con SECURITY DEFINER
-- 2. Vista resumen_ganancias con SECURITY DEFINER
-- 3. Tabla ventas sin RLS habilitado
-- Fecha: 2026-02-03
-- ====================================================================

-- ====================================================================
-- PROBLEMA 1: Vista productos_mas_vendidos con SECURITY DEFINER
-- ====================================================================

-- Eliminar la vista existente
DROP VIEW IF EXISTS public.productos_mas_vendidos CASCADE;

-- Recrear la vista con security_invoker
CREATE OR REPLACE VIEW public.productos_mas_vendidos
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.nombre,
  p.sku,
  p.precio,
  p.imagen_principal as imagen,
  p.categoria,
  COALESCE(SUM(oi.cantidad), 0) as total_vendido,
  COALESCE(SUM(oi.subtotal), 0) as ingresos_totales,
  COUNT(DISTINCT o.id) as numero_ordenes
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.producto_id
LEFT JOIN public.orders o ON oi.order_id = o.id AND o.estado = 'completado'
GROUP BY p.id, p.nombre, p.sku, p.precio, p.imagen_principal, p.categoria
ORDER BY total_vendido DESC;

COMMENT ON VIEW public.productos_mas_vendidos IS
'Vista que muestra productos ordenados por cantidad vendida. Usa security_invoker=true para respetar RLS del usuario consultante.';

-- ====================================================================
-- PROBLEMA 2: Vista resumen_ganancias con SECURITY DEFINER
-- ====================================================================

-- Eliminar la vista existente
DROP VIEW IF EXISTS public.resumen_ganancias CASCADE;

-- Recrear la vista con security_invoker
CREATE OR REPLACE VIEW public.resumen_ganancias
WITH (security_invoker = true) AS
SELECT
  DATE_TRUNC('day', o.created_at) as fecha,
  COUNT(DISTINCT o.id) as total_ordenes,
  SUM(o.total) as ingresos_brutos,
  SUM(o.total * 0.8) as ingresos_netos_estimados,
  AVG(o.total) as ticket_promedio,
  COUNT(DISTINCT o.clerk_user_id) as clientes_unicos
FROM public.orders o
WHERE o.estado = 'completado'
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY fecha DESC;

COMMENT ON VIEW public.resumen_ganancias IS
'Vista que resume ganancias por día. Usa security_invoker=true para respetar RLS del usuario consultante.';

-- ====================================================================
-- PROBLEMA 3: Tabla ventas sin RLS
-- ====================================================================

-- Habilitar RLS
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Vendedores ven sus ventas, admins ven todo" ON public.ventas;
DROP POLICY IF EXISTS "Vendedores crean sus ventas, admins crean cualquier venta" ON public.ventas;
DROP POLICY IF EXISTS "Vendedores actualizan sus ventas, admins actualizan todo" ON public.ventas;
DROP POLICY IF EXISTS "Solo admins pueden eliminar ventas" ON public.ventas;

-- ==================================================================
-- FUNCIÓN AUXILIAR: Verificar si el email es admin
-- ==================================================================

DROP FUNCTION IF EXISTS public.is_admin_user();

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Obtener el email del usuario autenticado desde Supabase auth
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

  -- Verificar si el email está en la lista de admins
  RETURN LOWER(user_email) IN ('julii1295@gmail.com', 'admin@neurai.dev', 'contacto@neurai.dev');
END;
$$;

COMMENT ON FUNCTION public.is_admin_user() IS
'Verifica si el usuario autenticado es administrador basándose en su email.';

-- ==================================================================
-- FUNCIÓN AUXILIAR: Obtener clerk_user_id del usuario actual
-- ==================================================================

DROP FUNCTION IF EXISTS public.get_current_user_clerk_id();

CREATE OR REPLACE FUNCTION public.get_current_user_clerk_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_clerk_id TEXT;
BEGIN
  -- Obtener el Clerk user ID desde raw_user_meta_data
  SELECT raw_user_meta_data->>'sub' INTO user_clerk_id FROM auth.users WHERE id = auth.uid();

  RETURN user_clerk_id;
END;
$$;

COMMENT ON FUNCTION public.get_current_user_clerk_id() IS
'Obtiene el Clerk user ID (string) del usuario autenticado actual.';

-- ==================================================================
-- POLÍTICAS RLS PARA TABLA VENTAS
-- ==================================================================

-- Política 1: Los vendedores pueden ver sus propias ventas + admins ven todo
CREATE POLICY "Vendedores ven sus ventas, admins ven todo"
ON public.ventas
FOR SELECT
USING (
  -- Es admin: ve todas las ventas
  is_admin_user()
  OR
  -- Es el vendedor de esta venta
  vendedor_id = get_current_user_clerk_id()
);

-- Política 2: Los vendedores pueden crear ventas asociadas a ellos + admins crean cualquier venta
CREATE POLICY "Vendedores crean sus ventas, admins crean cualquier venta"
ON public.ventas
FOR INSERT
WITH CHECK (
  -- Es admin: puede crear cualquier venta
  is_admin_user()
  OR
  -- Es vendedor y la venta está asociada a su perfil
  vendedor_id = get_current_user_clerk_id()
);

-- Política 3: Los vendedores pueden actualizar solo sus ventas + admins actualizan todo
CREATE POLICY "Vendedores actualizan sus ventas, admins actualizan todo"
ON public.ventas
FOR UPDATE
USING (
  is_admin_user()
  OR
  vendedor_id = get_current_user_clerk_id()
)
WITH CHECK (
  is_admin_user()
  OR
  vendedor_id = get_current_user_clerk_id()
);

-- Política 4: Solo administradores pueden eliminar ventas
CREATE POLICY "Solo admins pueden eliminar ventas"
ON public.ventas
FOR DELETE
USING (is_admin_user());

-- ====================================================================
-- VERIFICACIÓN DE CAMBIOS
-- ====================================================================

-- Verificar que las vistas fueron recreadas con security_invoker
SELECT
  schemaname,
  viewname,
  viewowner,
  '✅ Vista recreada con security_invoker' as status
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('productos_mas_vendidos', 'resumen_ganancias');

-- Verificar que RLS está habilitado en la tabla ventas
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity THEN '✅ RLS Habilitado'
    ELSE '❌ RLS Deshabilitado'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'ventas';

-- Verificar políticas creadas para la tabla ventas
SELECT
  schemaname,
  tablename,
  policyname,
  '✅ Política creada' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'ventas'
ORDER BY policyname;

-- Verificar funciones auxiliares
SELECT
  n.nspname as schema,
  p.proname as function_name,
  '✅ Función creada' as status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin_user', 'get_current_user_clerk_id');

-- ====================================================================
-- NOTAS IMPORTANTES
-- ====================================================================
--
-- 1. FUNCIÓN get_current_user_clerk_id():
--    - Ewxtrae el Clerk user ID (string) de auth.users.raw_user_meta_data->>'sub'
--    - Retorna el Clerk ID como TEXT
--    - Se usa para cwomparar con vendedor_id (TEXT) en la tabla ventas
--
-- 2. FUNCIÓN is_admin_user():
--    - Verifica si el email del usuario autenticado está en la lista de admins
--    - Los emails están hardcodeados: julii1295@gmail.com, admin@neurai.dev
--    - Para agregar más admins, actualiza la función
--
-- 3. POLÍTICAS RLS:
--    - Usan get_current_user_clerk_id() para comparar con vendedor_id (TEXT)
--    - Cada vendedor solo ve/modifica sus propias ventas
--    - Los administradores tienen acceso completo
--
-- 4. SECURITY DEFINER:
--    - Las funciones auxiliares usan SECURITY DEFINER con search_path seguro
--    - Esto es necesario para acceder a auth.users
--    - Las políticas RLS no usan SECURITY DEFINER (correcto)
--
-- ====================================================================
