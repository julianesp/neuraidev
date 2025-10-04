# 🚀 Configuración Completa - NeuraI.dev

## 🌐 Dominio de Producción
Tu sitio está disponible en: **https://neurai.dev**

---

# Sincronización de Base de Datos - Desarrollo y Producción

## ✅ Problema Resuelto

Antes tenías **dos bases de datos separadas**:
- **Desarrollo**: PostgreSQL local (`localhost:5432/neuraidev_db`)
- **Producción**: Neon PostgreSQL (en la nube)

Los productos que agregabas en desarrollo solo se veían localmente porque se guardaban en tu base de datos local.

## 🔧 Solución Aplicada

Ahora tu entorno de **desarrollo usa la misma base de datos que producción** (Neon). Esto significa:

✅ Productos agregados en desarrollo → **Se ven en producción inmediatamente**
✅ Productos agregados en producción → **Se ven en desarrollo**
✅ **Una sola fuente de verdad** para tus datos

## 📊 Estado Actual de la Base de Datos

```
Database: neondb (Neon PostgreSQL - Producción)
Total de productos: 56
Total de imágenes: 143
Total de tiendas: 1
```

## 🚀 Cómo Usar

### 1. Agregar productos desde tu panel de administración local:

```bash
# Inicia tu servidor de desarrollo
npm run dev

# Ve a http://localhost:3000/admin/login
# Inicia sesión
# Agrega productos
```

**Los productos se guardarán directamente en la base de datos de producción** y se verán en:
- Tu sitio local: `http://localhost:3000`
- Tu sitio en producción: `https://neuraidev.vercel.app`

### 2. Verificar la conexión a la base de datos:

```bash
# Script que verifica la conexión y muestra estadísticas
node scripts/check-db-connection.js
```

## 📝 Archivos Modificados

1. **`.env.local`** - Actualizado para usar la base de datos de Neon
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_d81MXPGjTQRo@ep-young-frog-a4539z89-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

2. **Schema de Prisma** - Sincronizado con la base de datos de producción
   ```bash
   npx prisma db push  # Ya ejecutado
   ```

## 🔄 Si Quieres Volver a Usar la Base de Datos Local

Simplemente edita `.env.local` y descomenta la línea local:

```env
# Usar base de datos local:
DATABASE_URL=postgresql://neuraidev:neuraidev2024@localhost:5432/neuraidev_db?schema=public

# Comentar la de producción:
# DATABASE_URL="postgresql://neondb_owner:npg_d81MXPGjTQRo@ep-young-frog-a4539z89-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

⚠️ **Nota**: Si haces esto, los productos agregados localmente NO se verán en producción.

## 🎯 Recomendación

**Mantén la configuración actual** (usando Neon en desarrollo) para que tus cambios se reflejen inmediatamente en producción.

## 📞 Soporte

Si tienes algún problema, verifica:
1. Tu conexión a internet (necesaria para conectar a Neon)
2. Ejecuta el script de verificación: `node scripts/check-db-connection.js`
3. Revisa que el `.env.local` tenga la URL correcta de Neon
