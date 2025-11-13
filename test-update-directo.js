/**
 * Test directo de UPDATE a Supabase
 * Para verificar si el problema son los permisos RLS
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testUpdate() {
  console.log('\n🧪 TEST DE ACTUALIZACIÓN DIRECTA A SUPABASE\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 1. Obtener el primer producto con stock 0
    console.log('1️⃣  Buscando un producto con stock = 0...');
    const { data: productos, error: errorBuscar } = await supabase
      .from('products')
      .select('*')
      .eq('stock', 0)
      .limit(1);

    if (errorBuscar) {
      console.error('❌ Error buscando productos:', errorBuscar);
      return;
    }

    if (!productos || productos.length === 0) {
      console.log('⚠️  No hay productos con stock = 0');
      console.log('   Buscando cualquier producto...');

      const { data: todosProductos, error: errorTodos } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (errorTodos || !todosProductos || todosProductos.length === 0) {
        console.error('❌ No se encontraron productos');
        return;
      }

      productos[0] = todosProductos[0];
    }

    const producto = productos[0];
    console.log(`\n✅ Producto encontrado:`);
    console.log(`   ID: ${producto.id}`);
    console.log(`   Nombre: ${producto.nombre}`);
    console.log(`   Stock ACTUAL: ${producto.stock}`);

    // 2. Intentar actualizar el stock
    const nuevoStock = (producto.stock || 0) + 10;
    console.log(`\n2️⃣  Intentando actualizar stock a ${nuevoStock}...`);

    const { data: resultado, error: errorUpdate } = await supabase
      .from('products')
      .update({ stock: nuevoStock })
      .eq('id', producto.id)
      .select();

    if (errorUpdate) {
      console.error('\n❌ ERROR AL ACTUALIZAR:');
      console.error('   Código:', errorUpdate.code);
      console.error('   Mensaje:', errorUpdate.message);
      console.error('   Detalles:', errorUpdate.details);
      console.error('   Hint:', errorUpdate.hint);

      if (errorUpdate.code === '42501') {
        console.error('\n⚠️  PROBLEMA DE PERMISOS (RLS)');
        console.error('   La política de seguridad de Supabase no permite UPDATE.');
        console.error('\n📝 SOLUCIÓN:');
        console.error('   1. Ve a Supabase Dashboard');
        console.error('   2. Authentication > Policies');
        console.error('   3. Tabla "products"');
        console.error('   4. Agrega política para permitir UPDATE');
      }

      return;
    }

    if (!resultado || resultado.length === 0) {
      console.error('\n❌ UPDATE no afectó ninguna fila');
      console.error('   Esto puede significar:');
      console.error('   - El ID no existe (poco probable)');
      console.error('   - RLS bloqueó el UPDATE sin error explícito');
      return;
    }

    console.log('\n✅ ¡UPDATE EXITOSO!');
    console.log(`   Stock ANTES: ${producto.stock}`);
    console.log(`   Stock DESPUÉS: ${resultado[0].stock}`);
    console.log('\n🎉 La actualización funciona correctamente en Supabase!');
    console.log('   El problema debe ser en el código del dashboard.\n');

  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message);
    console.error(error);
  }
}

testUpdate().catch(console.error);
