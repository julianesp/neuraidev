/**
 * Script para obtener el acceptance token de Wompi
 * Este token es necesario SOLO si creas transacciones directamente con la API
 * NO es necesario para el Widget Checkout
 *
 * Uso: node scripts/get-wompi-acceptance-token.js
 */

const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'pub_prod_LGXgTsMP6ErIj0DoTBIOlnVlKvaWeggC';

async function getAcceptanceToken() {
  try {
    console.log('🔐 Obteniendo acceptance token de Wompi...');
    console.log(`Public Key: ${publicKey}\n`);

    const response = await fetch(`https://production.wompi.co/v1/merchants/${publicKey}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ Token obtenido exitosamente:\n');
    console.log('================================================');
    console.log('ACCEPTANCE TOKEN:');
    console.log(data.data.presigned_acceptance.acceptance_token);
    console.log('\n================================================');
    console.log('PERSONAL AUTH TOKEN:');
    console.log(data.data.presigned_personal_data_auth.acceptance_token);
    console.log('\n================================================');
    console.log('\nPDF de Términos y Condiciones:');
    console.log(data.data.presigned_acceptance.permalink);
    console.log('\nPDF de Autorización de Datos Personales:');
    console.log(data.data.presigned_personal_data_auth.permalink);
    console.log('\n================================================');

    console.log('\n⚠️  IMPORTANTE:');
    console.log('- Estos tokens son de un solo uso');
    console.log('- Debes generar nuevos tokens para cada transacción');
    console.log('- Si usas el Widget Checkout, NO necesitas estos tokens');
    console.log('- Solo úsalos si creas transacciones directamente con la API\n');

    return data.data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  getAcceptanceToken();
}

module.exports = { getAcceptanceToken };
