-- ========================================
-- TABLA DE SOLICITUDES DE ELIMINACIÓN DE DATOS
-- ========================================
-- Este script crea la tabla para gestionar solicitudes de eliminación de datos
-- de acuerdo con GDPR y políticas de privacidad
-- Autor: Claude Code
-- Fecha: 2025-12-17

-- Crear tabla de solicitudes de eliminación
CREATE TABLE IF NOT EXISTS solicitudes_eliminacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referencia VARCHAR(100) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  razon TEXT,
  user_id VARCHAR(255),
  ip_address VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'rechazada', 'cancelada')),
  fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
  fecha_procesamiento TIMESTAMPTZ,
  fecha_completado TIMESTAMPTZ,
  notas_admin TEXT,
  procesado_por VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_solicitudes_eliminacion_referencia ON solicitudes_eliminacion(referencia);
CREATE INDEX IF NOT EXISTS idx_solicitudes_eliminacion_email ON solicitudes_eliminacion(email);
CREATE INDEX IF NOT EXISTS idx_solicitudes_eliminacion_user_id ON solicitudes_eliminacion(user_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_eliminacion_estado ON solicitudes_eliminacion(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_eliminacion_fecha ON solicitudes_eliminacion(fecha_solicitud DESC);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_solicitudes_eliminacion_updated_at ON solicitudes_eliminacion;
CREATE TRIGGER update_solicitudes_eliminacion_updated_at
  BEFORE UPDATE ON solicitudes_eliminacion
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vista para estadísticas de solicitudes
CREATE OR REPLACE VIEW solicitudes_eliminacion_stats AS
SELECT
  estado,
  COUNT(*) as total,
  COUNT(CASE WHEN fecha_solicitud > NOW() - INTERVAL '30 days' THEN 1 END) as ultimos_30_dias,
  COUNT(CASE WHEN fecha_solicitud > NOW() - INTERVAL '7 days' THEN 1 END) as ultimos_7_dias,
  AVG(EXTRACT(EPOCH FROM (COALESCE(fecha_completado, NOW()) - fecha_solicitud)) / 86400)::numeric(10,2) as dias_promedio_procesamiento
FROM solicitudes_eliminacion
GROUP BY estado;

-- Función para obtener solicitudes pendientes que necesitan atención
CREATE OR REPLACE FUNCTION get_solicitudes_pendientes_urgentes()
RETURNS TABLE (
  id UUID,
  referencia VARCHAR(100),
  nombre VARCHAR(255),
  email VARCHAR(255),
  dias_pendiente INTEGER,
  fecha_limite TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.referencia,
    s.nombre,
    s.email,
    EXTRACT(DAY FROM (NOW() - s.fecha_solicitud))::INTEGER as dias_pendiente,
    (s.fecha_solicitud + INTERVAL '30 days')::TIMESTAMPTZ as fecha_limite
  FROM solicitudes_eliminacion s
  WHERE s.estado = 'pendiente'
    AND s.fecha_solicitud < NOW() - INTERVAL '20 days'  -- Alertar 10 días antes del límite
  ORDER BY s.fecha_solicitud ASC;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad (Row Level Security)
ALTER TABLE solicitudes_eliminacion ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción pública (cualquiera puede solicitar eliminación)
DROP POLICY IF EXISTS "Permitir inserción pública" ON solicitudes_eliminacion;
CREATE POLICY "Permitir inserción pública"
  ON solicitudes_eliminacion
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir que usuarios vean solo sus propias solicitudes
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias solicitudes" ON solicitudes_eliminacion;
CREATE POLICY "Usuarios pueden ver sus propias solicitudes"
  ON solicitudes_eliminacion
  FOR SELECT
  USING (
    user_id = auth.jwt() ->> 'sub' OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Política para que solo admins puedan actualizar
DROP POLICY IF EXISTS "Solo admins pueden actualizar" ON solicitudes_eliminacion;
CREATE POLICY "Solo admins pueden actualizar"
  ON solicitudes_eliminacion
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Crear tabla de log de eliminaciones completadas (para auditoría)
CREATE TABLE IF NOT EXISTS log_eliminaciones_completadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID REFERENCES solicitudes_eliminacion(id),
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  datos_eliminados JSONB,
  fecha_eliminacion TIMESTAMPTZ DEFAULT NOW(),
  procesado_por VARCHAR(255),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para el log
CREATE INDEX IF NOT EXISTS idx_log_eliminaciones_user_id ON log_eliminaciones_completadas(user_id);
CREATE INDEX IF NOT EXISTS idx_log_eliminaciones_email ON log_eliminaciones_completadas(email);
CREATE INDEX IF NOT EXISTS idx_log_eliminaciones_fecha ON log_eliminaciones_completadas(fecha_eliminacion DESC);

-- RLS para log (solo admins pueden ver)
ALTER TABLE log_eliminaciones_completadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo admins pueden ver log" ON log_eliminaciones_completadas;
CREATE POLICY "Solo admins pueden ver log"
  ON log_eliminaciones_completadas
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Función para marcar solicitud como completada y registrar en el log
CREATE OR REPLACE FUNCTION completar_eliminacion(
  p_solicitud_id UUID,
  p_procesado_por VARCHAR(255),
  p_datos_eliminados JSONB,
  p_notas TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id VARCHAR(255);
  v_email VARCHAR(255);
BEGIN
  -- Obtener información de la solicitud
  SELECT user_id, email INTO v_user_id, v_email
  FROM solicitudes_eliminacion
  WHERE id = p_solicitud_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada';
  END IF;

  -- Actualizar la solicitud
  UPDATE solicitudes_eliminacion
  SET
    estado = 'completada',
    fecha_completado = NOW(),
    procesado_por = p_procesado_por,
    notas_admin = p_notas
  WHERE id = p_solicitud_id;

  -- Registrar en el log
  INSERT INTO log_eliminaciones_completadas (
    solicitud_id,
    user_id,
    email,
    datos_eliminados,
    procesado_por,
    notas
  ) VALUES (
    p_solicitud_id,
    v_user_id,
    v_email,
    p_datos_eliminados,
    p_procesado_por,
    p_notas
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ========================================

COMMENT ON TABLE solicitudes_eliminacion IS 'Almacena todas las solicitudes de eliminación de datos personales de usuarios';
COMMENT ON COLUMN solicitudes_eliminacion.referencia IS 'Número de referencia único para tracking de la solicitud';
COMMENT ON COLUMN solicitudes_eliminacion.estado IS 'Estado actual de la solicitud: pendiente, en_proceso, completada, rechazada, cancelada';
COMMENT ON COLUMN solicitudes_eliminacion.fecha_solicitud IS 'Fecha en que se realizó la solicitud';
COMMENT ON COLUMN solicitudes_eliminacion.fecha_completado IS 'Fecha en que se completó la eliminación (máximo 30 días desde solicitud)';

COMMENT ON TABLE log_eliminaciones_completadas IS 'Log de auditoría de eliminaciones de datos completadas (inmutable)';

COMMENT ON FUNCTION get_solicitudes_pendientes_urgentes() IS 'Retorna solicitudes pendientes que están cerca del límite de 30 días';
COMMENT ON FUNCTION completar_eliminacion IS 'Marca una solicitud como completada y registra la eliminación en el log de auditoría';

-- ========================================
-- CONSULTAS ÚTILES PARA ADMINISTRADORES
-- ========================================

-- Ver todas las solicitudes pendientes urgentes
-- SELECT * FROM get_solicitudes_pendientes_urgentes();

-- Ver estadísticas de solicitudes
-- SELECT * FROM solicitudes_eliminacion_stats;

-- Ver todas las solicitudes pendientes
-- SELECT * FROM solicitudes_eliminacion WHERE estado = 'pendiente' ORDER BY fecha_solicitud ASC;

-- Marcar solicitud como en proceso
-- UPDATE solicitudes_eliminacion SET estado = 'en_proceso', fecha_procesamiento = NOW() WHERE referencia = 'DEL-XXX';

-- Completar eliminación (ejemplo)
-- SELECT completar_eliminacion(
--   'UUID-de-la-solicitud',
--   'admin@neurai.dev',
--   '{"comentarios": 5, "likes": 12, "pedidos": 3}'::jsonb,
--   'Eliminación completada exitosamente'
-- );

-- Ver log de eliminaciones del último mes
-- SELECT * FROM log_eliminaciones_completadas WHERE fecha_eliminacion > NOW() - INTERVAL '30 days' ORDER BY fecha_eliminacion DESC;

-- ========================================
-- FINALIZACIÓN
-- ========================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla de solicitudes de eliminación creada exitosamente';
  RAISE NOTICE '📊 Ejecuta: SELECT * FROM solicitudes_eliminacion_stats; para ver estadísticas';
  RAISE NOTICE '⚠️  Ejecuta: SELECT * FROM get_solicitudes_pendientes_urgentes(); para ver solicitudes urgentes';
END $$;
