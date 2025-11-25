/**
 * Script de prueba para verificar autenticación con ePayco
 * Ejecutar con: node scripts/test-epayco-auth.js
 */

require('dotenv').config({ path: '.env.local' });

async function testEpaycoAuth() {
  const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
  const privateKey = process.env.EPAYCO_PRIVATE_KEY;

  console.log('\n🔍 Verificando credenciales de ePayco...\n');

  if (!publicKey || !privateKey) {
    console.error('❌ ERROR: Faltan credenciales en .env.local');
    console.log('   NEXT_PUBLIC_EPAYCO_PUBLIC_KEY:', publicKey ? '✅ Configurada' : '❌ NO configurada');
    console.log('   EPAYCO_PRIVATE_KEY:', privateKey ? '✅ Configurada' : '❌ NO configurada');
    process.exit(1);
  }

  console.log('✅ Credenciales encontradas:');
  console.log('   Public Key:', publicKey.substring(0, 15) + '...');
  console.log('   Private Key:', privateKey.substring(0, 15) + '...');

  // Crear auth string
  const authString = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
  console.log('\n🔐 Intentando autenticar con ePayco...\n');

  try {
    const authResponse = await fetch('https://apify.epayco.co/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
    });

    console.log('📡 Status de respuesta:', authResponse.status, authResponse.statusText);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('\n❌ ERROR de autenticación:');
      console.error('   Status:', authResponse.status);
      console.error('   Respuesta:', errorText);
      console.error('\n💡 Posibles causas:');
      console.error('   1. Las credenciales son incorrectas');
      console.error('   2. La cuenta de ePayco no está activa');
      console.error('   3. Estás usando credenciales de prueba en producción (o viceversa)');
      process.exit(1);
    }

    const authData = await authResponse.json();

    if (authData.token) {
      console.log('\n✅ ¡Autenticación EXITOSA!');
      console.log('   Token recibido:', authData.token.substring(0, 20) + '...');
      console.log('\n✅ Las credenciales son válidas y funcionan correctamente.\n');
    } else {
      console.error('\n❌ ERROR: No se recibió token en la respuesta');
      console.error('   Respuesta completa:', JSON.stringify(authData, null, 2));
    }

  } catch (error) {
    console.error('\n❌ ERROR de red o excepción:');
    console.error('   ', error.message);
    console.error('\n💡 Verifica tu conexión a internet');
  }
}

testEpaycoAuth();
