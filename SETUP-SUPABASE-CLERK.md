# 🚀 Guía de Configuración: Supabase + Clerk en Neurai.dev

Esta guía te ayudará a configurar el sistema multi-tenant de tiendas online usando Supabase y Clerk.

## ✅ Paso 1: Configuración completada

Ya se han instalado y configurado:

- ✅ @supabase/supabase-js
- ✅ @supabase/ssr
- ✅ @clerk/nextjs
- ✅ Clientes de Supabase (browser, server, middleware)
- ✅ ClerkProvider en el layout raíz
- ✅ Middleware de protección de rutas
- ✅ Variables de entorno preparadas en `.env.local`
- ✅ Schema SQL de base de datos

## 📋 Paso 2: Obtener credenciales de Supabase

### 2.1 Crear proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Inicia sesión o crea una cuenta
3. Click en **"New Project"**
4. Completa:
   - **Name**: neuraidev (o el nombre que prefieras)
   - **Database Password**: Guarda esta contraseña en un lugar seguro
   - **Region**: Elige el más cercano a Colombia (us-east-1)
5. Click en **"Create new project"** (toma 1-2 minutos)

### 2.2 Obtener las credenciales

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) > **API**
2. Copia estas credenciales:
   - **URL**: Algo como `https://xxxxx.supabase.co`
   - **anon/public key**: Una clave larga que empieza con `eyJ...`
   - **service_role key**: ⚠️ Nunca expongas esta clave en el frontend

### 2.3 Actualizar variables de entorno

Abre `.env.local` y reemplaza:

\`\`\`bash
# ============================================
# SUPABASE CONFIGURATION
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyy
\`\`\`

### 2.4 Crear las tablas en Supabase

1. En Supabase, ve a **SQL Editor** (icono `</>`)
2. Click en **"New query"**
3. Abre el archivo `supabase-schema.sql` de este proyecto
4. Copia TODO el contenido y pégalo en el editor SQL
5. Click en **"Run"** (▶️)
6. Verifica que se crearon las tablas:
   - `profiles`
   - `stores`
   - `products`
   - `orders`

## 📋 Paso 3: Obtener credenciales de Clerk

### 3.1 Crear proyecto en Clerk

1. Ve a [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Inicia sesión o crea una cuenta
3. Click en **"Add application"**
4. Completa:
   - **Application name**: Neurai.dev
   - **Sign-in options**: Marca **Email** y **Google** (opcional)
5. Click en **"Create application"**

### 3.2 Obtener las credenciales

1. En el dashboard de Clerk, ve a **API Keys** (en el menú lateral)
2. Copia estas credenciales:
   - **Publishable key**: Algo como `pk_test_xxx...`
   - **Secret key**: Algo como `sk_test_xxx...`

### 3.3 Actualizar variables de entorno

En `.env.local`, reemplaza:

\`\`\`bash
# ============================================
# CLERK AUTHENTICATION
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx...
CLERK_SECRET_KEY=sk_test_xxx...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
\`\`\`

### 3.4 Configurar URLs en Clerk

1. En Clerk dashboard, ve a **Paths** (en el menú lateral)
2. Configura las rutas:
   - **Sign-in page**: `/sign-in`
   - **Sign-up page**: `/sign-up`
   - **After sign-in URL**: `/dashboard`
   - **After sign-up URL**: `/dashboard`

## 📋 Paso 4: Conectar Clerk con Supabase

### 4.1 Configurar webhook en Clerk (IMPORTANTE)

Necesitas crear un perfil en Supabase cada vez que un usuario se registre en Clerk.

1. En Clerk dashboard, ve a **Webhooks**
2. Click en **"Add Endpoint"**
3. Completa:
   - **Endpoint URL**: `https://tu-sitio.vercel.app/api/webhooks/clerk`
   - **Subscribe to events**: Marca `user.created`
4. Guarda el **Signing Secret** (lo usaremos después)

## 📋 Paso 5: Probar el sistema

### 5.1 Reiniciar el servidor de desarrollo

\`\`\`bash
npm run dev
\`\`\`

### 5.2 Verificar que funciona

1. Ve a `http://localhost:3000`
2. Verifica que el sitio carga sin errores
3. Las rutas públicas deben funcionar normalmente
4. `/dashboard` debe redirigirte a `/sign-in` (porque requiere autenticación)

## 🎯 Próximos pasos

Una vez configurado Supabase y Clerk, podemos continuar con:

1. ✅ Crear páginas de Sign In y Sign Up con Clerk
2. ✅ Crear el Dashboard para gestionar tiendas
3. ✅ Crear APIs para CRUD de tiendas con Supabase
4. ✅ Crear APIs para CRUD de productos con Supabase
5. ✅ Crear páginas públicas de tiendas
6. ✅ Integrar con sistema de pagos existente (ePayco)

## 🆘 Solución de problemas

### Error: "Invalid Supabase URL"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` en `.env.local` sea correcto
- Asegúrate de reiniciar el servidor después de cambiar `.env.local`

### Error: "Clerk is not configured"
- Verifica las claves de Clerk en `.env.local`
- Asegúrate de que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` tenga el prefijo correcto (`pk_test_` o `pk_live_`)

### Las rutas protegidas no funcionan
- Verifica que `middleware.js` esté en la raíz del proyecto
- Revisa que las rutas públicas estén correctamente listadas en `isPublicRoute`

### Errores de RLS en Supabase
- Ve a **SQL Editor** en Supabase
- Ejecuta: `SELECT * FROM profiles;`
- Si da error de permisos, verifica que las políticas RLS se hayan creado correctamente

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Clerk](https://clerk.com/docs)
- [Supabase + Clerk Integration](https://clerk.com/docs/integrations/databases/supabase)
- [Next.js 15 con Clerk](https://clerk.com/docs/quickstarts/nextjs)

---

**¿Listo para continuar?** Una vez que hayas completado los pasos 2 y 3 (obtener credenciales), avísame y continuaremos con la implementación del dashboard y las funcionalidades de tiendas.
