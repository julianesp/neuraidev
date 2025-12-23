const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 Verificando estructura de tablas...\n');

  // Obtener un producto de ejemplo
  const { data: product, error: prodError } = await supabase
    .from('products')
    .select('*')
    .limit(1)
    .single();

  if (product) {
    console.log('✅ Tabla PRODUCTS - Columnas disponibles:');
    console.log(Object.keys(product).join(', '));
  } else {
    console.log('❌ Error en products:', prodError?.message);
  }

  // Obtener una orden de ejemplo
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .limit(1)
    .single();

  if (order) {
    console.log('\n✅ Tabla ORDERS - Columnas disponibles:');
    console.log(Object.keys(order).join(', '));
  } else {
    console.log('\n❌ Error en orders:', orderError?.message);
  }
}

checkTables().catch(console.error);
