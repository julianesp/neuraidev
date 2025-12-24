-- 1. Limpiar TODAS las sesiones antiguas acumuladas
DELETE FROM radio_listeners
WHERE last_heartbeat < NOW() - INTERVAL '1 minute';

-- 2. Mostrar cuántas sesiones quedaron activas
SELECT
  COUNT(*) as total_sesiones,
  COUNT(CASE WHEN last_heartbeat > NOW() - INTERVAL '45 seconds' THEN 1 END) as activas_45s,
  COUNT(CASE WHEN last_heartbeat > NOW() - INTERVAL '1 minute' THEN 1 END) as activas_1min
FROM radio_listeners;

-- 3. Mostrar las sesiones activas restantes
SELECT
  session_id,
  station,
  connected_at,
  last_heartbeat,
  AGE(NOW(), last_heartbeat) as tiempo_inactivo
FROM radio_listeners
ORDER BY last_heartbeat DESC;
