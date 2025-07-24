// Script de prueba para las operaciones CRUD
// Ejecutar con: node test-crud.js

const BASE_URL = 'http://localhost:3000/api/productos';

async function testCRUD() {
  console.log('🧪 Iniciando pruebas CRUD...\n');

  try {
    // 1. Probar GET todos los productos
    console.log('1️⃣ Probando GET /api/productos');
    let response = await fetch(BASE_URL);
    let productos = await response.json();
    console.log('✅ GET productos:', productos.length > 0 ? `${productos.length} productos encontrados` : 'Sin productos');

    // 2. Probar CREATE (POST)
    console.log('\n2️⃣ Probando POST /api/productos');
    const nuevoProducto = {
      nombre: 'Producto de Prueba',
      descripcion: 'Este es un producto de prueba para validar el CRUD',
      precio: 99.99,
      categoria: 'test',
      imagen_principal: 'https://example.com/imagen.jpg',
      imagenes: [
        { url: 'https://example.com/imagen1.jpg' },
        { url: 'https://example.com/imagen2.jpg' }
      ]
    };

    response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevoProducto)
    });

    if (response.ok) {
      const productoCreado = await response.json();
      console.log('✅ POST producto creado:', productoCreado.id);
      
      const productoId = productoCreado.id;

      // 3. Probar GET por ID
      console.log('\n3️⃣ Probando GET /api/productos/[id]');
      response = await fetch(`${BASE_URL}/${productoId}`);
      const producto = await response.json();
      console.log('✅ GET producto por ID:', producto.nombre);

      // 4. Probar UPDATE (PUT)
      console.log('\n4️⃣ Probando PUT /api/productos/[id]');
      const datosActualizados = {
        ...nuevoProducto,
        nombre: 'Producto Actualizado',
        precio: 149.99
      };

      response = await fetch(`${BASE_URL}/${productoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizados)
      });

      if (response.ok) {
        const productoActualizado = await response.json();
        console.log('✅ PUT producto actualizado:', productoActualizado.nombre);
      } else {
        console.log('❌ PUT falló:', await response.text());
      }

      // 5. Probar DELETE
      console.log('\n5️⃣ Probando DELETE /api/productos/[id]');
      response = await fetch(`${BASE_URL}/${productoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const resultado = await response.json();
        console.log('✅ DELETE producto eliminado:', resultado.message);
      } else {
        console.log('❌ DELETE falló:', await response.text());
      }

    } else {
      console.log('❌ POST falló:', await response.text());
    }

    console.log('\n🎉 Pruebas CRUD completadas!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testCRUD();