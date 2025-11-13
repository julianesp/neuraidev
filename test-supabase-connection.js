/**
 * Script para probar la conexión a Supabase
 *
 * Uso:
 *   node test-supabase-connection.js
 *
 * Este script verifica:
 * 1. Que las variables de Supabase estén configuradas
 * 2. Que la conexión a Supabase funcione
 * 3. Que la tabla "Producto" exista
 * 4. Cuántos productos hay en la base de datos
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('\n🔍 Iniciando prueba de conexión a Supabase...\n');

  // 1. Verificar que las variables estén configuradas
  console.log('1️⃣  Verificando variables de entorno...');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no está configurada en .env.local');
    console.log('\n📝 Solución:');
    console.log('   Agrega esta línea a tu archivo .env.local:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"\n');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada en .env.local');
    console.log('\n📝 Solución:');
    console.log('   Agrega esta línea a tu archivo .env.local:');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"\n');
    process.exit(1);
  }

  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log('');

  // 2. Crear cliente de Supabase
  console.log('2️⃣  Creando cliente de Supabase...');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  console.log('✅ Cliente de Supabase creado\n');

  // 3. Verificar conexión intentando contar productos
  console.log('3️⃣  Verificando conexión y tabla "Producto"...');

  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ ERROR: La tabla "Producto" no existe en Supabase');
        console.log('\n📝 Solución:');
        console.log('   1. Ve a https://supabase.com/dashboard');
        console.log('   2. Selecciona tu proyecto');
        console.log('   3. Ve a "SQL Editor"');
        console.log('   4. Crea la tabla "Producto" con la estructura correcta\n');
        process.exit(1);
      } else if (error.code === 'PGRST116') {
        console.error('❌ ERROR: No tienes permisos para acceder a la tabla "Producto"');
        console.log('\n📝 Solución:');
        console.log('   1. Ve a Supabase Dashboard > Authentication > Policies');
        console.log('   2. Habilita RLS (Row Level Security)');
        console.log('   3. Agrega políticas para permitir SELECT, INSERT, UPDATE, DELETE\n');
        process.exit(1);
      } else {
        console.error('❌ ERROR al conectar con Supabase:', error.message);
        console.error('Código:', error.code);
        console.error('Detalles:', error.details);
        process.exit(1);
      }
    }

    console.log('✅ Conexión exitosa a Supabase');
    console.log(`📊 Total de productos en la base de datos: ${count}\n`);

    if (count === 0) {
      console.log('⚠️  ADVERTENCIA: No hay productos en la base de datos');
      console.log('   Esto explica por qué no aparecen en el dashboard.\n');
      console.log('📝 Solución:');
      console.log('   - Opción 1: Usa el botón "+ Nuevo Producto" en el dashboard');
      console.log('   - Opción 2: Inserta productos manualmente en Supabase Dashboard\n');
    } else {
      // 4. Obtener estadísticas
      console.log('4️⃣  Obteniendo estadísticas de productos...');

      const { data: productos, error: errorProductos } = await supabase
        .from('products')
        .select('id, nombre, categoria, precio, stock, disponible, destacado');

      if (errorProductos) {
        console.error('❌ Error obteniendo productos:', errorProductos.message);
      } else {
        const disponibles = productos.filter(p => p.disponible).length;
        const destacados = productos.filter(p => p.destacado).length;
        const sinStock = productos.filter(p => p.stock === 0 || p.stock === null).length;

        console.log(`✅ Productos disponibles: ${disponibles}`);
        console.log(`⭐ Productos destacados: ${destacados}`);
        console.log(`📦 Productos sin stock: ${sinStock}\n`);

        // 5. Mostrar algunos productos de ejemplo
        console.log('5️⃣  Primeros 5 productos (ejemplo)...');
        const primeros5 = productos.slice(0, 5);
        console.table(primeros5.map(p => ({
          ID: p.id,
          Nombre: p.nombre,
          Categoría: p.categoria,
          Precio: p.precio,
          Stock: p.stock,
          Disponible: p.disponible ? 'Sí' : 'No'
        })));
      }
    }

    console.log('\n✅ ¡CONEXIÓN EXITOSA! Tu configuración de Supabase está correcta.\n');

    if (count > 0) {
      console.log('🎉 Todo está funcionando correctamente.');
      console.log('   Si no ves productos en el dashboard, verifica:');
      console.log('   1. Que el servidor esté corriendo: npm run dev');
      console.log('   2. Que hayas recargado la página después de los cambios');
      console.log('   3. Revisa la consola del navegador en busca de errores');
      console.log('   4. Verifica que tu usuario tenga permisos de admin\n');
    }

  } catch (error) {
    console.error('❌ ERROR inesperado:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar el test
testSupabaseConnection().catch(console.error);
