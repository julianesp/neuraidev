/**
 * Test simplificado para verificar que el stock se descuenta correctamente
 *
 * Este script prueba directamente la función decrementMultipleProductsStock
 * sin necesidad de levantar el servidor
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente de Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Importar la función a probar
const { decrementMultipleProductsStock } = require('../lib/productService');

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
    const testQuantity = Math.min(1, testProduct.stock); // Comprar solo 1 unidad para no agotar el stock

    logSuccess('Producto seleccionado para prueba:');
    console.log(`  📦 Nombre: ${testProduct.title || testProduct.nombre}`);
    console.log(`  🆔 ID: ${testProduct.id}`);
    console.log(`  📊 Stock actual: ${testProduct.stock} unidades`);
    console.log(`  💰 Precio: $${testProduct.price || testProduct.precio}`);
    console.log(`  🛒 Cantidad a comprar: ${testQuantity} unidades\n`);

    // 2. Preparar datos de la compra
    const orderItems = [
      {
        id: testProduct.id,
        cantidad: testQuantity,
      }
    ];

    // 3. Descontar el stock usando la función del servicio
    logInfo('Paso 2: Descontando stock...');

    const stockResult = await decrementMultipleProductsStock(orderItems);

    if (!stockResult.success) {
      logError('Error al descontar stock:', stockResult);
      return;
    }

    logSuccess('Stock descontado exitosamente');
    console.log('');

    // Mostrar detalles del resultado
    stockResult.results.forEach((result) => {
      if (result.success) {
        console.log(`  ✅ Producto ${result.productId}:`);
        console.log(`     Stock anterior: ${result.previousStock} unidades`);
        console.log(`     Cantidad vendida: ${result.quantity} unidades`);
        console.log(`     Stock nuevo: ${result.newStock} unidades`);
      } else {
        console.log(`  ❌ Error en producto ${result.productId}: ${result.error}`);
      }
    });

    console.log('');

    // 4. Verificar que el stock se haya descontado consultando directamente la BD
    logInfo('Paso 3: Verificando cambio en la base de datos...');

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
      logInfo('Cómo se verá en el Dashboard:');
      console.log(`  • Producto: "${updatedProduct.title || updatedProduct.nombre}"`);
      console.log(`  • Stock actual: ${actualNewStock} unidades`);
      console.log(`  • Estado: ${actualNewStock === 0 ? '⚠️  SIN STOCK' : actualNewStock < 5 ? '⚠️  STOCK BAJO' : '✅ STOCK DISPONIBLE'}`);
      console.log('');

      logInfo('Cómo se verá en la Página del Producto:');
      console.log(`  • URL: /producto/${updatedProduct.id}`);
      console.log(`  • Stock mostrado: ${actualNewStock} unidades`);
      console.log(`  • Estado del botón de compra: ${actualNewStock === 0 ? '🔒 NO DISPONIBLE (deshabilitado)' : '🛒 AGREGAR AL CARRITO (habilitado)'}`);
      console.log(`  • Mensaje: ${actualNewStock === 0 ? '"Producto agotado"' : `"${actualNewStock} disponibles"`}`);
      console.log('');

      logInfo('Este mismo proceso ocurre cuando:');
      console.log('  1. ✅ Un cliente completa un pago por Wompi');
      console.log('  2. ✅ El webhook de confirmación es recibido (APPROVED)');
      console.log('  3. ✅ Se llama a decrementMultipleProductsStock()');
      console.log('  4. ✅ El stock se descuenta automáticamente');
      console.log('  5. ✅ Los cambios se reflejan en el dashboard y páginas de productos');
      console.log('');

    } else {
      logError('¡ERROR! El stock no se descontó correctamente');
      console.log(`  Se esperaba: ${expectedNewStock}`);
      console.log(`  Se obtuvo: ${actualNewStock}`);
      console.log(`  Diferencia: ${actualNewStock - expectedNewStock}`);
      console.log('');
    }

    console.log('─'.repeat(70));
    console.log('');

    // Mostrar información de dónde se ejecuta este código en producción
    logInfo('Ubicación del código en producción:');
    console.log('  📄 app/api/payments/confirmation/route.js:137');
    console.log('     (Webhook que recibe notificaciones de Wompi)');
    console.log('');
    console.log('  📄 app/api/payments/process-approved/route.js:104');
    console.log('     (Procesamiento inmediato de pagos aprobados)');
    console.log('');
    console.log('  📄 lib/productService.js:296');
    console.log('     (Función decrementMultipleProductsStock)');
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
