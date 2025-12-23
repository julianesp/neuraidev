# Configuración del Contador de Oyentes en Vivo - Selecta FM

Esta guía explica cómo configurar el sistema de tracking de oyentes en tiempo real para la radio Selecta FM.

## Características Implementadas

✅ **Reproducción en segundo plano** - La radio sigue sonando cuando el celular está bloqueado
✅ **Controles nativos** - Controla la radio desde el lock screen y notificaciones
✅ **Contador de oyentes en tiempo real** - Muestra cuántas personas están escuchando
✅ **Actualización automática** - El contador se actualiza instantáneamente cuando alguien se conecta/desconecta

## Paso 1: Configurar la Tabla en Supabase

### Opción A: Usando el SQL Editor de Supabase

1. Ve a tu proyecto en Supabase: https://app.supabase.com
2. Clic en "SQL Editor" en el menú lateral
3. Clic en "New Query"
4. Copia y pega el contenido del archivo: `scripts/setup-radio-listeners-table.sql`
5. Clic en "Run" para ejecutar el script

### Opción B: Desde la Terminal

```bash
# Asegúrate de tener instalado el CLI de Supabase
# npm install -g supabase

# Ejecutar el script
supabase db push scripts/setup-radio-listeners-table.sql
```

## Paso 2: Verificar que la Tabla se Creó Correctamente

1. En Supabase, ve a "Table Editor"
2. Deberías ver una nueva tabla llamada `radio_listeners`
3. Verifica que tiene las siguientes columnas:
   - `id` (UUID)
   - `session_id` (TEXT)
   - `station` (TEXT)
   - `connected_at` (TIMESTAMPTZ)
   - `last_heartbeat` (TIMESTAMPTZ)
   - `user_agent` (TEXT)
   - `ip_address` (INET)
   - `created_at` (TIMESTAMPTZ)

## Paso 3: Habilitar Realtime (IMPORTANTE)

1. En Supabase, ve a "Database" → "Replication"
2. Busca la tabla `radio_listeners`
3. Asegúrate de que esté **habilitada** para Realtime
4. Si no lo está, habilítala haciendo clic en el switch

## Paso 4: Configurar Limpieza Automática (Opcional)

Para limpiar automáticamente las sesiones inactivas, puedes configurar un cron job:

1. Ve a "Database" → "Cron Jobs" en Supabase
2. Crea un nuevo job con:
   - **Name**: `cleanup-inactive-listeners`
   - **Schedule**: `*/5 * * * *` (cada 5 minutos)
   - **Command**: `SELECT cleanup_inactive_listeners();`

## Cómo Funciona

### 1. Reproducción en Segundo Plano

La página usa **Media Session API** que permite:
- Reproducir audio cuando el celular está bloqueado
- Mostrar controles en la pantalla de bloqueo
- Mostrar información de la estación en los controles nativos
- Controlar play/pause desde auriculares bluetooth

### 2. Tracking de Oyentes

Cuando alguien entra a la página:
1. Se genera un `session_id` único
2. Se registra en la tabla `radio_listeners`
3. Cada 30 segundos se envía un "heartbeat" para mantener la sesión activa
4. Cuando sale de la página, la sesión se elimina automáticamente

### 3. Contador en Tiempo Real

- El contador se actualiza usando **Supabase Realtime**
- Cuando alguien se conecta/desconecta, todos los demás usuarios ven el cambio instantáneamente
- El sistema considera "activos" solo a oyentes con heartbeat de los últimos 2 minutos

## Probar el Sistema

### Prueba Local

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre `http://localhost:3000/selecta` en varios navegadores/dispositivos

3. Verifica que:
   - El contador aumenta cuando abres nuevas pestañas
   - El contador disminuye cuando cierras pestañas
   - La radio sigue sonando cuando bloqueas el celular
   - Los controles aparecen en el lock screen

### Prueba en Producción

1. Despliega los cambios:
   ```bash
   git push origin main
   ```

2. Vercel automáticamente desplegará la nueva versión

3. Visita `https://neurai.dev/selecta`

## Monitoreo de Oyentes

### Ver Oyentes Actuales en Supabase

Ejecuta este query en el SQL Editor:

```sql
-- Ver todos los oyentes activos (últimos 2 minutos)
SELECT
  session_id,
  station,
  connected_at,
  last_heartbeat,
  AGE(NOW(), last_heartbeat) as tiempo_sin_heartbeat
FROM radio_listeners
WHERE last_heartbeat > NOW() - INTERVAL '2 minutes'
ORDER BY last_heartbeat DESC;
```

### Ver Estadísticas

```sql
-- Contador actual
SELECT COUNT(*) as oyentes_activos
FROM radio_listeners
WHERE last_heartbeat > NOW() - INTERVAL '2 minutes';

-- Pico de oyentes en el día
SELECT COUNT(*) as total_oyentes_hoy
FROM radio_listeners
WHERE connected_at > CURRENT_DATE;
```

## Solución de Problemas

### El contador no funciona

1. Verifica que la tabla `radio_listeners` existe
2. Verifica que Realtime está habilitado para la tabla
3. Revisa la consola del navegador para ver errores
4. Verifica que las variables de entorno de Supabase estén configuradas

### El audio no se reproduce con celular bloqueado

- Esto solo funciona en navegadores modernos que soportan Media Session API
- En iOS, el usuario debe agregarlo a la pantalla de inicio primero
- Algunos navegadores antiguos no soportan esta funcionalidad

### Las sesiones no se eliminan

1. Verifica que la función `cleanup_inactive_listeners()` existe
2. Configura el cron job como se indica arriba
3. O ejecuta manualmente: `SELECT cleanup_inactive_listeners();`

## Mejoras Futuras

- [ ] Historial de oyentes por hora/día
- [ ] Gráficos de audiencia
- [ ] Notificaciones cuando hay picos de audiencia
- [ ] Geolocalización de oyentes
- [ ] Analytics más detallados

## Referencias

- Media Session API: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- HTML Audio API: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
