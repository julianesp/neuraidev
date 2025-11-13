# Sitemap Dinámico - Neurai.dev

## Descripción

Este proyecto utiliza un **sitemap generado automáticamente** desde la base de datos que incluye:

- ✅ Todas las páginas estáticas del sitio
- ✅ Productos disponibles desde Supabase
- ✅ Fechas de última modificación reales
- ✅ Prioridades optimizadas para SEO
- ✅ Generación automática en cada build de producción

## Ubicación y archivos

- **Script generador**: `scripts/generate-sitemap.js`
- **Archivo generado**: `public/sitemap.xml`
- **URL pública**: `https://www.neurai.dev/sitemap.xml`

## Cómo se genera

El sitemap se genera ejecutando el script Node.js que:
1. Se conecta a Supabase
2. Obtiene todos los productos disponibles
3. Combina páginas estáticas + productos dinámicos
4. Genera el archivo XML en `public/sitemap.xml`

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

## Comandos disponibles

### Generar sitemap manualmente

```bash
npm run generate:sitemap
```

Este comando:
- Consulta Supabase para obtener productos
- Genera el archivo `public/sitemap.xml`
- Muestra estadísticas (total de URLs, productos, etc.)

### En desarrollo local

```bash
# El sitemap está en public/sitemap.xml
# Acceder en: http://localhost:3000/sitemap.xml
```

### En producción

```bash
# El sitemap se genera automáticamente antes de cada build
npm run build  # Ejecuta: generate:sitemap && next build

# Verificar en producción:
curl https://www.neurai.dev/sitemap.xml
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
- ✅ Deploy a Vercel (ejecuta el build automáticamente)
- ✅ Manualmente ejecutando `npm run generate:sitemap`

### ¿Cuándo regenerar el sitemap?

**Se regenera automáticamente al hacer deploy**, pero puedes regenerarlo manualmente cuando:
- Agregues nuevos productos a la base de datos
- Quieras actualizar las fechas de modificación
- Hagas cambios en páginas estáticas

```bash
# Regenerar manualmente
npm run generate:sitemap

# Hacer commit y push
git add public/sitemap.xml
git commit -m "Update sitemap with latest products"
git push
```

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

- `scripts/generate-sitemap.js` - Script generador del sitemap
- `public/sitemap.xml` - Sitemap generado (incluido en git)
- `public/robots.txt` - Configuración de robots
- `src/lib/db.js` - Cliente de Supabase
- `package.json` - Comandos npm (build, generate:sitemap)

## Estadísticas del último sitemap generado

```
🚀 Generando sitemap.xml...

✅ 51 productos obtenidos desde Supabase
📄 Total de URLs: 84
   - Páginas estáticas: 33
   - Productos: 51

✅ Sitemap generado exitosamente
```

## Recursos útiles

- [Google Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Search Console](https://search.google.com/search-console)

## Troubleshooting

### Error: "No se ha podido leer el sitemap" en Google Search Console

**Solución:**
1. Verifica que el sitemap esté accesible: `https://www.neurai.dev/sitemap.xml`
2. Regenera el sitemap: `npm run generate:sitemap`
3. Haz commit y push a producción
4. Espera unos minutos y vuelve a enviar en Search Console

### El sitemap no incluye productos nuevos

**Solución:**
1. Ejecuta `npm run generate:sitemap` para regenerar
2. Verifica que los productos estén marcados como `disponible: true` en Supabase
3. Haz commit del archivo actualizado: `git add public/sitemap.xml`
4. Push a producción

### Error al conectar con Supabase

**Solución:**
1. Verifica que las variables de entorno estén configuradas en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Si faltan credenciales, el script generará solo páginas estáticas

---

Última actualización: 2025-11-04
