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

  console.log('📦 Orden encontrada');
  console.log('  Estado actual:', order.estado);
  console.log('  Total:', order.total);

  // 2. Descontar stock del producto
  const productos = order.metadata?.productos || order.productos || [];

  if (productos.length > 0) {
    console.log('\n📦 Procesando productos:');

    for (const prod of productos) {
      console.log(`\n  → ${prod.name || prod.nombre}`);
      console.log(`    ID: ${prod.id}`);

      // Obtener stock actual
      const { data: producto, error: prodError } = await supabase
        .from('products')
        .select('stock, nombre')
        .eq('id', prod.id)
        .single();

      if (prodError) {
        console.error(`    ❌ Error obteniendo producto:`, prodError.message);
        continue;
      }

      if (!producto) {
        console.error(`    ❌ Producto no encontrado`);
        continue;
      }

      const stockActual = producto.stock || 0;
      const cantidadComprada = prod.quantity || prod.cantidad || 1;
      const nuevoStock = Math.max(0, stockActual - cantidadComprada);

      console.log(`    Stock antes: ${stockActual}`);
      console.log(`    Cantidad vendida: ${cantidadComprada}`);
      console.log(`    Stock después: ${nuevoStock}`);

      // Actualizar stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: nuevoStock })
        .eq('id', prod.id);

      if (updateError) {
        console.error(`    ❌ Error actualizando stock:`, updateError.message);
      } else {
        console.log(`    ✅ Stock actualizado correctamente`);
      }
    }
  }

  // 3. Actualizar estado de la orden
  console.log('\n📝 Actualizando estado de la orden...');

  const { error: updateOrderError } = await supabase
    .from('orders')
    .update({
      estado: 'completado',
      estado_pago: 'completado',
      referencia_pago: 'MANUAL_FIX_' + Date.now(),
      notas_admin: 'Orden procesada manualmente - pago confirmado'
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
    .select('estado, estado_pago, total')
    .eq('numero_orden', orderNumber)
    .single();

  console.log('\n🎉 Estado final de la orden:');
  console.log('  Estado:', updatedOrder.estado);
  console.log('  Estado Pago:', updatedOrder.estado_pago);
  console.log('  Total:', `$${updatedOrder.total.toLocaleString('es-CO')}`);
  console.log('\n✅ ¡Proceso completado exitosamente!');
}

fixOrder().catch(console.error);
