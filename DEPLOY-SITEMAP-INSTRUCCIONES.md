# ✅ Deploy del Sitemap - Instrucciones

## Estado actual

✅ Código pusheado a la rama `main`
✅ Sitemap generado localmente con 84 URLs (33 estáticas + 51 productos)
🚀 Vercel está procesando el deploy automáticamente

## ⏱️ Qué está pasando ahora

Vercel ha detectado el push a `main` y está:

1. **Clonando el repositorio** ⏳
2. **Instalando dependencias** (`npm install`) ⏳
3. **Ejecutando `npm run build`** que incluye:
   - `npm run generate:sitemap` - Genera sitemap.xml desde Supabase
   - `next build` - Construye la aplicación
4. **Desplegando a producción** ⏳

**Tiempo estimado: 2-5 minutos**

## 🔍 Verificar el deploy

### Opción 1: Dashboard de Vercel (Recomendado)

1. Ve a: https://vercel.com/dashboard
2. Busca el proyecto `neuraidev`
3. Verás el deploy en progreso con estado:
   - 🟡 **Building** - Ejecutando build
   - 🟢 **Ready** - Deploy completado
   - 🔴 **Error** - Falló (revisar logs)

### Opción 2: CLI de Vercel (Desde terminal)

```bash
# Ver deploys recientes
vercel ls

# Ver logs del último deploy
vercel logs
```

## ✅ Después del deploy (2-5 minutos)

### 1. Verificar que el sitemap esté disponible

Abrir en el navegador:
```
https://www.neurai.dev/sitemap.xml
https://neurai.dev/sitemap.xml
```

**Deberías ver:**
- XML con el formato correcto
- 84 URLs listadas
- Productos con sus URLs correctas

### 2. Verificar en Google Search Console

1. Ve a: https://search.google.com/search-console
2. Selecciona la propiedad `neurai.dev`
3. Menú lateral → **Sitemaps**
4. **Eliminar** el sitemap anterior (si muestra error 404)
5. **Agregar nuevo sitemap:**
   - URL: `https://www.neurai.dev/sitemap.xml`
   - Clic en **Enviar**

### 3. Esperar validación de Google

Google tardará **unos minutos a unas horas** en:
- Leer el sitemap
- Validar las URLs
- Comenzar a indexar las páginas

**Estado esperado:**
- ✅ **Correcto** - "Sitemap leído correctamente"
- 📊 URLs descubiertas: 84
- 🕒 Última lectura: [Fecha actual]

## 🚨 Troubleshooting

### Si el sitemap aún muestra 404 después del deploy

**Verificar build logs en Vercel:**

1. Dashboard de Vercel → Proyecto → Último deployment
2. Ver tab **"Build Logs"**
3. Buscar:
   ```
   > npm run generate:sitemap
   🚀 Generando sitemap.xml...
   ✅ 51 productos obtenidos desde Supabase
   📄 Total de URLs: 84
   ```

**Si no ves estos logs:**
- Las variables de entorno pueden no estar configuradas en Vercel
- Ver sección "Configurar variables de entorno" abajo

### Si Google aún muestra error

**Opciones:**

1. **Esperar más tiempo** - Google puede tardar hasta 24 horas
2. **Forzar actualización:**
   - En Search Console → Sitemaps
   - Eliminar sitemap
   - Volver a enviar
3. **Verificar con herramienta externa:**
   - https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - Ingresar: `https://www.neurai.dev/sitemap.xml`

## ⚙️ Configurar variables de entorno en Vercel

Si el script no encuentra productos, verifica que estas variables estén en Vercel:

1. Dashboard Vercel → Proyecto → **Settings** → **Environment Variables**
2. Agregar (si no existen):

```
NEXT_PUBLIC_SUPABASE_URL = [URL de tu proyecto Supabase]
SUPABASE_SERVICE_ROLE_KEY = [Service role key de Supabase]
```

3. Hacer **redeploy** después de agregar variables:
   ```bash
   vercel --prod --force
   ```

## 📊 Monitoreo continuo

### Ver estadísticas del sitemap en Search Console

1. Search Console → **Sitemaps**
2. Verás:
   - URLs enviadas: 84
   - URLs indexadas: (aumentará con el tiempo)
   - Errores: 0
   - Advertencias: 0

### Regenerar sitemap cuando agregues productos

```bash
# Regenerar localmente
npm run generate:sitemap

# Commit y push
git add public/sitemap.xml
git commit -m "Update: Sitemap con nuevos productos"
git push origin main
```

Vercel hará el deploy automáticamente.

## 🎯 Resultado esperado

Después de completar estos pasos:

✅ Sitemap accesible en https://www.neurai.dev/sitemap.xml
✅ Google Search Console sin errores
✅ 84 URLs enviadas a Google
✅ Indexación automática de productos comenzará
✅ Mejor posicionamiento en resultados de búsqueda

---

**Última actualización:** 2025-11-04
**Estado del deploy:** En progreso
**Siguiente acción:** Esperar 2-5 minutos y verificar en https://www.neurai.dev/sitemap.xml
