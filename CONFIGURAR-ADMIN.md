# 🔐 Configurar Administrador del Dashboard

## Paso 1: Obtener tu Email de Clerk

1. Ve a http://localhost:3000/sign-in o http://localhost:3000/sign-up
2. Inicia sesión o crea tu cuenta
3. Anota el **email** con el que te registraste

## Paso 2: Agregar tu Email como Administrador

Abre el archivo: `src/lib/auth/roles.js`

Busca esta línea:

```javascript
export const ADMIN_EMAILS = [
  'tu-email@ejemplo.com', // Reemplaza con tu email de Clerk
  'admin@neurai.dev',
  'contacto@neurai.dev'
];
```

Reemplaza `'tu-email@ejemplo.com'` con tu email real. Por ejemplo:

```javascript
export const ADMIN_EMAILS = [
  'jorge@gmail.com', // TU EMAIL AQUÍ
  'admin@neurai.dev',
  'contacto@neurai.dev'
];
```

## Paso 3: Guardar y Probar

1. Guarda el archivo
2. Ve a http://localhost:3000/dashboard
3. Deberías poder acceder ahora

## 🎯 ¿Cómo Funciona?

### Para Administradores (TÚ):
- ✅ Acceso completo al dashboard
- ✅ Crear, editar y eliminar productos
- ✅ Ver estadísticas
- ✅ Gestionar todo el catálogo

### Para Usuarios Normales:
- ❌ NO pueden acceder al dashboard
- ✅ Pueden ver la tienda
- ✅ Pueden navegar productos
- ✅ Pueden ver información

## 🔒 Seguridad

El sistema verifica:
1. **Email del usuario** - Debe estar en la lista de ADMIN_EMAILS
2. **Autenticación de Clerk** - Debe estar autenticado
3. **Protección de rutas** - Middleware protege todas las rutas /dashboard/*

## 📝 Agregar Más Administradores

Solo agrega más emails a la lista:

```javascript
export const ADMIN_EMAILS = [
  'admin1@ejemplo.com',
  'admin2@ejemplo.com',
  'admin3@ejemplo.com',
];
```

## 🎨 Método Alternativo: Usar Metadata de Clerk

En lugar de emails, puedes usar metadata en Clerk Dashboard:

1. Ve a: https://dashboard.clerk.com/
2. Selecciona tu aplicación
3. Ve a "Users"
4. Selecciona tu usuario
5. En "Public metadata", agrega:
   ```json
   {
     "role": "admin"
   }
   ```

Esto también te dará acceso al dashboard (el código ya lo soporta).

## ⚡ Enlaces Útiles

- **Iniciar Sesión**: http://localhost:3000/sign-in
- **Registrarse**: http://localhost:3000/sign-up
- **Dashboard**: http://localhost:3000/dashboard
- **Productos**: http://localhost:3000/dashboard/productos
- **Clerk Dashboard**: https://dashboard.clerk.com/

## 🐛 Solución de Problemas

### No puedo acceder al dashboard
1. Verifica que tu email esté en ADMIN_EMAILS
2. Cierra sesión y vuelve a iniciar
3. Verifica la consola del navegador para errores

### Me redirige a la página principal
- Tu usuario no está marcado como admin
- Revisa el archivo `src/lib/auth/roles.js`
- Asegúrate de haber guardado los cambios

### No veo el botón de iniciar sesión
- Los botones aparecen en el navbar después de navegar
- También puedes ir directamente a `/sign-in`

## 🎉 ¡Listo!

Una vez configurado, tendrás acceso completo al dashboard para gestionar tu tienda desde:

**http://localhost:3000/dashboard**
