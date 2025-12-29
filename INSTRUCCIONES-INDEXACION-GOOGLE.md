# Instrucciones para Indexar neurai.dev en Google

## Problema Detectado
Google Search Console indica que el sitio tiene una etiqueta "noindex" en el encabezado HTTP X-Robots-Tag, lo que impide la indexación.

## Cambios Realizados en el Código

### 1. **next.config.js** - Agregado header X-Robots-Tag explícito
```javascript
{
  key: "X-Robots-Tag",
  value: "index, follow",
}
```

Esto asegura que todas las páginas públicas tengan el header correcto para indexación.

### 2. **app/layout.js** - Ya configurado correctamente
El archivo ya tiene:
```javascript
robots: {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    ...
  }
}
```

## Pasos a Seguir

### Paso 1: Verificar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard: https://vercel.com/dashboard
2. Selecciona el proyecto `neuraidev`
3. Ve a **Settings** → **Environment Variables**
4. **VERIFICA** que NO existan estas variables con valor "noindex":
   - `NEXT_PUBLIC_ROBOTS`
   - `ROBOTS`
   - `X_ROBOTS_TAG`
   - Cualquier variable relacionada con robots

5. **ELIMINA** cualquier variable que contenga "noindex"

### Paso 2: Deploy de los Cambios

1. Haz commit de los cambios:
```bash
git add next.config.js INSTRUCCIONES-INDEXACION-GOOGLE.md
git commit -m "Fix: Agregar X-Robots-Tag header para permitir indexación de Google"
git push origin main
```

2. Vercel automáticamente hará el deploy

### Paso 3: Verificar los Headers en Producción

Después del deploy (espera 2-3 minutos), verifica los headers:

```bash
curl -I https://neurai.dev | grep -i "x-robots"
```

Deberías ver:
```
x-robots-tag: index, follow
```

### Paso 4: Solicitar Re-indexación en Google Search Console

1. Ve a Google Search Console: https://search.google.com/search-console
2. Selecciona la propiedad `neurai.dev`
3. En el menú lateral, ve a **Inspección de URL**
4. Ingresa la URL: `https://neurai.dev`
5. Haz clic en **SOLICITAR INDEXACIÓN**
6. Repite para las páginas principales:
   - `https://neurai.dev/accesorios`
   - `https://neurai.dev/accesorios/celulares`
   - `https://neurai.dev/accesorios/computadoras`
   - `https://neurai.dev/servicios`
   - `https://neurai.dev/blog`

### Paso 5: Verificar el Sitemap

1. Verifica que el sitemap esté accesible:
   - https://neurai.dev/sitemap.xml

2. En Google Search Console:
   - Ve a **Sitemaps**
   - Verifica que aparezca: `https://neurai.dev/sitemap.xml`
   - Si no está, agrégalo manualmente

### Paso 6: Verificar robots.txt

1. Verifica que robots.txt esté accesible:
   - https://neurai.dev/robots.txt

2. Debe contener:
```
User-agent: *
Allow: /
Sitemap: https://neurai.dev/sitemap.xml
```

## Tiempo de Indexación

- **Verificación inmediata**: Los headers cambiarán inmediatamente después del deploy
- **Re-crawleo de Google**: 1-3 días para las páginas solicitadas manualmente
- **Indexación completa**: 1-2 semanas para que todas las páginas sean indexadas

## Comandos de Verificación Adicionales

### Verificar que el sitio esté en Google
```bash
# Buscar en Google (desde el navegador)
site:neurai.dev
```

### Probar con Google Rich Results Test
1. Ve a: https://search.google.com/test/rich-results
2. Ingresa: `https://neurai.dev`
3. Verifica que no aparezcan errores de indexación

### Verificar metadatos
```bash
curl -s https://neurai.dev | grep -i "robots"
```

No debe aparecer `noindex` en ninguna parte.

## Posibles Problemas Adicionales

### Si después de 3 días sigue sin indexarse:

1. **Verifica en Vercel que no haya reglas de robots:**
   - Settings → General → No debe haber "Disable Indexing"

2. **Verifica que no haya redirects incorrectos:**
   - El sitio debe responder con código 200, no 301/302

3. **Verifica el archivo robots.js:**
   - app/robots.js debe tener `allow: "/"`

4. **Contacta a Vercel Support:**
   - Puede haber una configuración a nivel de proyecto que necesite soporte

## Recursos

- [Google Search Console](https://search.google.com/search-console)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Next.js Metadata Robots](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#robots)
- [Google Search Central - X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)

## Contacto

Si después de seguir todos estos pasos el sitio sigue sin indexarse, revisa:
1. Que no haya penalizaciones en Google Search Console
2. Que el dominio esté verificado en Google Search Console
3. Que no haya problemas de seguridad reportados

---
**Última actualización**: 28 de Diciembre de 2025
