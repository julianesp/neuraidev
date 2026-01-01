import dotenv from 'dotenv';
import { getSupabaseClient } from '../lib/db.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function checkRLSPolicies() {
  try {
    const supabase = getSupabaseClient();

    console.log('🔒 Verificando políticas RLS en la tabla orders...\n');

    // Verificar si RLS está habilitado
    const { data: rlsEnabled, error: rlsError } = await supabase
      .rpc('check_rls', { table_name: 'orders' })
      .single();

    if (rlsError) {
      console.log('No se pudo verificar RLS con RPC, intentando método alternativo...\n');
    }

    // Intentar insertar un pedido con clerk_user_id NULL usando Service Role
    console.log('🧪 Probando inserción con Service Role Key y clerk_user_id NULL...\n');

    const testOrder = {
      clerk_user_id: null,
      numero_orden: `RLS-TEST-${Date.now()}`,
      estado: "pendiente",
      customer_name: "Test RLS",
      customer_email: "rls@test.com",
      customer_phone: "3001234567",
      direccion_envio: "Test Address",
      metodo_pago: "wompi",
      referencia_pago: `RLS-REF-${Date.now()}`,
      total: 100000,
      subtotal: 100000,
      impuestos: 0,
      costo_envio: 0,
      descuentos: 0,
      estado_pago: "pendiente",
      metadata: {
        productos: [{ id: "test", nombre: "Test", cantidad: 1, precio: 100000 }],
        source: "rls_test"
      }
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(testOrder)
      .select();

    if (error) {
      console.error('❌ Error al insertar pedido con Service Role Key:');
      console.error('   Código:', error.code);
      console.error('   Mensaje:', error.message);
      console.error('   Detalles:', error.details);
      console.error('   Hint:', error.hint);
      console.log('\n');
      console.log('⚠️  PROBLEMA ENCONTRADO:');
      console.log('   Las políticas RLS están bloqueando inserts con clerk_user_id NULL');
      console.log('   incluso usando Service Role Key.\n');
      return;
    }

    console.log('✅ Inserción exitosa con Service Role Key!');
    console.log('   Order ID:', data[0].id);
    console.log('   Número de orden:', data[0].numero_orden);
    console.log('\n');

    // Limpiar
    console.log('🧹 Limpiando pedido de prueba...');
    await supabase.from("orders").delete().eq('id', data[0].id);
    console.log('✅ Limpieza completa');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkRLSPolicies();
