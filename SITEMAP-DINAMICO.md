# Sitemap Dinámico - Neurai.dev

## Descripción

Este proyecto utiliza un **sitemap dinámico** generado automáticamente por Next.js que incluye:

- ✅ Todas las páginas estáticas del sitio
- ✅ Productos disponibles desde Supabase
- ✅ Fechas de última modificación reales
- ✅ Prioridades optimizadas para SEO
- ✅ Generación automática en cada build

## Ubicación del archivo

El sitemap se genera desde: `src/app/sitemap.js`

Next.js automáticamente detecta este archivo y sirve el sitemap en:
- `https://www.neurai.dev/sitemap.xml`

## Cómo funciona

### 1. Páginas estáticas

El sitemap incluye todas las páginas públicas del sitio con sus respectivas prioridades:

| Tipo de página | Prioridad | Frecuencia de cambio |
|---------------|-----------|---------------------|
| Homepage | 1.0 | Diaria |
| Categorías principales | 0.95 | Semanal |
| Servicios | 0.85-0.90 | Mensual |
| Blog | 0.75-0.85 | Semanal/Mensual |
| Páginas legales | 0.30 | Anual |

### 2. Productos dinámicos

El sitemap consulta la tabla `products` de Supabase y genera URLs automáticamente:

```javascript
// Estructura de cada producto en el sitemap
{
  url: 'https://www.neurai.dev/accesorios/{categoria}/{slug}',
  lastModified: producto.updated_at,
  changeFrequency: 'weekly',
  priority: producto.destacado ? 0.85 : 0.80
}
```

### 3. Generación de slugs

Los slugs de productos se generan automáticamente desde el nombre:

```
Ejemplo:
  Nombre: "Funda para iPhone 13 Pro Max"
  Slug: "funda-para-iphone-13-pro-max"
```

## Páginas EXCLUIDAS del sitemap

Las siguientes páginas NO se incluyen porque:

### Páginas privadas (requieren autenticación)
- `/sign-in` - Inicio de sesión
- `/sign-up` - Registro
- `/dashboard/*` - Panel administrativo
- `/pago-epayco/*` - Páginas de pago
- `/respuesta-pago` - Confirmación de pago
- `/thank-you` - Página post-compra

### Páginas de desarrollo
- `/test-user` - Página de pruebas

**Nota:** Estas páginas están bloqueadas en `robots.txt`

## Verificar el sitemap

### En desarrollo local

```bash
npm run dev
# Visitar: http://localhost:3000/sitemap.xml
```

### En producción

```bash
# Verificar en el navegador
curl https://www.neurai.dev/sitemap.xml

# O en el navegador:
# https://www.neurai.dev/sitemap.xml
```

## Validación del sitemap

Puedes validar el sitemap usando:

1. **Google Search Console**
   - https://search.google.com/search-console

2. **Validador XML de Sitemaps**
   - https://www.xml-sitemaps.com/validate-xml-sitemap.html

3. **Bing Webmaster Tools**
   - https://www.bing.com/webmasters

## Actualización automática

El sitemap se regenera automáticamente en cada:

- ✅ Build de producción (`npm run build`)
- ✅ Deploy a Vercel
- ✅ Revalidación de páginas (ISR)

**No necesitas hacer nada manualmente** - el sitemap siempre estará actualizado.

## Configuración de robots.txt

El archivo `public/robots.txt` referencia el sitemap:

```
Sitemap: https://www.neurai.dev/sitemap.xml
Sitemap: https://neurai.dev/sitemap.xml
```

## Optimizaciones SEO implementadas

1. ✅ **Prioridades correctas** - Páginas importantes tienen mayor prioridad
2. ✅ **Fechas reales** - `lastModified` basado en `updated_at` de productos
3. ✅ **Productos destacados** - Mayor prioridad (0.85 vs 0.80)
4. ✅ **URLs limpias** - Slugs SEO-friendly sin caracteres especiales
5. ✅ **Frecuencia de cambio** - Optimizada por tipo de contenido
6. ✅ **Fallback seguro** - Si falla la BD, devuelve páginas estáticas

## Mantenimiento

### Agregar nuevas páginas estáticas

Edita `src/app/sitemap.js` y agrega la URL al array `staticPages`:

```javascript
{
  url: `${baseUrl}/nueva-pagina`,
  lastModified: currentDate,
  changeFrequency: 'weekly',
  priority: 0.80,
}
```

### Cambiar prioridades

Ajusta los valores de `priority` según la importancia de la página:
- 1.0 = Máxima importancia
- 0.0 = Mínima importancia

### Logs y debugging

El sitemap genera logs en la consola:

```
[sitemap] Generadas 150 URLs de productos
[sitemap] Error obteniendo productos de Supabase: ...
```

## Archivos relacionados

- `src/app/sitemap.js` - Generador del sitemap dinámico
- `public/robots.txt` - Configuración de robots
- `src/lib/db.js` - Cliente de Supabase
- `public/sitemap.xml.backup` - Backup del sitemap estático anterior

## Recursos útiles

- [Next.js Sitemap Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)

---

Última actualización: 2025-11-04
