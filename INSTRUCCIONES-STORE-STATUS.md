# Instrucciones para Configurar el Estado de la Tienda

## Paso 1: Crear la tabla en Supabase

Para que el sistema de estado de tienda funcione, necesitas crear la tabla `StoreStatus` en tu base de datos de Supabase.

### Opción A: Usando el SQL Editor de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. En el menú lateral, haz clic en "SQL Editor"
3. Haz clic en "New Query"
4. Copia y pega el contenido del archivo: `scripts/create-store-status-table.sql`
5. Haz clic en "Run" para ejecutar el SQL

### Opción B: Usando el script de Node.js

Una vez que la tabla esté creada manualmente con el SQL, puedes verificar que todo funciona ejecutando:

```bash
node scripts/setup-store-status-v2.js
```

## Paso 2: Verificar la configuración

Después de crear la tabla, el script debería mostrar:
- ✅ Tabla StoreStatus encontrada
- ✅ Estado inicial configurado exitosamente

## ¿Qué hace el sistema?

### Funcionalidades implementadas:

1. **Horario automático (8:00 AM - 6:00 PM)**
   - La tienda se abre automáticamente a las 8:00 AM
   - La tienda se cierra automáticamente a las 6:00 PM
   - El estado se actualiza cada 60 segundos

2. **Control manual desde el Dashboard**
   - Puedes abrir/cerrar la tienda manualmente desde `/dashboard/tienda`
   - El control manual sobrescribe el horario automático
   - Puedes volver al horario automático en cualquier momento

3. **Indicador visual en el sitio**
   - Un badge flotante muestra el estado actual (Abierta/Cerrada)
   - Se actualiza en tiempo real cuando cambias el estado desde el dashboard
   - Tiene animación pulsante cuando la tienda está abierta
   - Es responsive y se adapta a dispositivos móviles

4. **Características avanzadas**
   - Row Level Security (RLS) habilitado
   - Actualizaciones en tiempo real vía WebSockets
   - Fallback a localStorage si Supabase no está disponible
   - Triggers automáticos para actualizar `updated_at`

## Archivos modificados/creados:

- ✅ `src/components/StoreStatus/page.jsx` - Componente del indicador (actualizado con Supabase)
- ✅ `src/components/StoreStatus/StoreStatus.module.scss` - Estilos responsive (actualizado)
- ✅ `src/app/dashboard/tienda/page.jsx` - Panel de control (actualizado con controles)
- ✅ `src/components/NavBar.js` - Integración del indicador en navbar (actualizado)
- ✅ `src/styles/components/NavBar.module.scss` - Estilos para el wrapper (actualizado)
- ✅ `scripts/create-store-status-table.sql` - SQL para crear la tabla (nuevo)
- ✅ `scripts/setup-store-status-v2.js` - Script de verificación (nuevo)

## Estructura de la tabla StoreStatus:

```sql
id                - Serial (Primary Key)
is_open           - Boolean (Estado actual: abierta/cerrada)
manual_override   - Boolean (Si está en modo manual)
override_until    - Timestamp (Hasta cuándo dura el override manual, null = indefinido)
open_time         - Time (Hora de apertura, default: 08:00:00)
close_time        - Time (Hora de cierre, default: 18:00:00)
updated_at        - Timestamp (Última actualización, auto)
updated_by        - Text (Email del usuario que hizo el cambio)
```

## Uso:

### Para administradores:
1. Accede a `/dashboard/tienda`
2. Verás el estado actual de la tienda
3. Usa los botones para abrir/cerrar manualmente
4. Activa/desactiva el horario automático según necesites

### Para visitantes:
- Verán un indicador integrado en el navbar (junto al logo)
- Verde con animación pulsante = Tienda abierta
- Gris = Tienda cerrada
- Responsive: en móviles solo muestra el punto de color, en desktop muestra el texto completo

## Personalización del horario:

Si quieres cambiar el horario predeterminado (8:00 AM - 6:00 PM), modifica estos valores en el SQL:

```sql
open_time TIME NOT NULL DEFAULT '08:00:00',  -- Cambia esto
close_time TIME NOT NULL DEFAULT '18:00:00', -- Cambia esto
```

O actualiza los valores directamente desde Supabase después de crear la tabla.

## Troubleshooting:

### El indicador no aparece:
1. Verifica que la tabla `StoreStatus` existe en Supabase
2. Verifica que el registro con `id = 1` existe
3. Revisa la consola del navegador para ver errores

### No puedo cambiar el estado desde el dashboard:
1. Verifica que estás autenticado
2. Verifica que tienes acceso al dashboard
3. Revisa las políticas RLS en Supabase

### El horario automático no funciona:
1. Verifica que `manual_override` está en `false`
2. Verifica que los horarios `open_time` y `close_time` son correctos
3. El sistema verifica cada 60 segundos, espera un poco

## ¿Necesitas ayuda?

Si tienes problemas, revisa:
- Los logs de la consola del navegador
- Los logs de Supabase
- Verifica que las variables de entorno de Supabase están configuradas en `.env.local`
