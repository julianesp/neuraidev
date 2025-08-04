# 🚀 Backend CRUD con PostgreSQL

## ✅ Implementación Completada

Tu sitio ahora tiene un backend completo con operaciones CRUD usando PostgreSQL.

### 🔧 Cambios Realizados

1. **Migración de MongoDB a PostgreSQL**

   - ❌ Removido: `mongoose`
   - ✅ Agregado: `pg` (PostgreSQL driver)

2. **Nueva Configuración de Base de Datos**

   - `src/lib/db.js` - Conexión y configuración PostgreSQL
   - `.env.local` - Variables de entorno actualizadas

3. **Modelo de Productos Actualizado**

   - `src/models/ProductModel.js` - Métodos para PostgreSQL

4. **API Routes Completas**
   - `src/app/api/productos/route.js` - GET (todos) y POST
   - `src/app/api/productos/[id]/route.js` - GET (uno), PUT, DELETE

### 📊 Esquema de Base de Datos

```sql
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  imagen_principal TEXT,
  imagenes JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🛠 Operaciones CRUD Disponibles

#### 1. **CREATE (Crear Producto)**

```bash
POST /api/productos
Content-Type: application/json

{
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción del producto",
  "precio": 99.99,
  "categoria": "categoria",
  "imagen_principal": "url_imagen",
  "imagenes": [{"url": "imagen1.jpg"}]
}
```

#### 2. **READ (Leer Productos)**

```bash
# Todos los productos
GET /api/productos

# Por categoría
GET /api/productos?categoria=damas

# Producto específico
GET /api/productos/1
```

#### 3. **UPDATE (Actualizar Producto)**

```bash
PUT /api/productos/1
Content-Type: application/json

{
  "nombre": "Producto Actualizado",
  "precio": 149.99
}
```

#### 4. **DELETE (Eliminar Producto)**

```bash
DELETE /api/productos/1
```

### 🚀 Cómo Usar

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Configurar PostgreSQL:**

   - Asegúrate de tener PostgreSQL corriendo
   - Actualiza `.env.local` con tus credenciales

3. **Iniciar el servidor:**

   ```bash
   npm run dev
   ```

4. **Probar el CRUD:**
   ```bash
   node test-crud.js
   ```

### 📋 Variables de Entorno

Actualiza tu `.env.local`:

```env
DATABASE_URL=postgresql://neuraidev:dataNeuraidev_25@localhost:5432/neuraidev_db
```

### 🎯 Próximos Pasos

- El backend está listo para producción
- Puedes crear un panel de administración
- Agregar autenticación si es necesario
- Implementar validaciones adicionales

¡Tu sitio ya tiene un backend completo y funcional! 🎉
