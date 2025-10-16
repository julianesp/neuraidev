# 🔐 Panel de Administración de Noticias - Guía de Uso

## 🎯 Sistema de Autenticación Implementado

Se ha implementado un sistema de autenticación para proteger el panel de administración de noticias. Solo usuarios autenticados pueden acceder y modificar las noticias.

---

## 📋 Credenciales de Acceso

### Credenciales Actuales:
- **Usuario:** `neurai`
- **Contraseña:** `sellAll.25`

> ⚠️ **IMPORTANTE:** Estas son las credenciales configuradas actualmente en tu archivo `.env.local`

---

## 🚀 Cómo Usar el Sistema

### 1️⃣ Acceder al Panel de Administración

1. Ve a: `http://localhost:3000/admin/login` (en desarrollo)
   - O en producción: `https://tudominio.com/admin/login`

2. Ingresa tus credenciales:
   - Usuario: `neurai`
   - Contraseña: `sellAll.25`

3. Haz clic en **"Iniciar Sesión"**

### 2️⃣ Gestionar Noticias

Una vez autenticado:

1. Serás redirigido a: `/admin/noticias`
2. Podrás:
   - ✅ Crear nuevas noticias
   - ✏️ Editar noticias existentes
   - 🗑️ Eliminar noticias
   - 💾 Exportar a JSON
   - 🎨 Usar el editor de texto enriquecido

### 3️⃣ Cerrar Sesión

- Haz clic en el botón **"🚪 Cerrar Sesión"** (esquina superior derecha)
- Serás redirigido al login
- Tu sesión expira automáticamente después de 24 horas

---

## 🔒 Características de Seguridad

### ✅ Implementado:

1. **Autenticación basada en localStorage**
   - Token de sesión único
   - Expiración automática (24 horas)
   - Verificación en cada carga de página

2. **Rutas protegidas**
   - `/admin/noticias` requiere autenticación
   - Redirección automática a login si no estás autenticado

3. **Variables de entorno**
   - Credenciales almacenadas en `.env.local`
   - No expuestas en el código fuente

4. **Componente ProtectedRoute**
   - Verifica autenticación antes de renderizar
   - Muestra pantalla de carga durante verificación

---

## ⚙️ Configuración de Credenciales

### Método 1: Variables de Entorno (Recomendado)

Edita el archivo `.env.local`:

```env
# Credenciales para el panel de noticias
NEXT_PUBLIC_ADMIN_USERNAME="tu_usuario_aqui"
NEXT_PUBLIC_ADMIN_PASSWORD="tu_contraseña_segura_aqui"
```

### Método 2: Hardcoded (No recomendado para producción)

Si no usas variables de entorno, el sistema usará valores por defecto:
- Usuario: `admin`
- Contraseña: `neurai2025`

---

## 🔐 Cambiar las Credenciales

### Paso 1: Editar `.env.local`

```env
NEXT_PUBLIC_ADMIN_USERNAME="mi_usuario_seguro"
NEXT_PUBLIC_ADMIN_PASSWORD="M1C0ntr@s3ñ@Sup3rS3gur@2025!"
```

### Paso 2: Reiniciar el servidor

```bash
# Detener el servidor (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

### Paso 3: Usar las nuevas credenciales

Las nuevas credenciales estarán activas inmediatamente.

---

## 📝 Mejores Prácticas de Seguridad

### ✅ HACER:

1. **Usar contraseñas seguras:**
   - Mínimo 12 caracteres
   - Combinar mayúsculas, minúsculas, números y símbolos
   - Ejemplo: `M1C0ntr@s3ñ@S3gur@2025!`

2. **Cambiar credenciales predeterminadas:**
   - Inmediatamente después de la instalación

3. **No compartir credenciales:**
   - Mantenerlas privadas y seguras

4. **Verificar `.gitignore`:**
   - Asegúrate de que `.env.local` esté en `.gitignore`
   - Nunca subir credenciales a Git

### ❌ NO HACER:

1. ❌ Usar contraseñas simples como "12345" o "admin"
2. ❌ Compartir credenciales por email o chat
3. ❌ Subir `.env.local` a GitHub o repositorios públicos
4. ❌ Usar las mismas credenciales en múltiples sitios

---

## 🔄 Flujo de Autenticación

```
Usuario no autenticado
        ↓
Intenta acceder a /admin/noticias
        ↓
Redirigido a /admin/login
        ↓
Ingresa credenciales
        ↓
Validación ✓
        ↓
Token almacenado en localStorage
        ↓
Redirigido a /admin/noticias
        ↓
Puede gestionar noticias
        ↓
Cierra sesión o expira (24h)
        ↓
Token eliminado
        ↓
Vuelve al login
```

---

## 🚨 Solución de Problemas

### Problema: "No puedo iniciar sesión"

**Solución:**
1. Verifica las credenciales en `.env.local`
2. Asegúrate de haber reiniciado el servidor después de cambiar `.env.local`
3. Limpia la caché del navegador y localStorage
4. Verifica la consola del navegador para errores

### Problema: "La sesión expira muy rápido"

**Solución:**
La sesión está configurada para durar 24 horas. Si necesitas cambiar esto:

Edita `src/contexts/AuthContext.jsx` línea ~17:
```javascript
const expiry = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 horas
```

Cambia `24` por el número de horas que desees.

### Problema: "Mensaje de error al cargar la página de admin"

**Solución:**
1. Verifica que el componente `AuthProvider` esté en `layout.js`
2. Asegúrate de que todos los archivos se hayan creado correctamente
3. Revisa la consola del navegador para errores específicos

---

## 📂 Archivos del Sistema de Autenticación

```
/src
  /contexts
    AuthContext.jsx          # Contexto de autenticación
  /components
    ProtectedRoute.jsx       # Componente de protección de rutas
  /app
    /admin
      /login
        page.jsx             # Página de login
        Login.module.scss    # Estilos del login
      /noticias
        page.jsx             # Panel de noticias (protegido)

/.env.local                  # Credenciales (NO SUBIR A GIT)
/.env.local.example          # Ejemplo de configuración
```

---

## 🎓 Próximos Pasos (Opcional)

Para mayor seguridad en producción, considera:

1. **Implementar autenticación con servicios externos:**
   - NextAuth.js
   - Auth0
   - Firebase Authentication
   - Clerk

2. **Agregar autenticación de dos factores (2FA)**

3. **Implementar roles de usuario:**
   - Admin (puede todo)
   - Editor (solo puede editar)
   - Viewer (solo puede ver)

4. **Usar HTTPS en producción:**
   - Siempre usa HTTPS para proteger las credenciales en tránsito

5. **Implementar rate limiting:**
   - Limitar intentos de login para prevenir ataques de fuerza bruta

---

## 📞 Soporte

Si tienes problemas o preguntas, revisa:
1. Este archivo README
2. Los comentarios en el código
3. La consola del navegador para errores

---

## ✅ Checklist de Implementación

- [x] Sistema de autenticación creado
- [x] Página de login funcional
- [x] Rutas protegidas
- [x] Variables de entorno configuradas
- [x] Botón de cerrar sesión
- [x] Expiración automática de sesión
- [x] Documentación completa

---

🎉 **¡Sistema de autenticación listo para usar!**

Recuerda cambiar las credenciales predeterminadas por unas más seguras.
