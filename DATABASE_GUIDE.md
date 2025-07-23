# 📊 Guía de Base de Datos - NeuraIDev

## 🗄️ Información General

**Base de datos:** `anuncios_db`  
**Sistema:** PostgreSQL 17  
**Usuario:** `neuraidev`  
**Host:** `localhost:5432`  
**Ubicación:** `/var/lib/postgresql/17/main/`

---

## 📋 Tablas Disponibles

### 1. **productos** ✨ (Recién creada)

Tabla principal para gestión de productos del e-commerce.

**Estructura:**

```sql
- id (SERIAL PRIMARY KEY)
- nombre (VARCHAR(255) NOT NULL)
- descripcion (TEXT)
- precio (DECIMAL(10,2) NOT NULL)
- categoria (VARCHAR(100) NOT NULL)
- imagen_principal (TEXT)
- imagenes (JSONB DEFAULT '[]')
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
```

**Índices:**

- `idx_productos_categoria` (categoria)
- `idx_productos_precio` (precio)
- `idx_productos_created_at` (created_at)

### 2. **anuncios**

Gestión de anuncios/publicaciones.

### 3. **categorias**

Categorías para clasificar productos y anuncios.

### 4. **anuncio_stats**

Estadísticas y métricas de anuncios.

### 5. **admin_users**

Usuarios administradores del sistema.

### 6. **anuncio_audit_log**

Log de auditoría para cambios en anuncios.

---

## 🛠️ Operaciones Disponibles con la Tabla Productos

### ✅ Operaciones CRUD Implementadas

El modelo `ProductModel.js` te permite realizar todas las operaciones básicas:

#### **1. Crear Producto**

```javascript
import { ProductModel } from "./src/models/ProductModel.js";

const nuevoProducto = await ProductModel.create({
  nombre: "Laptop Gaming",
  descripcion: "Laptop para gaming de alta gama",
  precio: 1299.99,
  categoria: "tecnologia",
  imagen_principal: "https://ejemplo.com/imagen.jpg",
  imagenes: ["imagen1.jpg", "imagen2.jpg"],
});
```

#### **2. Obtener Todos los Productos**

```javascript
const productos = await ProductModel.findAll();
// Devuelve todos los productos ordenados por fecha de creación
```

#### **3. Buscar Producto por ID**

```javascript
const producto = await ProductModel.findById(1);
// Devuelve el producto con ID específico
```

#### **4. Buscar por Categoría**

```javascript
const productosCategoria = await ProductModel.findByCategory("tecnologia");
// Devuelve todos los productos de una categoría específica
```

#### **5. Actualizar Producto**

```javascript
const productoActualizado = await ProductModel.update(1, {
  nombre: "Laptop Gaming Pro",
  precio: 1399.99,
  descripcion: "Versión mejorada",
});
```

#### **6. Eliminar Producto**

```javascript
const productoEliminado = await ProductModel.delete(1);
// Elimina y devuelve el producto eliminado
```

---

## 🌐 APIs REST Disponibles

### Endpoints para Productos

#### **GET /api/productos**

- **Descripción:** Obtiene todos los productos
- **Respuesta:** Array de productos ordenados por fecha

#### **GET /api/productos/[id]**

- **Descripción:** Obtiene un producto específico por ID
- **Parámetros:** `id` (número)

#### **POST /api/productos**

- **Descripción:** Crea un nuevo producto
- **Body requerido:**

```json
{
  "nombre": "string",
  "descripcion": "string",
  "precio": "number",
  "categoria": "string",
  "imagen_principal": "string",
  "imagenes": ["array de strings"]
}
```

#### **PUT /api/productos/[id]**

- **Descripción:** Actualiza un producto existente
- **Parámetros:** `id` (número)
- **Body:** Campos a actualizar

#### **DELETE /api/productos/[id]**

- **Descripción:** Elimina un producto
- **Parámetros:** `id` (número)

---

## 🔧 Casos de Uso Prácticos

### 1. **E-commerce Completo**

- Catálogo de productos con categorías
- Gestión de inventario
- Sistema de precios
- Galería de imágenes múltiples

### 2. **Dashboard Administrativo**

- CRUD completo de productos
- Filtrado por categorías
- Estadísticas de productos
- Auditoría de cambios

### 3. **API para Aplicaciones Móviles**

- Endpoints RESTful listos
- Respuestas en JSON
- Paginación y filtrado
- Búsqueda optimizada

### 4. **Sistema de Categorización**

- Productos organizados por categorías
- Búsquedas rápidas con índices
- Flexibilidad para nuevas categorías

---

## 📁 Archivos de Configuración

### **Conexión a Base de Datos**

- **Configuración:** `/src/lib/db.js`
- **Variables de entorno:** `/.env.local`
- **Modelo de datos:** `/src/models/ProductModel.js`

### **Scripts SQL**

- **Creación de usuario:** `/create-user.sql`
- **Creación de tabla productos:** `/create-productos-table.sql`
- **Prueba de conexión:** `/test-db-connection.js`

---

## 🚀 Próximos Pasos Sugeridos

### 1. **Ampliar Funcionalidades**

```javascript
// Búsqueda por texto
static async search(searchTerm) {
  const result = await query(
    'SELECT * FROM productos WHERE nombre ILIKE $1 OR descripcion ILIKE $1',
    [`%${searchTerm}%`]
  );
  return result.rows;
}

// Filtro por rango de precios
static async findByPriceRange(minPrice, maxPrice) {
  const result = await query(
    'SELECT * FROM productos WHERE precio BETWEEN $1 AND $2',
    [minPrice, maxPrice]
  );
  return result.rows;
}
```

### 2. **Optimizaciones**

- Implementar paginación
- Añadir validaciones de datos
- Sistema de caché con Redis
- Compresión de imágenes

### 3. **Seguridad**

- Validación de entrada
- Sanitización de datos
- Rate limiting en APIs
- Autenticación para operaciones sensibles

---

## 🧪 Testing

### **Probar Conexión**

```bash
node test-db-connection.js
```

### **Probar CRUD**

```bash
node test-crud.js
```

---

## 📞 Conexión Directa a PostgreSQL

```bash
# Conectar como usuario neuraidev
PGPASSWORD='dataNeuraidev_25@' psql -h localhost -U neuraidev -d anuncios_db

# Comandos útiles dentro de psql:
\dt          # Listar tablas
\d productos # Describir estructura de tabla productos
\l           # Listar todas las bases de datos
\q           # Salir
```

---

**¡Tu base de datos está lista para ser el corazón de tu aplicación e-commerce! 🎉**
