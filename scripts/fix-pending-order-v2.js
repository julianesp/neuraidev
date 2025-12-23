const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixOrder() {
  const orderNumber = 'NRD-1766455916698-vqx8p4ymk';

  console.log(`🔧 Arreglando orden: ${orderNumber}\n`);

  // 1. Obtener la orden
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('numero_orden', orderNumber)
    .single();

  if (error) {
    console.error('❌ Error obteniendo orden:', error);
    return;
  }

  console.log('📦 Orden encontrada. Estado actual:', order.estado);

  // 2. Descontar stock del producto (usando tabla 'products')
  const productos = order.metadata?.productos || order.productos || [];

  if (productos.length > 0) {
    console.log('\n📦 Descontando stock de productos:');

    for (const prod of productos) {
      console.log(`  Procesando: ${prod.name} (ID: ${prod.id})`);

      // Obtener stock actual de la tabla 'products'
      const { data: producto, error: prodError } = await supabase
        .from('products')
        .select('stock, nombre, name')
        .eq('id', prod.id)
        .single();

      if (prodError) {
        console.error(`  ❌ Error obteniendo producto:`, prodError.message);
        continue;
      }

      const stockActual = producto.stock || 0;
      const cantidadComprada = prod.quantity || 1;
      const nuevoStock = Math.max(0, stockActual - cantidadComprada);

      console.log(`  Stock actual: ${stockActual}`);
      console.log(`  Cantidad comprada: ${cantidadComprada}`);
      console.log(`  Nuevo stock: ${nuevoStock}`);

      // Actualizar stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: nuevoStock })
        .eq('id', prod.id);

      if (updateError) {
        console.error(`  ❌ Error actualizando stock:`, updateError.message);
      } else {
        console.log(`  ✅ Stock actualizado: ${stockActual} → ${nuevoStock}`);
      }
    }
  }

  // 3. Actualizar estado de la orden (sin fecha_pago si no existe)
  console.log('\n📝 Actualizando estado de la orden...');

  const { error: updateOrderError } = await supabase
    .from('orders')
    .update({
      estado: 'completado',
      estado_pago: 'completado',
      transaction_id: 'MANUAL_FIX_' + Date.now(),
    })
    .eq('numero_orden', orderNumber);

  if (updateOrderError) {
    console.error('❌ Error actualizando orden:', updateOrderError.message);
  } else {
    console.log('✅ Orden actualizada a COMPLETADO');
  }

  // 4. Verificar cambios
  const { data: updatedOrder } = await supabase
    .from('orders')
    .select('estado, estado_pago')
    .eq('numero_orden', orderNumber)
    .single();

  console.log('\n✅ Estado final:');
  console.log('  Estado:', updatedOrder.estado);
  console.log('  Estado Pago:', updatedOrder.estado_pago);

  console.log('\n🎉 Proceso completado!');
}

fixOrder().catch(console.error);
