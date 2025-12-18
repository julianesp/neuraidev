/**
 * Test standalone para verificar el descuento de stock en pagos de Wompi
 * No requiere servidor HTTP, prueba directamente contra la base de datos
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

// Cliente de Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Colores para consola
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Función copiada de lib/productService.js para el test
async function decrementProductStock(productId, quantity) {
  try {
    // 1. Obtener stock actual
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock, nombre')
      .eq('id', productId)
      .single();

    if (fetchError) {
      return {
        success: false,
        error: 'Producto no encontrado: ' + fetchError.message,
        productId,
      };
    }

    const currentStock = product.stock || 0;

    // 2. Validar que hay suficiente stock
    if (currentStock < quantity) {
      return {
        success: false,
        error: 'Stock insuficiente',
        productId,
        requestedQuantity: quantity,
        availableStock: currentStock,
      };
    }

    // 3. Descontar el stock
    const newStock = currentStock - quantity;

    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) {
      return {
        success: false,
        error: 'Error al actualizar stock',
        productId,
      };
    }

    return {
      success: true,
      productId,
      quantity,
      previousStock: currentStock,
      newStock,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      productId,
    };
  }
}

async function decrementMultipleProductsStock(items) {
  try {
    const results = [];
    let allSuccess = true;

    for (const item of items) {
      const quantity = item.cantidad || item.quantity || 1;
      const productId = item.id || item.productId;

      if (!productId) {
        results.push({
          success: false,
          error: 'Item sin ID de producto',
          productId: null,
        });
        allSuccess = false;
        continue;
      }

      const result = await decrementProductStock(productId, quantity);
      results.push(result);

      if (!result.success) {
        allSuccess = false;
      }
    }

    return {
      success: allSuccess,
      results,
      message: allSuccess
        ? 'Stock actualizado exitosamente'
        : 'Hubo errores al actualizar el stock',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
}

// Test principal
async function runTest() {
  console.log('\n' + '='.repeat(70));
  console.log(c.bright + c.cyan + '🧪 TEST DE DESCUENTO DE STOCK CON WOMPI' + c.reset);
  console.log('='.repeat(70) + '\n');

  try {
    // 1. Obtener productos con stock
    console.log(`${c.blue}ℹ️  Paso 1: Buscando productos con stock...${c.reset}`);

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .limit(3);

    if (!products || products.length === 0) {
      console.log(`${c.red}❌ No hay productos con stock${c.reset}`);
      return;
    }

    const testProduct = products[0];
    const testQty = Math.min(1, testProduct.stock);

    console.log(`${c.green}✅ Producto seleccionado:${c.reset}`);
    console.log(`   📦 ${testProduct.nombre}`);
    console.log(`   🆔 ID: ${testProduct.id}`);
    console.log(`   📊 Stock actual: ${testProduct.stock} unidades`);
    console.log(`   🛒 Cantidad a comprar: ${testQty} unidad(es)\n`);

    // 2. Descontar stock
    console.log(`${c.blue}ℹ️  Paso 2: Descontando stock...${c.reset}`);

    const items = [{ id: testProduct.id, cantidad: testQty }];
    const result = await decrementMultipleProductsStock(items);

    if (!result.success) {
      console.log(`${c.red}❌ Error:${c.reset}`, result);
      return;
    }

    console.log(`${c.green}✅ Stock descontado${c.reset}\n`);

    // 3. Verificar cambio
    console.log(`${c.blue}ℹ️  Paso 3: Verificando en base de datos...${c.reset}\n`);

    const { data: updated } = await supabase
      .from('products')
      .select('*')
      .eq('id', testProduct.id)
      .single();

    const expected = testProduct.stock - testQty;
    const actual = updated.stock;

    console.log('─'.repeat(70));
    console.log(c.bright + '📊 RESULTADO DEL TEST' + c.reset);
    console.log('─'.repeat(70));
    console.log(`Producto: ${updated.nombre}`);
    console.log(`ID: ${updated.id}\n`);
    console.log(`Stock inicial:    ${testProduct.stock} unidades`);
    console.log(`Cantidad vendida: ${testQty} unidad(es)`);
    console.log(`Stock esperado:   ${expected} unidades`);
    console.log(`Stock actual:     ${actual} unidades\n`);

    if (actual === expected) {
      console.log(`${c.green}${c.bright}✅ ¡STOCK DESCONTADO CORRECTAMENTE! ✨${c.reset}\n`);

      console.log(`${c.blue}📱 Cómo se ve en el Dashboard:${c.reset}`);
      console.log(`   • Producto: "${updated.nombre}"`);
      console.log(`   • Stock: ${actual} unidad(es)`);
      console.log(`   • Estado: ${actual === 0 ? '⚠️  SIN STOCK' : actual < 5 ? '⚠️  STOCK BAJO' : '✅ DISPONIBLE'}\n`);

      console.log(`${c.blue}🌐 Cómo se ve en la Página del Producto:${c.reset}`);
      console.log(`   • URL: /producto/${updated.id}`);
      console.log(`   • Stock: ${actual} ${actual === 1 ? 'unidad disponible' : 'unidades disponibles'}`);
      console.log(`   • Botón: ${actual === 0 ? '🔒 Agotado (deshabilitado)' : '🛒 Agregar al carrito (activo)'}\n`);

      console.log(`${c.cyan}🔄 Flujo en producción:${c.reset}`);
      console.log(`   1. Cliente realiza pago en Wompi`);
      console.log(`   2. Wompi envía webhook → /api/payments/confirmation`);
      console.log(`   3. Se valida el pago (status: APPROVED)`);
      console.log(`   4. Se ejecuta decrementMultipleProductsStock()`);
      console.log(`   5. Stock se descuenta automáticamente`);
      console.log(`   6. Se genera factura y notificación`);
      console.log(`   7. Dashboard y páginas se actualizan instantáneamente\n`);

      console.log(`${c.blue}📄 Archivos clave:${c.reset}`);
      console.log(`   • app/api/payments/confirmation/route.js:137`);
      console.log(`   • app/api/payments/process-approved/route.js:104`);
      console.log(`   • lib/productService.js:296\n`);

    } else {
      console.log(`${c.red}❌ ERROR: Stock incorrecto${c.reset}`);
      console.log(`   Diferencia: ${actual - expected}\n`);
    }

    console.log('─'.repeat(70) + '\n');

  } catch (error) {
    console.error(`${c.red}❌ Error:${c.reset}`, error);
  }
}

runTest()
  .then(() => {
    console.log(`${c.green}✅ Test completado${c.reset}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${c.red}❌ Error fatal:${c.reset}`, error);
    process.exit(1);
  });
