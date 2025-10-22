# Eliminar Variables de Neon de Vercel

Este documento contiene las instrucciones para eliminar todas las variables de entorno relacionadas con Neon de tu proyecto en Vercel.

## Variables a Eliminar

Ve a tu proyecto en Vercel Dashboard (https://vercel.com/julianesps-projects/neuraidev/settings/environment-variables) y elimina las siguientes variables de entorno:

### Variables de Neon a Eliminar:

1. `DATABASE_URL` (de producción)
2. `POSTGRES_PASSWORD` (de todos los entornos)
3. `POSTGRES_DATABASE` (de todos los entornos)
4. `PGPASSWORD` (de todos los entornos)
5. `PGDATABASE` (de todos los entornos)
6. `PGHOST_UNPOOLED` (de todos los entornos)
7. `PGUSER` (de todos los entornos)
8. `POSTGRES_URL_NO_SSL` (de todos los entornos)
9. `POSTGRES_HOST` (de todos los entornos)
10. `NEON_PROJECT_ID` (de todos los entornos)
11. `POSTGRES_URL` (de todos los entornos)
12. `POSTGRES_PRISMA_URL` (de todos los entornos)
13. `DATABASE_URL_UNPOOLED` (de todos los entornos)
14. `POSTGRES_URL_NON_POOLING` (de todos los entornos)
15. `PGHOST` (de todos los entornos)
16. `POSTGRES_USER` (de todos los entornos)

## Variables de Supabase (MANTENER - No eliminar)

Asegúrate de que estas variables de Supabase estén configuradas correctamente:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

## Después de Eliminar

Una vez eliminadas todas las variables de Neon, realiza un nuevo deploy con:

```bash
vercel --prod
```

Esto asegurará que tu aplicación solo use Supabase.

## Verificar que Todo Funcione

Después del deploy, verifica que:

1. Los productos se carguen correctamente desde Supabase
2. El CRUD de productos funcione
3. No haya errores de conexión a base de datos en los logs
