import dotenv from 'dotenv';
import { getSupabaseClient } from '../lib/db.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function fixOrder() {
  try {
    const supabase = getSupabaseClient();
    const orderReference = 'NRD-1766447396250-35njb8rll';

    console.log(`🔧 Actualizando orden ${orderReference}...\n`);

    // Actualizar la orden a completado
    const { data, error } = await supabase
      .from('orders')
      .update({
        estado: 'completado',
        estado_pago: 'completado',
      })
      .eq('numero_orden', orderReference)
      .select();

    if (error) {
      console.error('❌ Error actualizando orden:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Orden actualizada exitosamente!');
      console.log('\nDetalles:');
      console.log(`   Número de orden: ${data[0].numero_orden}`);
      console.log(`   Cliente: ${data[0].customer_name}`);
      console.log(`   Email: ${data[0].customer_email}`);
      console.log(`   Total: $${data[0].total}`);
      console.log(`   Estado: ${data[0].estado}`);
      console.log(`   Estado Pago: ${data[0].estado_pago}`);
      console.log('\n📱 Ahora el pedido aparecerá en el dashboard como "Completado"');
    } else {
      console.log('⚠️  No se encontró la orden');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixOrder();
