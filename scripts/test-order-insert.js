import dotenv from 'dotenv';
import { getSupabaseClient } from '../lib/db.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function testOrderInsert() {
  try {
    const supabase = getSupabaseClient();

    console.log('🧪 Intentando insertar un pedido de prueba...\n');

    // Datos de prueba similares a los que se usan en create-session
    const testOrder = {
      clerk_user_id: null,
      numero_orden: `TEST-${Date.now()}`,
      estado: "pendiente",
      customer_name: "Cliente de Prueba",
      customer_email: "test@example.com",
      customer_phone: "3001234567",
      direccion_envio: "Pendiente de confirmar",
      metodo_pago: "wompi",
      referencia_pago: `TEST-REF-${Date.now()}`,
      total: 50000,
      subtotal: 50000,
      impuestos: 0,
      costo_envio: 0,
      descuentos: 0,
      estado_pago: "pendiente",
      metadata: {
        productos: [
          {
            id: "test-product",
            nombre: "Producto de Prueba",
            cantidad: 1,
            precio: 50000
          }
        ],
        source: "test_script"
      }
    };

    console.log('📝 Datos del pedido:');
    console.log(JSON.stringify(testOrder, null, 2));
    console.log('\n');

    const { data, error } = await supabase
      .from("orders")
      .insert(testOrder)
      .select();

    if (error) {
      console.error('❌ Error al insertar pedido:', error);
      console.error('Código:', error.code);
      console.error('Detalles:', error.details);
      console.error('Mensaje:', error.message);
      console.error('Hint:', error.hint);
      return;
    }

    console.log('✅ Pedido insertado exitosamente:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testOrderInsert();
