# 🚀 Guía de Migración de JSON a Supabase

Esta guía te ayudará a migrar tus productos de archivos JSON a Supabase para poder gestionarlos desde un dashboard.

## 📋 Pasos de Migración

### 1. Actualizar el Esquema de Supabase

1. Abre el SQL Editor de Supabase: https://app.supabase.com/project/yfglwidanlpqsmbnound/sql
2. Copia y pega el contenido del archivo `supabase-productos-migration.sql`
3. Ejecuta el script (botón "Run")
4. Verifica que se hayan agregado las nuevas columnas a la tabla `products`

### 2. Ejecutar el Script de Migración

```bash
# Asegúrate de estar en el directorio del proyecto
cd /home/neuraidev/Documentos/sites/neuraidev

# Ejecuta el script de migración
node scripts/migrate-json-to-supabase.js
```

El script:
- ✅ Leerá todos los archivos JSON en `/public`
- ✅ Transformará los productos al formato de Supabase
- ✅ Los insertará en la base de datos
- ✅ Mostrará un resumen de la migración

**Resultado esperado:**
```
🚀 Iniciando migración de productos a Supabase...

📂 Procesando celulares.json...
   Encontrados 12 productos
   ✅ Insertados 12 productos (lote 1)

📂 Procesando computadoras.json...
   ...

==================================================
📊 RESUMEN DE MIGRACIÓN
==================================================
✅ Productos migrados exitosamente: XX
❌ Errores: 0
==================================================
```

### 3. Verificar la Migración

1. Abre Supabase Table Editor: https://app.supabase.com/project/yfglwidanlpqsmbnound/editor
2. Selecciona la tabla `products`
3. Verifica que:
   - Los productos se hayan insertado correctamente
   - Las imágenes estén en formato de array
   - Las categorías sean correctas
   - Los precios estén en formato numérico

### 4. Actualizar los Servicios del Frontend

Ahora que los datos están en Supabase, necesitas actualizar los componentes que usan los archivos JSON.

#### 4.1 Actualizar `AccesoriosDestacados.jsx`

```javascript
// ANTES
import { obtenerAccesoriosDestacados } from "../accesoriosService";

// DESPUÉS
import { obtenerProductosDestacados } from "../../lib/supabase/productos";
```

#### 4.2 Actualizar `ProductosRecientes.jsx`

```javascript
// ANTES
import { obtenerProductosRecientes } from "../productosRecientesService";

// DESPUÉS
import { obtenerProductosRecientes } from "../../lib/supabase/productos";
```

#### 4.3 Actualizar páginas de categorías

En archivos como `/src/app/accesorios/celulares/page.jsx`:

```javascript
// ANTES
import { loadCategoryProducts } from "../../../utils/loadCategoryProducts";

// DESPUÉS
import { obtenerProductosPorCategoria } from "../../../lib/supabase/productos";

export default async function AccesoriosCelularesPage() {
  const productos = await obtenerProductosPorCategoria('celulares');
  // ... resto del código
}
```

## 🎨 Usar el Dashboard

### Acceder al Dashboard

1. Inicia sesión con tu cuenta de Clerk
2. Ve a: http://localhost:3000/dashboard/productos
3. Aquí podrás:
   - ✅ Ver todos los productos
   - ✅ Filtrar por categoría
   - ✅ Buscar productos
   - ✅ Crear nuevos productos
   - ✅ Editar productos existentes
   - ✅ Eliminar productos
   - ✅ Ver estadísticas

### Crear un Producto

1. Click en "Nuevo Producto"
2. Completa el formulario:
   - Nombre (requerido)
   - Descripción
   - Categoría (requerido)
   - Precio (requerido)
   - Stock
   - Imágenes (URLs)
   - Estados (Activo, Disponible, Destacado)
3. Click en "Guardar Producto"

### Gestionar Stock

Desde la tabla de productos, puedes:
- Ver el stock actual de cada producto
- El color indica el nivel:
  - 🟢 Verde: Stock > 10
  - 🟡 Amarillo: Stock 1-10
  - 🔴 Rojo: Sin stock

## 🔄 Mantener Sincronización (Opcional)

Si quieres mantener los archivos JSON como respaldo:

```bash
# Crear script de exportación
node scripts/export-supabase-to-json.js
```

## ⚠️ Notas Importantes

### Antes de migrar:

1. **Haz backup de tus archivos JSON actuales:**
   ```bash
   cp -r public public_backup
   ```

2. **Verifica que tienes las credenciales de Supabase en `.env.local`:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Después de migrar:

1. Los archivos JSON en `/public` ya no se usarán
2. Todos los cambios se deben hacer desde el dashboard
3. Los productos se actualizarán en tiempo real
4. Puedes eliminar los archivos JSON si quieres (después de verificar que todo funciona)

## 🐛 Solución de Problemas

### Error: "Variables de entorno no configuradas"
- Verifica que `.env.local` tenga las claves de Supabase
- Reinicia el servidor de desarrollo

### Error: "Cannot insert into table"
- Verifica que ejecutaste el script SQL primero
- Revisa las políticas RLS en Supabase

### Los productos no aparecen en el sitio
- Verifica que `disponible = true` y `activo = true`
- Revisa que la categoría esté correcta
- Limpia la caché del navegador

### Error al crear/editar productos
- Verifica que estás autenticado con Clerk
- Revisa los permisos de Supabase
- Verifica las políticas RLS

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [API de Supabase](https://supabase.com/docs/reference/javascript/introduction)

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu tienda estará usando Supabase y podrás gestionar productos desde el dashboard.

**Próximas mejoras sugeridas:**
- 📤 Subir imágenes a Supabase Storage
- 📊 Reportes y analytics
- 🛒 Sistema de pedidos
- 📧 Notificaciones por email
- 🏷️ Sistema de descuentos
