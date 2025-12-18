/**
 * Test para verificar que el stock se descuenta correctamente cuando se paga por Wompi
 *
 * Este script:
 * 1. Crea una orden de prueba con productos reales
 * 2. Simula un webhook de confirmación de Wompi
 * 3. Verifica que el stock se haya descontado
 * 4. Muestra el resultado como se vería en el dashboard y en la página del producto
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');

// Configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente de Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(emoji, message, data = null) {
  console.log(`${emoji} ${colors.bright}${message}${colors.reset}`);
  if (data) {
    console.log(data);
  }
}

function logSuccess(message, data = null) {
  log('✅', colors.green + message, data);
}

function logError(message, data = null) {
  log('❌', colors.red + message, data);
}

function logInfo(message, data = null) {
  log('ℹ️', colors.blue + message, data);
}

function logWarning(message, data = null) {
  log('⚠️', colors.yellow + message, data);
}

// Función principal del test
async function runTest() {
  console.log('\n' + '='.repeat(70));
  console.log(colors.bright + colors.cyan + '🧪 TEST DE DESCUENTO DE STOCK CON WOMPI' + colors.reset);
  console.log('='.repeat(70) + '\n');

  try {
    // 1. Obtener un producto con stock disponible
    logInfo('Paso 1: Buscando productos con stock disponible...');

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .limit(3);

    if (productsError || !products || products.length === 0) {
      logError('No se encontraron productos con stock disponible');
      return;
    }

    // Seleccionar producto para la prueba
    const testProduct = products[0];
    const testQuantity = Math.min(2, testProduct.stock); // Comprar máximo 2 unidades

    logSuccess('Producto seleccionado para prueba:');
    console.log(`  📦 Nombre: ${testProduct.title || testProduct.nombre}`);
    console.log(`  🆔 ID: ${testProduct.id}`);
    console.log(`  📊 Stock actual: ${testProduct.stock} unidades`);
    console.log(`  💰 Precio: $${testProduct.price || testProduct.precio}`);
    console.log(`  🛒 Cantidad a comprar: ${testQuantity} unidades\n`);

    // 2. Crear una orden de prueba
    logInfo('Paso 2: Creando orden de prueba en la base de datos...');

    const orderReference = `TEST-WOMPI-${Date.now()}`;
    const orderTotal = (testProduct.price || testProduct.precio) * testQuantity;

    const orderData = {
      clerk_user_id: null,
      numero_orden: orderReference,
      estado: 'pendiente',
      estado_pago: 'pendiente',
      customer_name: 'Usuario de Prueba',
      customer_email: 'test@neuraidev.com',
      customer_phone: '3001234567',
      direccion_envio: 'Dirección de prueba - Test',
      metodo_pago: 'wompi',
      referencia_pago: orderReference,
      subtotal: orderTotal,
      total: orderTotal,
      metadata: {
        productos: [
          {
            id: testProduct.id,
            nombre: testProduct.title || testProduct.nombre,
            precio: testProduct.price || testProduct.precio,
            cantidad: testQuantity,
            imagen: testProduct.images?.[0] || testProduct.imagenes?.[0] || '',
          }
        ]
      },
      created_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      logError('Error creando orden de prueba:', orderError);
      return;
    }

    logSuccess('Orden de prueba creada:');
    console.log(`  🧾 Número de orden: ${order.numero_orden}`);
    console.log(`  💵 Total: $${order.total}\n`);

    // 3. Esperar un momento antes de simular el webhook
    logInfo('Paso 3: Esperando 2 segundos antes de simular el pago...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Simular webhook de Wompi con pago aprobado
    logInfo('Paso 4: Simulando webhook de confirmación de Wompi (APPROVED)...');

    const transactionId = `test-txn-${Date.now()}`;
    const integritySecret = process.env.WOMPI_EVENTS_SECRET || process.env.WOMPI_INTEGRITY_SECRET || 'test-secret';

    // Crear el cuerpo del webhook según el formato de Wompi
    const webhookBody = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: transactionId,
          status: 'APPROVED',
          reference: orderReference,
          amount_in_cents: orderTotal * 100,
          customer_email: 'test@neuraidev.com',
          payment_method_type: 'CARD',
          payment_method: {
            type: 'CARD',
            extra: {
              last_four: '4242',
              card_type: 'VISA',
            }
          },
          created_at: new Date().toISOString(),
          finalized_at: new Date().toISOString(),
        }
      },
      sent_at: new Date().toISOString(),
      timestamp: Math.floor(Date.now() / 1000),
    };

    // Generar firma para el webhook (opcional para el test)
    const signatureProperties = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];
    let signatureString = '';

    signatureProperties.forEach(prop => {
      const value = prop.split('.').reduce((obj, key) => obj?.[key], webhookBody);
      signatureString += value || '';
    });

    signatureString += integritySecret;

    const checksum = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    webhookBody.signature = {
      properties: signatureProperties,
      checksum: checksum,
    };

    // Enviar el webhook al endpoint de confirmación
    const webhookUrl = `${API_BASE_URL}/api/payments/confirmation`;

    logInfo(`Enviando webhook a: ${webhookUrl}`);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookBody),
    });

    const webhookResult = await webhookResponse.json();

    if (!webhookResponse.ok) {
      logError('Error en la respuesta del webhook:', webhookResult);
      return;
    }

    logSuccess('Webhook procesado exitosamente:', webhookResult);
    console.log('');

    // 5. Esperar un momento para que se procesen los cambios
    logInfo('Paso 5: Esperando 3 segundos para que se procesen los cambios...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 6. Verificar que el stock se haya descontado
    logInfo('Paso 6: Verificando descuento de stock...');

    const { data: updatedProduct, error: updatedProductError } = await supabase
      .from('products')
      .select('*')
      .eq('id', testProduct.id)
      .single();

    if (updatedProductError) {
      logError('Error obteniendo producto actualizado:', updatedProductError);
      return;
    }

    const expectedNewStock = testProduct.stock - testQuantity;
    const actualNewStock = updatedProduct.stock;

    console.log('\n' + '─'.repeat(70));
    console.log(colors.bright + '📊 RESULTADO DEL TEST' + colors.reset);
    console.log('─'.repeat(70));
    console.log(`Producto: ${updatedProduct.title || updatedProduct.nombre}`);
    console.log(`ID: ${updatedProduct.id}`);
    console.log('');
    console.log(`Stock inicial:    ${testProduct.stock} unidades`);
    console.log(`Cantidad vendida: ${testQuantity} unidades`);
    console.log(`Stock esperado:   ${expectedNewStock} unidades`);
    console.log(`Stock actual:     ${actualNewStock} unidades`);
    console.log('');

    if (actualNewStock === expectedNewStock) {
      logSuccess('¡STOCK DESCONTADO CORRECTAMENTE! ✨');
      console.log('');

      // Mostrar información adicional
      logInfo('Vista del Dashboard:');
      console.log(`  • El producto "${updatedProduct.title || updatedProduct.nombre}" ahora muestra:`);
      console.log(`    Stock: ${actualNewStock} unidades`);
      console.log(`    ${actualNewStock === 0 ? '⚠️  SIN STOCK' : actualNewStock < 5 ? '⚠️  STOCK BAJO' : '✅ STOCK DISPONIBLE'}`);
      console.log('');

      logInfo('Vista de la Página del Producto:');
      console.log(`  • URL: /producto/${updatedProduct.id}`);
      console.log(`  • Stock mostrado: ${actualNewStock} unidades`);
      console.log(`  • Estado: ${actualNewStock === 0 ? 'NO DISPONIBLE' : 'DISPONIBLE PARA COMPRA'}`);
      console.log('');

      // Verificar estado de la orden
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('numero_orden', orderReference)
        .single();

      if (updatedOrder) {
        logInfo('Estado de la Orden:');
        console.log(`  • Número: ${updatedOrder.numero_orden}`);
        console.log(`  • Estado: ${updatedOrder.estado}`);
        console.log(`  • Estado de pago: ${updatedOrder.estado_pago}`);
        console.log(`  • Transaction ID: ${updatedOrder.transaction_id}`);
        console.log('');
      }

    } else {
      logError('¡ERROR! El stock no se descontó correctamente');
      console.log(`  Se esperaba: ${expectedNewStock}`);
      console.log(`  Se obtuvo: ${actualNewStock}`);
      console.log(`  Diferencia: ${actualNewStock - expectedNewStock}`);
      console.log('');
    }

    console.log('─'.repeat(70));
    console.log('');

    // 7. Limpiar datos de prueba (opcional)
    logWarning('Limpieza de datos de prueba:');
    console.log('Para revertir los cambios, puedes:');
    console.log(`  1. Restaurar el stock manualmente en el dashboard`);
    console.log(`  2. Eliminar la orden de prueba: ${orderReference}`);
    console.log('');

  } catch (error) {
    logError('Error ejecutando el test:', error);
    console.error(error);
  }
}

// Ejecutar el test
runTest()
  .then(() => {
    console.log(colors.green + '✅ Test completado' + colors.reset + '\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error(colors.red + '❌ Error fatal:', error, colors.reset);
    process.exit(1);
  });
