# 🛠️ Guía de Instalación Detallada - Sistema de Administración

## 📍 **Ubicación Actual**

Antes de empezar, asegúrate de estar en la carpeta correcta de tu proyecto:

```bash
cd /home/neuraidev/Documentos/sites/neuraidev
```

---

## 🔧 **Paso 1: Configurar Base de Datos PostgreSQL**

### **1.1 Abrir Terminal**

- Presiona `Ctrl + Alt + T` para abrir una nueva terminal
- O usa la terminal integrada de VS Code: `Ctrl + Shift + ` (backtick)

### **1.2 Navegar a tu Proyecto**

```bash
cd /home/neuraidev/Documentos/sites/neuraidev
```

### **1.3 Verificar que el Archivo SQL Existe**

```bash
ls -la scripts/create-admin-table.sql
```

**Deberías ver:** `-rw-rw-r-- 1 neuraidev neuraidev [tamaño] [fecha] scripts/create-admin-table.sql`

### **1.4 Ejecutar el Script de Base de Datos**

**Opción A: Comando Completo (Recomendado)**

```bash
PGPASSWORD='dataNeuraidev_25@' psql -h localhost -U neuraidev -d anuncios_db -f scripts/create-admin-table.sql
```

**Opción B: Si la Opción A no funciona, por pasos:**

```bash
# Primero, exportar la contraseña
export PGPASSWORD='dataNeuraidev_25@'

# Luego ejecutar psql
psql -h localhost -U neuraidev -d anuncios_db -f scripts/create-admin-table.sql
```

### **1.5 Qué Esperar**

Si todo sale bien, deberías ver algo como:

```
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
DO
```

### **1.6 Si hay Errores**

**Error: "psql: command not found"**

```bash
# Instalar PostgreSQL client
sudo apt update
sudo apt install postgresql-client
```

**Error: "connection refused"**

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql
# Si no está corriendo:
sudo systemctl start postgresql
```

**Error: "database does not exist"**

```bash
# Crear la base de datos
PGPASSWORD='dataNeuraidev_25@' createdb -h localhost -U neuraidev anuncios_db
```

**Error: "role does not exist"**

```bash
# Conectar como postgres y crear usuario
sudo -u postgres psql
CREATE USER neuraidev WITH PASSWORD 'dataNeuraidev_25@';
CREATE DATABASE anuncios_db OWNER neuraidev;
GRANT ALL PRIVILEGES ON DATABASE anuncios_db TO neuraidev;
\q
```

---

## 👤 **Paso 2: Crear tu Usuario Administrador**

### **2.1 Verificar que Node.js Funciona**

```bash
node --version
```

**Deberías ver:** `v18.x.x` o similar

### **2.2 Verificar que el Script Existe**

```bash
ls -la scripts/create-admin-user.js
```

### **2.3 Ejecutar el Script de Creación de Usuario**

```bash
node scripts/create-admin-user.js
```

### **2.4 Completar la Información Solicitada**

El script te preguntará:

**👤 Nombre completo:**

- Ejemplo: `Juan Pérez` o tu nombre real

**🔑 Usuario (username):**

- Ejemplo: `admin` o `neuraidev`
- Solo letras, números y guiones bajos
- Será tu usuario para el login

**📧 Email:**

- Ejemplo: `tu-email@gmail.com`
- Debe ser un email válido

**🔒 Contraseña:**

- **IMPORTANTE:** No verás lo que escribes (es normal por seguridad)
- Mínimo 6 caracteres
- Usa una contraseña segura

**🔒 Confirmar contraseña:**

- Escribe exactamente la misma contraseña

### **2.5 Qué Esperar**

Si todo sale bien, verás:

```
🔐 Creación de Usuario Administrador - NeuraIdev

📡 Verificando conexión a la base de datos...
✅ Conexión exitosa

👤 Nombre completo: [tu entrada]
🔑 Usuario (username): [tu entrada]
📧 Email: [tu entrada]
🔒 Contraseña: ******
🔒 Confirmar contraseña: ******

🔍 Verificando si el usuario ya existe...
⏳ Creando usuario administrador...

🎉 ¡Usuario administrador creado exitosamente!
📋 Detalles:
   ID: 1
   Nombre: [tu nombre]
   Usuario: [tu usuario]
   Email: [tu email]
   Super Admin: Sí
   Creado: [fecha actual]

🚀 Puedes acceder al panel de administración en:
   URL: http://localhost:3000/admin/login
   Usuario: [tu usuario]
   Contraseña: La que acabas de configurar
