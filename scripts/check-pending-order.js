const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrder() {
  const orderNumber = 'NRD-1766455916698-vqx8p4ymk';

  console.log(`🔍 Buscando orden: ${orderNumber}\n`);

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('numero_orden', orderNumber)
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📦 Orden encontrada:');
  console.log('  Estado:', order.estado);
  console.log('  Estado Pago:', order.estado_pago);
  console.log('  Total:', order.total);
  console.log('  Transaction ID:', order.transaction_id);
  console.log('  Created:', order.created_at);
  console.log('  Productos:', JSON.stringify(order.metadata?.productos || order.productos, null, 2));

  // Verificar el producto
  const productos = order.metadata?.productos || order.productos || [];
  if (productos.length > 0) {
    console.log('\n📊 Verificando stock de productos:');
    for (const prod of productos) {
      const { data: producto, error: prodError } = await supabase
        .from('Producto')
        .select('stock, nombre')
        .eq('id', prod.id)
        .single();

      if (producto) {
        console.log(`  - ${producto.nombre}: Stock actual = ${producto.stock}`);
      }
    }
  }
}

checkOrder().catch(console.error);
