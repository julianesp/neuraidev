import dotenv from 'dotenv';
import { getSupabaseClient } from '../lib/db.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function checkOrders() {
  try {
    const supabase = getSupabaseClient();

    console.log('🔍 Consultando pedidos en la base de datos...\n');

    const { data: orders, error } = await supabase
      .from('orders')
      .select('numero_orden, customer_name, customer_email, total, estado, estado_pago, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('⚠️  No hay pedidos en la base de datos');
      return;
    }

    console.log(`✅ Se encontraron ${orders.length} pedidos:\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.numero_orden}`);
      console.log(`   Cliente: ${order.customer_name || 'N/A'}`);
      console.log(`   Email: ${order.customer_email}`);
      console.log(`   Total: $${order.total}`);
      console.log(`   Estado: ${order.estado}`);
      console.log(`   Estado Pago: ${order.estado_pago}`);
      console.log(`   Fecha: ${new Date(order.created_at).toLocaleString('es-CO')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOrders();
