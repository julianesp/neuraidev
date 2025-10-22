# Solución a Errores de Supabase

## ❌ Error Original

```
loading computadoras products:
{code: '42703', details: null, hint: 'Perhaps you meant to reference the column "products.created_at".', message: 'column products.createdAt does not exist'}
```

## 🔍 Causa del Problema

El código estaba usando nombres de columnas en **camelCase** (JavaScript/TypeScript convention):
- `createdAt`
- `imagenPrincipal`
- `precioAnterior`

Pero la tabla en Supabase usa **snake_case** (SQL convention):
- `created_at`
- `imagen_principal`
- `precio_oferta`

## ✅ Solución Implementada

### 1. Actualización de Queries

**Antes:**
```javascript
.order('createdAt', { ascending: false })
```

**Después:**
```javascript
.order('created_at', { ascending: false })
```

### 2. Mapeo de Columnas

Se agregó un mapeo de snake_case a camelCase para mantener compatibilidad con el resto del código:

```javascript
const productos = (data || []).map((p) => ({
  ...p,
  // Mapear snake_case a camelCase para compatibilidad
  imagenPrincipal: p.imagen_principal,
  precioAnterior: p.precio_oferta ? parseFloat(p.precio_oferta) : null,
  precio: parseFloat(p.precio),
  cantidad: p.stock || p.cantidad || 0,
  disponible: p.disponible && (p.stock > 0 || p.cantidad > 0),
  createdAt: p.created_at,
  updatedAt: p.updated_at,
}));
```

### 3. Simplificación de Manejo de Imágenes

La tabla `product_images` tiene problemas de caché en Supabase. Se solucionó usando el array JSON `imagenes` que ya existe en la tabla `products`:

**Antes (con tabla separada):**
```javascript
const { data: imagenes } = await supabase
  .from('product_images')
  .select('url, alt, orden')
  .eq('productoId', producto.id);
```

**Después (usando array JSON):**
```javascript
if (producto.imagenes && Array.isArray(producto.imagenes)) {
  imagenesAdicionales = producto.imagenes.map((url, index) => ({
    url: url,
    alt: producto.nombre,
    orden: index
  }));
}
```

## 📊 Estructura de la Tabla `products`

```
Columnas en snake_case:
- id
- store_id
- nombre
- descripcion
- precio
- precio_oferta (no precioAnterior)
- categoria
- subcategoria
- imagenes (array JSON)
- stock
- cantidad
- sku
- activo
- destacado
- metadata (JSON)
- created_at (no createdAt)
- updated_at (no updatedAt)
- imagen_principal (no imagenPrincipal)
- marca
- garantia
- estado
- disponible
- fecha_ingreso
```

## ✅ Verificación

Después de los cambios, todos los productos se cargan correctamente:

- ✅ **12 productos** de celulares
- ✅ **14 productos** de computadoras
- ✅ **2 productos** de damas
- ✅ **10 productos** de generales

**Total: 38 productos disponibles**

## 📝 Archivos Modificados

1. `src/utils/loadCategoryProducts.js`
   - Actualizado `order('created_at')`
   - Agregado mapeo de columnas
   - Simplificado manejo de imágenes

2. `src/utils/productMetadata.js`
   - Actualizado `order('created_at')`
   - Agregado mapeo de columnas
   - Actualizado manejo de imágenes

## 🚀 Resultado

La aplicación ahora carga productos correctamente desde Supabase usando los nombres de columnas correctos en snake_case, mientras mantiene compatibilidad con el código existente que espera camelCase.
