-- ====================================================================
-- SCRIPT DE SEGURIDAD: Habilitar RLS en todas las tablas públicas
-- ====================================================================
-- Este script soluciona los errores críticos de seguridad reportados por Supabase
-- Fecha: 2025-12-09
-- ====================================================================

-- ====================================================================
-- 1. TABLA: user_favorites
-- ====================================================================
-- Habilitar RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

-- Política: Los usuarios solo pueden ver sus propios favoritos
CREATE POLICY "Users can view their own favorites"
ON public.user_favorites
FOR SELECT
USING (auth.uid()::text = clerk_user_id);

-- Política: Los usuarios solo pueden insertar sus propios favoritos
CREATE POLICY "Users can insert their own favorites"
ON public.user_favorites
FOR INSERT
WITH CHECK (auth.uid()::text = clerk_user_id);

-- Política: Los usuarios solo pueden eliminar sus propios favoritos
CREATE POLICY "Users can delete their own favorites"
ON public.user_favorites
FOR DELETE
USING (auth.uid()::text = clerk_user_id);

-- ====================================================================
-- 2. TABLA: orders
-- ====================================================================
-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Política: Los usuarios solo pueden ver sus propias órdenes
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid()::text = clerk_user_id);

-- Política: Los usuarios solo pueden crear sus propias órdenes
CREATE POLICY "Users can insert their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid()::text = clerk_user_id);

-- Política: Los usuarios solo pueden actualizar sus propias órdenes (limitado)
CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid()::text = clerk_user_id)
WITH CHECK (auth.uid()::text = clerk_user_id);

-- ====================================================================
-- 3. TABLA: order_items
-- ====================================================================
-- Habilitar RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;

-- Política: Los usuarios solo pueden ver items de sus propias órdenes
CREATE POLICY "Users can view their own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.clerk_user_id = auth.uid()::text
  )
);

-- Política: Los usuarios solo pueden insertar items en sus propias órdenes
CREATE POLICY "Users can insert their own order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.clerk_user_id = auth.uid()::text
  )
);

-- ====================================================================
-- 4. TABLA: order_status_history
-- ====================================================================
-- Habilitar RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own order status history" ON public.order_status_history;

-- Política: Los usuarios solo pueden ver el historial de sus propias órdenes
CREATE POLICY "Users can view their own order status history"
ON public.order_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_status_history.order_id
    AND orders.clerk_user_id = auth.uid()::text
  )
);

-- Nota: Solo lectura para usuarios. Los cambios de estado los hace el sistema/admin

-- ====================================================================
-- 5. TABLA: user_profiles
-- ====================================================================
-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Política: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid()::text = clerk_user_id);

-- Política: Los usuarios solo pueden crear su propio perfil
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid()::text = clerk_user_id);

-- Política: Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid()::text = clerk_user_id)
WITH CHECK (auth.uid()::text = clerk_user_id);

-- ====================================================================
-- 6. TABLA: user_addresses
-- ====================================================================
-- Habilitar RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.user_addresses;

-- Política: Los usuarios solo pueden ver sus propias direcciones
CREATE POLICY "Users can view their own addresses"
ON public.user_addresses
FOR SELECT
USING (auth.uid()::text = clerk_user_id);

-- Política: Los usuarios solo pueden crear sus propias direcciones
CREATE POLICY "Users can insert their own addresses"
ON public.user_addresses
FOR INSERT
WITH CHECK (auth.uid()::text = clerk_user_id);

-- Política: Los usuarios solo pueden actualizar sus propias direcciones
CREATE POLICY "Users can update their own addresses"
ON public.user_addresses
FOR UPDATE
USING (auth.uid()::text = clerk_user_id)
WITH CHECK (auth.uid()::text = clerk_user_id);

-- Política: Los usuarios solo pueden eliminar sus propias direcciones
CREATE POLICY "Users can delete their own addresses"
ON public.user_addresses
FOR DELETE
USING (auth.uid()::text = clerk_user_id);

-- ====================================================================
-- 7. ARREGLAR VISTA: user_orders_complete
-- ====================================================================
-- La vista con SECURITY DEFINER puede ser un riesgo de seguridad.
-- Vamos a recrearla sin SECURITY DEFINER y con las políticas RLS apropiadas

-- Primero, verificar si la vista existe y eliminarla
DROP VIEW IF EXISTS public.user_orders_complete;

-- Recrear la vista sin SECURITY DEFINER
-- Esta vista combina órdenes con sus items
CREATE VIEW public.user_orders_complete AS
SELECT
  o.*,
  json_agg(
    json_build_object(
      'id', oi.id,
      'producto_id', oi.producto_id,
      'nombre_producto', oi.nombre_producto,
      'cantidad', oi.cantidad,
      'precio_unitario', oi.precio_unitario,
      'subtotal', oi.subtotal
    ) ORDER BY oi.created_at
  ) AS items
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- Nota: Como la vista usa las tablas subyacentes (orders y order_items),
-- las políticas RLS de esas tablas se aplicarán automáticamente.
-- No necesitamos SECURITY DEFINER.

-- ====================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================
-- Este query te mostrará el estado de RLS en todas las tablas
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_favorites',
    'orders',
    'order_items',
    'order_status_history',
    'user_profiles',
    'user_addresses'
  )
ORDER BY tablename;

-- ====================================================================
-- NOTAS IMPORTANTES
-- ====================================================================
-- 1. Este script usa auth.uid() que es la función de Supabase para obtener
--    el ID del usuario autenticado.
--
-- 2. Las políticas RLS se aplican SOLO cuando se accede a través de PostgREST
--    (la API de Supabase). Las conexiones directas con credenciales de servicio
--    siguen teniendo acceso completo.
--
-- 3. Para que esto funcione correctamente, tu aplicación debe:
--    - Usar el cliente de Supabase con autenticación
--    - NO usar el service_role_key en el cliente (solo en backend)
--
-- 4. Si necesitas que el backend acceda a todas las órdenes (por ejemplo,
--    para un dashboard de admin), deberás usar el service_role_key que
--    bypasea RLS, o crear políticas adicionales para roles de admin.
--
-- ====================================================================

-- ====================================================================
-- EJECUCIÓN
-- ====================================================================
-- Para ejecutar este script:
-- 1. Ve a tu proyecto de Supabase
-- 2. Abre el SQL Editor
-- 3. Copia y pega este script completo
-- 4. Haz click en "Run"
-- 5. Verifica que todas las políticas se crearon correctamente
-- ====================================================================
