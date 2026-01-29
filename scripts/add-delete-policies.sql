-- Script rápido para agregar políticas DELETE si no existen
-- Ejecuta esto en el SQL Editor de Supabase si ya creaste las tablas

-- Política DELETE para facturas
DROP POLICY IF EXISTS "Enable delete access for all users" ON facturas;
CREATE POLICY "Enable delete access for all users" ON facturas FOR DELETE USING (true);

-- Política DELETE para clientes
DROP POLICY IF EXISTS "Enable delete access for all users" ON clientes;
CREATE POLICY "Enable delete access for all users" ON clientes FOR DELETE USING (true);
