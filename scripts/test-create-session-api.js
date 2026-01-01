async function testCreateSession() {
  try {
    console.log('🧪 Probando endpoint /api/payments/create-session\n');

    const testData = {
      items: [
        {
          id: "test-product-123",
          name: "Producto de Prueba",
          quantity: 1,
          price: 50000
        }
      ],
      customerEmail: "test@example.com",
      customerName: "Cliente de Prueba",
      customerPhone: "3001234567"
    };

    console.log('📤 Enviando datos:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n');

    const response = await fetch('http://localhost:3000/api/payments/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    console.log(`📡 Respuesta (${response.status}):`);
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Sesión creada exitosamente');
      console.log('🔗 URL de pago:', result.checkoutUrl);

      // Esperar un momento y luego verificar si el pedido se guardó
      console.log('\n⏳ Esperando 2 segundos antes de verificar...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar si se guardó el pedido
      const checkResponse = await fetch('http://localhost:3000/api/dashboard/orders');
      const ordersData = await checkResponse.json();

      console.log(`\n📊 Pedidos en la base de datos: ${ordersData.orders?.length || 0}`);
      if (ordersData.orders && ordersData.orders.length > 0) {
        console.log('Último pedido:');
        console.log(`  Número: ${ordersData.orders[0].numero_orden}`);
        console.log(`  Cliente: ${ordersData.orders[0].customer_name}`);
        console.log(`  Total: $${ordersData.orders[0].total}`);
      }
    } else {
      console.log('\n❌ Error al crear sesión');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCreateSession();
