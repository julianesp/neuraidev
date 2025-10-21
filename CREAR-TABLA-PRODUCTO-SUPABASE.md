# 🚀 Crear Tabla "Producto" en Supabase

## 🔴 PROBLEMA IDENTIFICADO

Los productos no aparecen en el dashboard porque **la tabla `Producto` no existe en tu base de datos de Supabase**.

**Error encontrado:**
```
Could not find the table 'public.Producto' in the schema cache
```

## ✅ SOLUCIÓN RÁPIDA

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. **Ve a Supabase Dashboard**
   - Abre: https://supabase.com/dashboard
   - Inicia sesión con tu cuenta
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral izquierdo, haz clic en **"SQL Editor"**
   - Haz clic en **"+ New query"**

3. **Copia y pega el script**
   - Abre el archivo `supabase-schema-producto.sql` de este proyecto
   - Copia TODO el contenido
   - Pégalo en el SQL Editor de Supabase

4. **Ejecuta el script**
   - Haz clic en el botón **"Run"** (esquina inferior derecha)
   - Espera a que termine (verás "Success" si todo sale bien)

5. **Verifica que funcionó**
   - Ve a **"Table Editor"** en el menú lateral
   - Deberías ver la tabla **"Producto"** en la lista
   - Haz clic en ella para ver los productos de ejemplo

### Opción 2: Desde la Terminal (Si tienes Supabase CLI)

```bash
# Asegúrate de estar conectado a tu proyecto
supabase db push

# O ejecuta el script directamente
supabase db execute --file supabase-schema-producto.sql
```

## 📋 ¿Qué hace el script?

El script `supabase-schema-producto.sql` hace lo siguiente:

1. ✅ **Crea la tabla `Producto`** con todos los campos necesarios:
   - `id`: Identificador único
   - `nombre`: Nombre del producto
   - `descripcion`: Descripción detallada
   - `precio`: Precio en COP
   - `stock` y `cantidad`: Inventario
   - `categoria`: Categoría del producto
   - `sku`: Código único del producto
   - `disponible`: Si está disponible para la venta
   - `destacado`: Si aparece como destacado
   - `imagenPrincipal`: URL de la imagen principal
   - `imagenes`: Array de imágenes adicionales (JSON)
   - `createdAt` y `updatedAt`: Timestamps automáticos

2. ✅ **Crea índices** para mejorar el rendimiento de las consultas

3. ✅ **Configura triggers** para actualizar `updatedAt` automáticamente

4. ✅ **Habilita Row Level Security (RLS)** con políticas:
   - Cualquiera puede ver productos disponibles
   - Usuarios autenticados pueden hacer todo (CRUD)

5. ✅ **Inserta 5 productos de ejemplo** para que veas datos inmediatamente

## 🧪 Verificar que Funcionó

### Opción 1: Desde Supabase Dashboard

1. Ve a **"Table Editor"**
2. Selecciona la tabla **"Producto"**
3. Deberías ver 5 productos de ejemplo

### Opción 2: Desde tu terminal

```bash
# Ejecuta el script de prueba
node test-supabase-connection.js
```

Deberías ver algo como:
```
✅ Conexión exitosa a Supabase
📊 Total de productos en la base de datos: 5
✅ Productos disponibles: 5
⭐ Productos destacados: 2
```

### Opción 3: Desde el Dashboard

1. Asegúrate de que el servidor esté corriendo: `npm run dev`
2. Ve a: `http://localhost:3000/dashboard/productos`
3. Deberías ver los 5 productos de ejemplo listados

## 🔧 Problemas Comunes

### Error: "permission denied for table Producto"

**Causa:** Las políticas de RLS no se aplicaron correctamente.

**Solución:**
1. Ve a Supabase Dashboard > Authentication > Policies
2. Verifica que existan políticas para la tabla `Producto`
3. Si no existen, vuelve a ejecutar el script SQL

### Error: "relation 'Producto' already exists"

**Causa:** La tabla ya existe pero puede tener una estructura diferente.

**Solución Opción 1 (Recrear tabla):**
```sql
-- CUIDADO: Esto BORRA la tabla existente y todos sus datos
DROP TABLE IF EXISTS public."Producto" CASCADE;
-- Luego ejecuta el script completo de nuevo
```

**Solución Opción 2 (Mantener datos existentes):**
Comenta las líneas de CREATE TABLE en el script y solo ejecuta las políticas de RLS.

### Los productos aún no aparecen en el dashboard

Verifica:

1. **Recarga la página completamente** (Ctrl+Shift+R o Cmd+Shift+R)

2. **Verifica la consola del navegador** (F12 > Console):
   - Busca errores en rojo
   - Si ves errores de RLS, verifica las políticas

3. **Verifica que estás autenticado**:
   - Debes iniciar sesión con tu cuenta de Clerk
   - Tu email debe estar en la variable `ADMIN_EMAILS`

4. **Verifica las variables de entorno**:
   ```bash
   # Asegúrate de tener en .env.local:
   NEXT_PUBLIC_SUPABASE_URL="..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   ADMIN_EMAILS="tu-email@gmail.com,..."
   ```

5. **Reinicia el servidor**:
   ```bash
   # Detener (Ctrl+C)
   npm run dev
   ```

## 📊 Próximos Pasos

Una vez que veas los productos en el dashboard:

1. ✅ **Edita los productos de ejemplo** con información real
2. ✅ **Agrega tus propios productos** usando el botón "+ Nuevo Producto"
3. ✅ **Sube imágenes** de productos (si configuraste Storage en Supabase)
4. ✅ **Configura categorías** según tus necesidades

## 🔒 Seguridad

Las políticas de RLS configuradas en el script permiten:

- ✅ Usuarios NO autenticados: Solo pueden VER productos disponibles
- ✅ Usuarios autenticados: Pueden ver, crear, editar y eliminar productos

Si quieres más control (por ejemplo, que solo admins puedan editar), necesitarás ajustar las políticas en Supabase Dashboard.

## 📚 Archivos Relacionados

- **Script SQL:** `supabase-schema-producto.sql`
- **Script de prueba:** `test-supabase-connection.js`
- **Servicio de productos:** `src/lib/supabase/productos.js`
- **Dashboard:** `src/app/dashboard/productos/page.jsx`

## ❓ Preguntas Frecuentes

### ¿Perderé datos si ejecuto el script?

No, el script usa `CREATE TABLE IF NOT EXISTS` y `ON CONFLICT DO NOTHING`, por lo que no sobrescribirá datos existentes.

### ¿Debo ejecutar el script cada vez que inicie el proyecto?

No, solo una vez. La tabla quedará permanentemente en tu base de datos de Supabase.

### ¿Puedo usar Neon en lugar de Supabase?

Sí, pero necesitarías modificar `src/lib/supabase/productos.js` para usar el cliente de Neon en lugar de Supabase.

### ¿Cómo borro los productos de ejemplo?

1. Ve a Supabase Dashboard > Table Editor > Producto
2. Selecciona los productos que quieras eliminar
3. Haz clic en el botón de eliminar

O desde SQL Editor:
```sql
DELETE FROM public."Producto" WHERE id IN (1,2,3,4,5);
```
