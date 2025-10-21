# 🔒 PROBLEMA IDENTIFICADO: Row Level Security (RLS)

## 🔴 EL PROBLEMA

Los productos **NO se están actualizando** porque **Row Level Security (RLS)** de Supabase está bloqueando los UPDATEs silenciosamente.

**Evidencia:**
```
❌ UPDATE no afectó ninguna fila
   RLS bloqueó el UPDATE sin error explícito
```

Esto significa que:
- ✅ El código está correcto
- ✅ La conexión a Supabase funciona
- ❌ Las políticas de seguridad NO permiten UPDATE

## ✅ SOLUCIÓN RÁPIDA

### Opción 1: Deshabilitar RLS temporalmente (para desarrollo)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **"Authentication" > "Policies"**
4. Busca la tabla **"products"**
5. Haz clic en **"Disable RLS"** (botón toggle)

⚠️ **ADVERTENCIA:** Esto permite que CUALQUIERA edite productos. Solo para desarrollo.

### Opción 2: Configurar políticas correctas (RECOMENDADO para producción)

#### Paso 1: Ve al SQL Editor

1. Supabase Dashboard > **"SQL Editor"**
2. Haz clic en **"+ New query"**

#### Paso 2: Ejecuta este script SQL

```sql
-- 1. Verificar que RLS esté habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas (si existen)
DROP POLICY IF EXISTS "Cualquiera puede ver productos" ON products;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar" ON products;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar" ON products;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar" ON products;

-- 3. Crear política para SELECT (ver productos)
CREATE POLICY "Cualquiera puede ver productos disponibles"
ON products
FOR SELECT
USING (true);  -- Todos pueden ver todos los productos

-- 4. Crear política para INSERT (crear productos)
CREATE POLICY "Usuarios autenticados pueden crear productos"
ON products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Crear política para UPDATE (editar productos)
CREATE POLICY "Usuarios autenticados pueden actualizar productos"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Crear política para DELETE (eliminar productos)
CREATE POLICY "Usuarios autenticados pueden eliminar productos"
ON products
FOR DELETE
TO authenticated
USING (true);

-- 7. Verificar que las políticas se crearon
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'products';
```

#### Paso 3: Ejecutar

Haz clic en **"Run"** (esquina inferior derecha).

Deberías ver:
```
✅ Success
```

## 🧪 Verificar que Funcionó

### Test 1: Desde la terminal

```bash
node test-update-directo.js
```

Deberías ver:
```
✅ ¡UPDATE EXITOSO!
   Stock ANTES: 0
   Stock DESPUÉS: 10
```

### Test 2: Desde el dashboard

1. Ve a `http://localhost:3000/dashboard/productos`
2. Edita un producto
3. Cambia el stock de 0 a 5
4. Guarda
5. ✅ El stock debería actualizarse

## 🔍 Entender RLS

**Row Level Security (RLS)** es una característica de seguridad de PostgreSQL/Supabase que permite definir **quién puede hacer qué** con cada fila de la tabla.

### Tipos de políticas:

1. **SELECT** - Quién puede VER filas
2. **INSERT** - Quién puede CREAR filas
3. **UPDATE** - Quién puede EDITAR filas
4. **DELETE** - Quién puede ELIMINAR filas

### Roles en Supabase:

- `anon` - Usuarios NO autenticados
- `authenticated` - Usuarios autenticados (con Clerk, Auth0, etc.)
- `service_role` - Tu backend con permisos completos

## 📚 Políticas Explicadas

### Política de SELECT (Ver productos)
```sql
USING (true)  -- Todos pueden ver
```

### Política de UPDATE (Editar productos)
```sql
TO authenticated      -- Solo usuarios autenticados
USING (true)          -- Pueden editar cualquier fila
WITH CHECK (true)     -- Sin restricciones en los valores
```

## 🔐 Para Producción (Más Seguro)

Si quieres que **solo ciertos usuarios** puedan editar:

```sql
-- Opción A: Solo admins (requiere configurar email en Supabase Auth)
CREATE POLICY "Solo admins pueden actualizar"
ON products
FOR UPDATE
TO authenticated
USING (
  auth.email() IN (
    'julii1295@gmail.com',
    'admin@neurai.dev'
  )
);

-- Opción B: Basado en metadata de Clerk
-- (requiere configurar metadata en Clerk)
CREATE POLICY "Solo usuarios con rol admin"
ON products
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

## ⚠️ Problemas Comunes

### "Policy violated" error
- Las políticas están muy restrictivas
- Verifica que `TO authenticated` esté presente
- Asegúrate de que el usuario esté autenticado en Clerk

### UPDATE no afecta ninguna fila (silencioso)
- RLS está bloqueando sin error
- Ejecuta el script SQL de arriba

### "permission denied for table products"
- RLS no está configurado para tu rol
- Usa las políticas de arriba

## 🆘 Si Nada Funciona

Como último recurso (solo para debugging):

```sql
-- DESHABILITAR RLS COMPLETAMENTE
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

⚠️ **ADVERTENCIA:** Esto permite que CUALQUIERA edite sin restricciones.

Una vez que funcione, vuelve a habilitar RLS y configura las políticas correctamente:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- Luego ejecuta el script de políticas de arriba
```

## 📝 Resumen

1. ✅ El problema NO es tu código
2. ✅ El problema es RLS de Supabase
3. ✅ Ejecuta el script SQL de arriba
4. ✅ Los UPDATEs funcionarán

¿Necesitas ayuda? Revisa la consola del navegador para ver los logs detallados.