```

### **2.6 Si hay Errores**

**Error: "Cannot find module"**

```bash
# Instalar dependencias
npm install
```

**Error: "Database connection failed"**

```bash
# Verificar variables de entorno
cat .env.local | grep DATABASE_URL
# Debe mostrar: DATABASE_URL=postgresql://neuraidev:dataNeuraidev_25@localhost:5432/anuncios_db
```

**Error: "Ya existe un usuario"**

- Significa que ya creaste un usuario antes
- Puedes continuar al siguiente paso

---

## 🌐 **Paso 3: Acceder al Panel de Administración**

### **3.1 Iniciar el Servidor de Desarrollo**

**En la misma terminal:**

```bash
npm run dev
```

**Qué esperar:**

```
> neuraidev@0.1.0 dev
> next dev --turbopack

   ▲ Next.js 15.4.3
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in 2.1s
```

### **3.2 Abrir el Panel en el Navegador**

**Opción A: Click directo**

- Haz `Ctrl + Click` en `http://localhost:3000` en la terminal

**Opción B: Manual**

1. Abre tu navegador (Chrome, Firefox, etc.)
2. Ve a: `http://localhost:3000/admin/login`

### **3.3 Iniciar Sesión**

En la página de login:

1. **Usuario:** El username que creaste en el Paso 2
2. **Contraseña:** La contraseña que configuraste
3. Click en **"Iniciar Sesión"**

### **3.4 ¡Listo! Ya estás en el Dashboard**

Deberías ver:

- 📊 Estadísticas de productos
- 📋 Lista de productos (puede estar vacía al principio)
- 🔍 Búsqueda y filtros
- ➕ Botón "Nuevo Producto"

---

## 🆘 **Solución de Problemas Comunes**

### **Problema: "Cannot connect to database"**

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Si no está corriendo
sudo systemctl start postgresql

# Probar conexión manual
PGPASSWORD='dataNeuraidev_25@' psql -h localhost -U neuraidev -d anuncios_db -c "SELECT version();"
```

### **Problema: "Port 3000 already in use"**

```bash
# Matar proceso en puerto 3000
sudo lsof -ti:3000 | xargs kill -9

# O usar otro puerto
npm run dev -- -p 3001
# Luego ve a: http://localhost:3001/admin/login
```

### **Problema: "404 Not Found" en /admin/login**

```bash
# Verificar que los archivos existan
ls -la src/app/admin/login/page.jsx
ls -la src/app/api/admin/auth/login/route.js

# Reiniciar el servidor
# Presiona Ctrl+C en la terminal donde corre npm run dev
# Luego ejecuta de nuevo:
npm run dev
```

### **Problema: "Invalid credentials" en login**

```bash
# Verificar usuario en base de datos
PGPASSWORD='dataNeuraidev_25@' psql -h localhost -U neuraidev -d anuncios_db -c "SELECT username, email, is_active FROM admin_users;"

# Si no hay usuarios, ejecutar de nuevo:
node scripts/create-admin-user.js
```

### **Problema: Variables de entorno**

```bash
# Verificar que existe .env.local
ls -la .env.local

# Ver contenido (sin mostrar contraseñas completas)
grep DATABASE_URL .env.local

# Debe mostrar algo como:
# DATABASE_URL=postgresql://neuraidev:dataNeuraidev_25@localhost:5432/anuncios_db
```

---

## ✅ **Checklist de Verificación**

Antes de continuar, verifica que:

- [ ] **PostgreSQL está corriendo:** `sudo systemctl status postgresql`
- [ ] **Base de datos existe:** Comando PGPASSWORD funciona
- [ ] **Tablas creadas:** No hay errores en Paso 1
- [ ] **Usuario admin creado:** Paso 2 completado exitosamente
- [ ] **Servidor corriendo:** `npm run dev` sin errores
- [ ] **Página carga:** `http://localhost:3000/admin/login` abre
- [ ] **Login funciona:** Credenciales del Paso 2 funcionan

---

## 🎯 **Rutas Importantes**

Una vez que funcione todo:

- **Login:** `http://localhost:3000/admin/login`
- **Dashboard:** `http://localhost:3000/admin/dashboard`
- **Sitio principal:** `http://localhost:3000/`

---

## 📱 **Contacto para Ayuda**

Si sigues teniendo problemas:

1. **Copia exactamente** el mensaje de error
2. **Indica en qué paso** te quedaste
3. **Comparte** el resultado de estos comandos:
   ```bash
   node --version
   npm --version
   sudo systemctl status postgresql
   ls -la scripts/
   ```

¡Estoy aquí para ayudarte a que funcione perfecto! 💪
