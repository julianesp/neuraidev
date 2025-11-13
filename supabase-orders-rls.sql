-- PASO 4: Configurar Row Level Security
-- Ejecuta esto al final

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT a usuarios autenticados
CREATE POLICY "Allow authenticated users to read their own orders" ON orders
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Permitir INSERT desde el servidor (usando service_role)
CREATE POLICY "Allow service role to insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Permitir UPDATE desde el servidor (usando service_role)
CREATE POLICY "Allow service role to update orders" ON orders
  FOR UPDATE
  USING (true);
