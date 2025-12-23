import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function updateOrder() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Faltan credenciales de Supabase');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });

    const orderReference = 'NRD-1766447396250-35njb8rll';

    console.log('🔧 Actualizando pedido de Angela a completado...\n');

    // Usar una query SQL directa para evitar los triggers
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          UPDATE orders
          SET estado = 'completado', estado_pago = 'completado'
          WHERE numero_orden = '${orderReference}'
          RETURNING *;
        `
      });

    if (error) {
      // Si rpc no está disponible, intentar de otra forma
      console.log('⚠️  RPC no disponible, usando método alternativo...\n');

      // Método alternativo: Actualizar sin el trigger
      const { data: updateData, error: updateError } = await supabase
        .from('orders')
        .update({
          estado: 'completado',
          estado_pago: 'completado'
        })
        .eq('numero_orden', orderReference)
        .select();

      if (updateError) {
        console.error('❌ Error:', updateError.message);
        console.log('\n📝 SOLUCIÓN MANUAL:');
        console.log('   1. Ve a https://supabase.com/dashboard');
        console.log('   2. Abre la consola SQL (SQL Editor)');
        console.log('   3. Ejecuta esta query:\n');
        console.log(`   ALTER TABLE orders DISABLE TRIGGER log_order_status_change_trigger;`);
        console.log(`   UPDATE orders SET estado = 'completado', estado_pago = 'completado' WHERE numero_orden = '${orderReference}';`);
        console.log(`   ALTER TABLE orders ENABLE TRIGGER log_order_status_change_trigger;`);
        return;
      }

      if (updateData && updateData.length > 0) {
        console.log('✅ Pedido actualizado exitosamente!\n');
        console.log('Detalles:');
        console.log(`   Cliente: ${updateData[0].customer_name}`);
        console.log(`   Email: ${updateData[0].customer_email}`);
        console.log(`   Total: $${updateData[0].total}`);
        console.log(`   Estado: ${updateData[0].estado}`);
        console.log(`   Estado Pago: ${updateData[0].estado_pago}`);
        console.log('\n🎉 Ahora recarga el dashboard y verás el pedido como "Completado"');
      }
    } else {
      console.log('✅ Pedido actualizado con SQL directo!');
      console.log('\n🎉 Ahora recarga el dashboard y verás el pedido como "Completado"');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateOrder();
