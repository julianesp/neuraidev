-- Crear tabla para estado de la tienda
CREATE TABLE IF NOT EXISTS "StoreStatus" (
  id SERIAL PRIMARY KEY,
  is_open BOOLEAN NOT NULL DEFAULT true,
  manual_override BOOLEAN NOT NULL DEFAULT false,
  override_until TIMESTAMP WITH TIME ZONE,
  open_time TIME NOT NULL DEFAULT '08:00:00',
  close_time TIME NOT NULL DEFAULT '18:00:00',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_store_status_updated_at ON "StoreStatus" (updated_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE "StoreStatus" ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Anyone can read store status" ON "StoreStatus";
DROP POLICY IF EXISTS "Authenticated users can update store status" ON "StoreStatus";

-- Política de lectura: todos pueden leer el estado de la tienda
CREATE POLICY "Anyone can read store status"
  ON "StoreStatus"
  FOR SELECT
  TO public
  USING (true);

-- Política de escritura: solo usuarios autenticados pueden actualizar
CREATE POLICY "Authenticated users can update store status"
  ON "StoreStatus"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Crear función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_store_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_store_status_timestamp ON "StoreStatus";

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_store_status_timestamp
  BEFORE UPDATE ON "StoreStatus"
  FOR EACH ROW
  EXECUTE FUNCTION update_store_status_timestamp();

-- Insertar el estado inicial
INSERT INTO "StoreStatus" (id, is_open, manual_override, open_time, close_time)
VALUES (1, true, false, '08:00:00', '18:00:00')
ON CONFLICT (id) DO NOTHING;
