import dotenv from 'dotenv';
import { getSupabaseClient } from '../lib/db.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function cleanupTestOrders() {
  try {
    const supabase = getSupabaseClient();

    console.log('🧹 Limpiando pedidos de prueba...\n');

    // Eliminar pedidos de prueba (los que tienen numero_orden que empieza con TEST)
    const { data: deletedOrders, error } = await supabase
      .from('orders')
      .delete()
      .or('numero_orden.ilike.TEST-%,numero_orden.ilike.RLS-TEST-%')
      .select();

    if (error) {
      console.error('❌ Error al eliminar pedidos de prueba:', error);
      return;
    }

    if (!deletedOrders || deletedOrders.length === 0) {
      console.log('✅ No hay pedidos de prueba para eliminar');
      return;
    }

    console.log(`✅ Se eliminaron ${deletedOrders.length} pedido(s) de prueba:`);
    deletedOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.numero_orden} - ${order.customer_email}`);
    });

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

cleanupTestOrders();
