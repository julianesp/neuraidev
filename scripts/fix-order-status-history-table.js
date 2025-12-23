import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function updateOrder() {
  try {
    // Crear cliente de Supabase con service_role (tiene todos los permisos, incluso bypassing RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Faltan credenciales de Supabase');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const orderReference = 'NRD-1766447396250-35njb8rll';

    console.log(`🔧 Actualizando orden ${orderReference}...\n`);
    console.log('ℹ️  Este script actualizará el pedido de Angela a "completado"\n');

    // Primero, vamos a insertar manualmente el registro de historial para evitar el trigger
    // Obtener el ID de la orden
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select('id, estado')
      .eq('numero_orden', orderReference)
      .single();

    if (fetchError || !orderData) {
      throw new Error(`No se pudo encontrar la orden: ${fetchError?.message || 'Orden no encontrada'}`);
    }

    console.log(`📦 Orden encontrada con ID: ${orderData.id}`);
    console.log(`   Estado actual: ${orderData.estado}\n`);

    // Insertar el registro en el historial manualmente
    console.log('📝 Registrando cambio de estado en historial...\n');

    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderData.id,
        status_anterior: orderData.estado,
        status_nuevo: 'completado',
        notas: 'Pedido actualizado manualmente - pago confirmado en Wompi',
        created_at: new Date().toISOString()
      });

    if (historyError) {
      console.log(`⚠️  No se pudo crear registro de historial: ${historyError.message}`);
      console.log('   Continuando de todas formas...\n');
    } else {
      console.log('✅ Registro de historial creado\n');
    }

    // Actualizar la orden directamente
    console.log('📝 Actualizando estado de la orden...\n');

    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({
        estado: 'completado',
        estado_pago: 'completado',
      })
      .eq('numero_orden', orderReference)
      .select();

    if (updateError) {
      throw new Error(`Error actualizando orden: ${updateError.message}`);
    }

    if (updateData && updateData.length > 0) {
      console.log('✅ Orden actualizada exitosamente!\n');
      console.log('Detalles:');
      console.log(`   Número de orden: ${updateData[0].numero_orden}`);
      console.log(`   Cliente: ${updateData[0].customer_name}`);
      console.log(`   Email: ${updateData[0].customer_email}`);
      console.log(`   Total: $${updateData[0].total}`);
      console.log(`   Estado: ${updateData[0].estado}`);
      console.log(`   Estado Pago: ${updateData[0].estado_pago}`);
      console.log('\n📱 El pedido ahora aparecerá en el dashboard como "Completado"');
    } else {
      console.log('⚠️  No se encontraron datos de la orden actualizada');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nDetalles del error:', error);

    console.log('\n💡 Solución alternativa:');
    console.log('   Puedes actualizar el pedido manualmente desde el dashboard de Supabase:');
    console.log('   1. Ve a https://supabase.com/dashboard');
    console.log('   2. Selecciona tu proyecto');
    console.log('   3. Ve a Table Editor > orders');
    console.log('   4. Busca el pedido NRD-1766447396250-35njb8rll');
    console.log('   5. Cambia "estado" y "estado_pago" a "completado"');
  }
}

updateOrder();
