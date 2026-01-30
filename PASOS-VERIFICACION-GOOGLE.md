# Pasos para Verificar neurai.dev en Google Search Console

## IMPORTANTE: Lee esto primero

Tu sitio **ya tiene un sitemap funcionando correctamente** en:
- https://neurai.dev/sitemap.xml

El problema es que **Google no lo ha indexado aún** porque:
1. No has verificado la propiedad del sitio en Google Search Console
2. No has enviado el sitemap a Google manualmente
3. Google puede tardar semanas en encontrar un sitio nuevo por sí solo

## Solución Rápida (15 minutos)

### Paso 1: Accede a Google Search Console
1. Ve a: https://search.google.com/search-console
2. Inicia sesión con tu cuenta de Google

### Paso 2: Agregar Propiedad (Elige UNA opción)

#### OPCIÓN A: Verificación por Meta Tag (Más Rápido)
1. En Google Search Console, haz clic en "Agregar propiedad"
2. Selecciona "Prefijo de URL"
3. Escribe: `https://neurai.dev`
4. Selecciona el método "Etiqueta HTML"
5. Copia el código que se ve así:
   ```html
   <meta name="google-site-verification" content="CODIGO_AQUI" />
   ```
6. **DIME EL CÓDIGO** y yo lo agrego al sitio
7. Haz clic en "Verificar"

#### OPCIÓN B: Verificación por Archivo HTML
1. En Google Search Console, haz clic en "Agregar propiedad"
2. Selecciona "Prefijo de URL"
3. Escribe: `https://neurai.dev`
4. Selecciona "Archivo HTML"
5. Descarga el archivo (ej: `google1234567890abcdef.html`)
6. **ENVÍAME EL ARCHIVO** y yo lo subo al servidor
7. Haz clic en "Verificar"

#### OPCIÓN C: Verificación por DNS (Más Permanente)
1. En Google Search Console, haz clic en "Agregar propiedad"
2. Selecciona "Dominio"
3. Escribe: `neurai.dev`
4. Google te dará un registro TXT como:
   ```
   google-site-verification=abc123def456ghi789
   ```
5. Ve a tu proveedor de dominio (ej: GoDaddy, Namecheap, etc.)
6. Agrega un registro TXT con ese valor
7. Espera 10-30 minutos
8. Vuelve a Google Search Console y haz clic en "Verificar"

### Paso 3: Enviar Sitemap
1. Una vez verificado, ve a "Sitemaps" en el menú lateral
2. En el campo "Agregar un sitemap nuevo", escribe: `sitemap.xml`
3. Haz clic en "Enviar"
4. Deberías ver el estado "Correcto" en unos minutos

### Paso 4: Solicitar Indexación de URLs Principales
Para acelerar el proceso, solicita indexación manual de estas URLs:

1. Haz clic en "Inspección de URLs" (arriba)
2. Ingresa cada una de estas URLs y haz clic en "Solicitar indexación":
   ```
   https://neurai.dev
   https://neurai.dev/accesorios
   https://neurai.dev/accesorios/celulares
   https://neurai.dev/accesorios/computadoras
   https://neurai.dev/servicios
   ```

## ¿Cuánto tarda en aparecer en Google?

- **Verificación del sitio**: Inmediato
- **Primera indexación**: 24-72 horas
- **Indexación completa**: 1-2 semanas
- **Aparecer en búsquedas relevantes**: 2-4 semanas

## Verificar que está funcionando

### Opción 1: Comando en Google
Busca en Google:
```
site:neurai.dev
```

Si ves resultados, Google ha comenzado a indexar tu sitio.

### Opción 2: Google Search Console
Ve a "Rendimiento" → deberías empezar a ver impresiones y clics después de unos días.

## Problemas Comunes

### "No puedo verificar el sitio"
- **Asegúrate de tener acceso de administrador** al dominio
- Prueba con otro método de verificación
- Espera 24 horas si acabas de configurar el dominio

### "El sitemap se envió pero no se lee"
- Verifica que https://neurai.dev/sitemap.xml funcione
- Espera 24-48 horas
- Revisa errores en la pestaña "Cobertura"

### "No aparece en búsquedas después de 1 semana"
- Normal para sitios nuevos
- Sigue creando contenido de calidad
- Comparte enlaces en redes sociales
- Consigue backlinks de otros sitios

## Mejoras Adicionales para SEO

### 1. Crear Cuenta de Google My Business
Si tienes una ubicación física:
- https://www.google.com/business/

### 2. Agregar Structured Data
Ya lo tienes implementado ✅

### 3. Mejorar Velocidad del Sitio
Usa Google PageSpeed Insights:
- https://pagespeed.web.dev/

### 4. Crear Contenido Regular
- Publica 1-2 artículos de blog por semana
- Actualiza descripciones de productos
- Agrega nuevos productos regularmente

## Necesitas Ayuda?

**DIME:**
1. ¿Cuál método de verificación prefieres? (Meta tag, archivo HTML, o DNS)
2. Si eliges meta tag o archivo HTML, **comparte el código/archivo conmigo**
3. Te ayudo a implementarlo en el sitio

## Estado Actual
- ✅ Sitemap generado correctamente
- ✅ Robots.txt configurado
- ✅ Meta tags implementados
- ⏳ **PENDIENTE: Verificación en Google Search Console** ← TÚ DEBES HACER ESTO
- ⏳ **PENDIENTE: Enviar sitemap a Google** ← TÚ DEBES HACER ESTO DESPUÉS

---

**PRÓXIMO PASO INMEDIATO**: Ve a https://search.google.com/search-console y comienza la verificación.
