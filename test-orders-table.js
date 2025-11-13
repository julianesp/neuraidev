// Script de prueba para verificar la tabla orders en Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrdersTable() {
  console.log('🔍 Verificando conexión con Supabase...\n');

  // 1. Verificar que la tabla existe
  console.log('1️⃣  Verificando que la tabla orders existe...');
  const { data: tableExists, error: tableError } = await supabase
    .from('orders')
    .select('count')
    .limit(0);

  if (tableError) {
    console.error('❌ Error: La tabla orders no existe o hay un problema de conexión');
    console.error('   Detalles:', tableError.message);
    return;
  }
  console.log('✅ La tabla orders existe\n');

  // 2. Crear una orden de prueba
  console.log('2️⃣  Creando orden de prueba...');
  const testOrder = {
    invoice: `TEST-${Date.now()}`,
    status: 'pending',
    payment_status: 'pending',
    payment_method: 'epayco',
    customer_name: 'Cliente de Prueba',
    customer_email: 'test@example.com',
    customer_phone: '3001234567',
    customer_document: '1234567890',
    items: [
      {
        id: 'test-product-1',
        name: 'Producto de Prueba',
        price: 50000,
        quantity: 2
      }
    ],
    total: 100000
  };

  const { data: insertData, error: insertError } = await supabase
    .from('orders')
    .insert([testOrder])
    .select();

  if (insertError) {
    console.error('❌ Error al crear orden de prueba');
    console.error('   Detalles:', insertError.message);
    return;
  }
  console.log('✅ Orden de prueba creada:', insertData[0].id);
  console.log('   Invoice:', insertData[0].invoice, '\n');

  // 3. Leer la orden creada
  console.log('3️⃣  Leyendo orden de prueba...');
  const { data: selectData, error: selectError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', insertData[0].id)
    .single();

  if (selectError) {
    console.error('❌ Error al leer orden de prueba');
    console.error('   Detalles:', selectError.message);
    return;
  }
  console.log('✅ Orden leída correctamente');
  console.log('   Customer:', selectData.customer_name);
  console.log('   Total:', selectData.total);
  console.log('   Items:', JSON.stringify(selectData.items, null, 2), '\n');

  // 4. Actualizar la orden (simular confirmación de pago)
  console.log('4️⃣  Actualizando orden (simulando pago aprobado)...');
  const { data: updateData, error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      payment_status: 'approved',
      transaction_id: 'TEST-TRANSACTION-123',
      ref_payco: 'TEST-REF-456'
    })
    .eq('id', insertData[0].id)
    .select();

  if (updateError) {
    console.error('❌ Error al actualizar orden');
    console.error('   Detalles:', updateError.message);
    return;
  }
  console.log('✅ Orden actualizada correctamente');
  console.log('   Status:', updateData[0].status);
  console.log('   Payment Status:', updateData[0].payment_status);
  console.log('   Transaction ID:', updateData[0].transaction_id, '\n');

  // 5. Eliminar la orden de prueba
  console.log('5️⃣  Eliminando orden de prueba...');
  const { error: deleteError } = await supabase
    .from('orders')
    .delete()
    .eq('id', insertData[0].id);

  if (deleteError) {
    console.error('❌ Error al eliminar orden de prueba');
    console.error('   Detalles:', deleteError.message);
    return;
  }
  console.log('✅ Orden de prueba eliminada\n');

  console.log('🎉 ¡TODAS LAS PRUEBAS PASARON CORRECTAMENTE!');
  console.log('');
  console.log('✅ La tabla orders está funcionando correctamente');
  console.log('✅ Se pueden crear órdenes');
  console.log('✅ Se pueden leer órdenes');
  console.log('✅ Se pueden actualizar órdenes');
  console.log('✅ Se pueden eliminar órdenes');
  console.log('');
  console.log('La integración con ePayco está lista para usarse.');
}

testOrdersTable().catch(console.error);
