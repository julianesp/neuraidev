# 🔧 Configuración Manual de Usuario PostgreSQL

## Pasos a Seguir

### 1. Conectarse como usuario postgres
Ejecuta este comando en tu terminal:
```bash
sudo -u postgres psql
```

### 2. Dentro de PostgreSQL, ejecutar estos comandos:

```sql
-- Crear usuario neuraidev (si no existe)
CREATE USER neuraidev WITH PASSWORD 'dataNeuraidev_25@';

-- Dar permisos de crear bases de datos
ALTER USER neuraidev CREATEDB;

-- Dar todos los permisos sobre la base de datos anuncios_db
GRANT ALL PRIVILEGES ON DATABASE anuncios_db TO neuraidev;

-- Conectarse a la base de datos anuncios_db
\c anuncios_db;

-- Dar permisos sobre el schema public
GRANT ALL PRIVILEGES ON SCHEMA public TO neuraidev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neuraidev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neuraidev;

-- Permisos para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO neuraidev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO neuraidev;

-- Verificar que el usuario fue creado
\du neuraidev

-- Salir
\q
```

### 3. Probar la conexión
Después de ejecutar los comandos anteriores, prueba:
```bash
node test-db-connection.js
```

## 📋 Comandos Copia-Pega

**Paso 1:**
```bash
sudo -u postgres psql
```

**Paso 2 (dentro de psql):**
```sql
CREATE USER neuraidev WITH PASSWORD 'dataNeuraidev_25@';
ALTER USER neuraidev CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE anuncios_db TO neuraidev;
\c anuncios_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO neuraidev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neuraidev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neuraidev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO neuraidev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO neuraidev;
\q
```

**Paso 3:**
```bash
node test-db-connection.js
```

¡Ejecuta estos comandos y me avisas cómo va! 🚀