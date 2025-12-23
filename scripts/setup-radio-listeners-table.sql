-- Script para crear la tabla de tracking de oyentes de radio
-- Ejecutar en Supabase SQL Editor

-- 1. Crear la tabla radio_listeners
CREATE TABLE IF NOT EXISTS radio_listeners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  station TEXT NOT NULL DEFAULT 'selecta_fm',
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_radio_listeners_session ON radio_listeners(session_id);
CREATE INDEX IF NOT EXISTS idx_radio_listeners_station ON radio_listeners(station);
CREATE INDEX IF NOT EXISTS idx_radio_listeners_heartbeat ON radio_listeners(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_radio_listeners_station_heartbeat ON radio_listeners(station, last_heartbeat);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE radio_listeners ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de acceso
-- Permitir que cualquiera pueda insertar (registrar oyente)
CREATE POLICY "Permitir inserción pública" ON radio_listeners
  FOR INSERT
  WITH CHECK (true);

-- Permitir que cualquiera pueda leer (ver contador)
CREATE POLICY "Permitir lectura pública" ON radio_listeners
  FOR SELECT
  USING (true);

-- Permitir actualizar solo tu propia sesión (heartbeat)
CREATE POLICY "Permitir actualización de propia sesión" ON radio_listeners
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Permitir eliminar solo tu propia sesión (al desconectarse)
CREATE POLICY "Permitir eliminación de propia sesión" ON radio_listeners
  FOR DELETE
  USING (true);

-- 5. Habilitar Realtime para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE radio_listeners;

-- 6. Crear función para limpiar sesiones inactivas automáticamente
CREATE OR REPLACE FUNCTION cleanup_inactive_listeners()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Eliminar oyentes que no han enviado heartbeat en los últimos 5 minutos
  DELETE FROM radio_listeners
  WHERE last_heartbeat < NOW() - INTERVAL '5 minutes';
END;
$$;

-- 7. Crear un cron job para ejecutar la limpieza cada 5 minutos (opcional)
-- Nota: Necesitas tener la extensión pg_cron habilitada en Supabase
-- SELECT cron.schedule(
--   'cleanup-inactive-listeners',
--   '*/5 * * * *', -- Cada 5 minutos
--   'SELECT cleanup_inactive_listeners();'
-- );

-- 8. Comentarios para documentación
COMMENT ON TABLE radio_listeners IS 'Tabla para trackear oyentes activos de la radio en tiempo real';
COMMENT ON COLUMN radio_listeners.session_id IS 'ID único de la sesión del oyente';
COMMENT ON COLUMN radio_listeners.station IS 'Identificador de la estación de radio';
COMMENT ON COLUMN radio_listeners.last_heartbeat IS 'Último timestamp de actividad del oyente';

-- 9. Verificar la creación
SELECT
  'Tabla radio_listeners creada exitosamente' as status,
  COUNT(*) as oyentes_actuales
FROM radio_listeners
WHERE last_heartbeat > NOW() - INTERVAL '2 minutes';
