/**
 * Script para agregar la columna views_count a la tabla Producto
 *
 * Este script agrega una columna para trackear cuántas veces se ha visitado cada producto.
 *
 * Ejecutar con: node scripts/add-views-count-column.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addViewsCountColumn() {
  console.log('🔧 Iniciando script para agregar columna views_count...\n');

  try {
    // Nota: Supabase no permite modificar el esquema directamente desde el cliente
    // Este script solo verifica si la columna existe

    console.log('📊 Verificando estructura de la tabla Producto...');

    // Intentar hacer una consulta simple para verificar si la columna existe
    const { data, error } = await supabase
      .from('Producto')
      .select('id, views_count')
      .limit(1);

    if (error) {
      if (error.message.includes('views_count')) {
        console.log('\n⚠️  La columna "views_count" no existe en la tabla Producto');
        console.log('\n📝 Necesitas agregarla manualmente en Supabase Studio:');
        console.log('\n1. Ve a https://supabase.com/dashboard');
        console.log('2. Selecciona tu proyecto');
        console.log('3. Ve a "Table Editor" → Tabla "Producto"');
        console.log('4. Haz clic en "+ New Column"');
        console.log('5. Configura así:');
        console.log('   - Name: views_count');
        console.log('   - Type: int8 (integer)');
        console.log('   - Default Value: 0');
        console.log('   - Is Nullable: Yes (o desmarca)');
        console.log('6. Guarda los cambios');
        console.log('\nO ejecuta este SQL en el editor SQL:');
        console.log('\n```sql');
        console.log('ALTER TABLE "Producto" ');
        console.log('ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;');
        console.log('```\n');

        process.exit(1);
      } else {
        throw error;
      }
    }

    console.log('✅ La columna "views_count" ya existe en la tabla Producto');
    console.log(`📊 Productos encontrados: ${data?.length || 0}`);

    // Opcional: Actualizar todos los productos que tengan views_count NULL a 0
    console.log('\n🔄 Actualizando valores NULL a 0...');

    const { data: updateData, error: updateError } = await supabase
      .from('Producto')
      .update({ views_count: 0 })
      .is('views_count', null);

    if (updateError) {
      console.log('⚠️  Error al actualizar valores NULL:', updateError.message);
    } else {
      console.log('✅ Valores NULL actualizados correctamente');
    }

    console.log('\n✅ Script completado exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error ejecutando el script:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addViewsCountColumn();
