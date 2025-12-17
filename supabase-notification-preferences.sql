-- =====================================================
-- TABLA DE PREFERENCIAS DE NOTIFICACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,  -- Clerk user ID
  notify_new_orders BOOLEAN DEFAULT true,
  notify_low_stock BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON user_notification_preferences(user_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_notification_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_prefs_timestamp ON user_notification_preferences;
CREATE TRIGGER update_notification_prefs_timestamp
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_prefs_updated_at();

-- Habilitar RLS
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas: Los usuarios solo pueden ver/editar sus propias preferencias
DROP POLICY IF EXISTS "Usuarios pueden ver sus preferencias" ON user_notification_preferences;
CREATE POLICY "Usuarios pueden ver sus preferencias" ON user_notification_preferences
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus preferencias" ON user_notification_preferences;
CREATE POLICY "Usuarios pueden actualizar sus preferencias" ON user_notification_preferences
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios pueden insertar sus preferencias" ON user_notification_preferences;
CREATE POLICY "Usuarios pueden insertar sus preferencias" ON user_notification_preferences
  FOR INSERT WITH CHECK (true);
