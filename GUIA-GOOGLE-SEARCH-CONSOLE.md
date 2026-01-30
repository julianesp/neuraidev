# Guía para Indexar neurai.dev en Google Search Console

## Problema Actual

Tu sitio web **neurai.dev** no está apareciendo correctamente en las búsquedas de Google. Esto se debe a que Google no ha indexado todas las páginas del sitio.

## Solución Paso a Paso

### 1. Verificar Propiedad del Sitio en Google Search Console

#### Opción A: Verificación por DNS (Recomendado)

1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Haz clic en "Agregar propiedad"
3. Selecciona "Dominio" y escribe: `neurai.dev`
4. Google te dará un registro TXT para agregar a tu DNS
5. Ve a tu proveedor de dominio (donde compraste neurai.dev)
6. Agrega el registro TXT en la configuración DNS
7. Espera unos minutos y verifica en Google Search Console

#### Opción B: Verificación por archivo HTML

1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Haz clic en "Agregar propiedad"
3. Selecciona "Prefijo de URL" y escribe: `https://neurai.dev`
4. Descarga el archivo HTML de verificación
5. Coloca el archivo en: `/public/` de tu proyecto
6. Haz commit y push:
   ```bash
   git add public/google[...].html
   git commit -m "Agregar verificación de Google Search Console"
   git push
   ```
7. Espera el despliegue en Vercel
8. Verifica en Google Search Console

### 2. Enviar Sitemap a Google

Una vez verificada la propiedad:

1. En Google Search Console, ve a "Sitemaps" en el menú lateral
2. Ingresa la URL de tu sitemap: `https://neurai.dev/sitemap.xml`
3. Haz clic en "Enviar"
4. Espera 24-48 horas para que Google comience a indexar

### 3. Solicitar Indexación de Páginas Principales

Para acelerar el proceso:

1. Ve a "Inspección de URLs" en Google Search Console
2. Ingresa estas URLs una por una y haz clic en "Solicitar indexación":
   - `https://neurai.dev`
   - `https://neurai.dev/accesorios`
   - `https://neurai.dev/accesorios/celulares`
   - `https://neurai.dev/accesorios/computadoras`
   - `https://neurai.dev/servicios`

### 4. Verificar robots.txt

Tu archivo `robots.txt` está correcto:

```
User-agent: *
Allow: /
Sitemap: https://neurai.dev/sitemap.xml
```

### 5. Mejorar el SEO

#### Meta Descripción para Páginas Principales

Asegúrate de que cada página tenga:

- **Título único** (50-60 caracteres)
- **Descripción única** (150-160 caracteres)
- **Palabras clave relevantes**

#### Schema.org / Structured Data

Ya tienes Schema.org implementado en:

- Página principal (Organization)
- Productos (Product schema)

### 6. Tiempo de Indexación

**Importante**: Google puede tardar:

- **48-72 horas** para indexar las páginas principales
- **1-2 semanas** para indexar todas las páginas de productos
- **2-4 semanas** para aparecer en posiciones relevantes en búsquedas

## Verificar Estado de Indexación

### Comando para verificar en Google

Busca en Google:

```
site:neurai.dev
```

Esto te mostrará todas las páginas que Google ha indexado de tu sitio.

### Ver Cobertura en Google Search Console

1. Ve a "Cobertura" en el menú
2. Verifica que las páginas estén en "Válidas"
3. Si hay errores, corrígelos

## Problemas Comunes y Soluciones

### ❌ "No se encontraron páginas indexadas"

**Solución**: Espera 48-72 horas después de enviar el sitemap

### ❌ "Sitemap no se puede leer"

**Solución**: Verifica que https://neurai.dev/sitemap.xml funcione correctamente

### ❌ "Páginas excluidas por robots.txt"

**Solución**: Verifica que tu `robots.txt` permita el acceso a Google

### ❌ "Error 404 en páginas"

**Solución**: Verifica que las URLs del sitemap existan y funcionen

## Monitoreo Continuo

### Semanalmente

1. Revisa el número de páginas indexadas en Search Console
2. Verifica el rendimiento de búsqueda
3. Revisa errores de rastreo

### Mensualmente

1. Actualiza contenido de productos
2. Agrega nuevos artículos de blog
3. Verifica que los productos nuevos estén en el sitemap

## Recursos Adicionales

- [Google Search Console](https://search.google.com/search-console)
- [Guía oficial de Google](https://developers.google.com/search/docs)
- [Verificación de sitemap](https://neurai.dev/sitemap.xml)
- [Verificación de robots.txt](https://neurai.dev/robots.txt)

## Estado Actual del Sitio

✅ Sitemap dinámico funcionando correctamente
✅ robots.txt configurado correctamente
✅ Schema.org implementado
✅ Meta tags en todas las páginas
⏳ Pendiente: Verificación en Google Search Console
⏳ Pendiente: Envío de sitemap a Google
⏳ Pendiente: Indexación completa (esperar 1-2 semanas)

---

## Próximos Pasos INMEDIATOS

1. **HOY**: Verificar propiedad en Google Search Console
2. **HOY**: Enviar sitemap a Google
3. **HOY**: Solicitar indexación de las 5 URLs principales
4. **MAÑANA**: Verificar que Google haya comenzado a rastrear
5. **EN 1 SEMANA**: Verificar cuántas páginas se han indexado
6. **EN 2 SEMANAS**: Evaluar posicionamiento en búsquedas

## Contacto para Soporte

Si necesitas ayuda adicional, consulta:

- Documentación de Vercel sobre SEO
- Foros de Google Search Console
- Stack Overflow (tag: google-search-console)
