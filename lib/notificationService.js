/**
 * Servicio de notificaciones para administradores
 * Envía notificaciones push a través de Telegram cuando ocurren eventos importantes
 */

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.warn("[NOTIF]", ...args);
const logError = (...args) => console.error("[NOTIF ERROR]", ...args);

/**
 * Envía una notificación de venta exitosa al administrador vía Telegram
 * @param {Object} orderData - Datos de la orden
 * @param {Object} transactionData - Datos de la transacción de Wompi
 * @returns {Promise<boolean>} - true si se envió exitosamente
 */
export async function notifyNewSale(orderData, transactionData) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    // Si no están configuradas las credenciales, no hacer nada (silenciosamente)
    if (!botToken || !chatId) {
      log("⚠️ Telegram no configurado. Notificación omitida.");
      return false;
    }

    // Formatear el monto
    const amount = transactionData.amount_in_cents
      ? (transactionData.amount_in_cents / 100).toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        })
      : 'N/A';

    // Extraer información de productos
    const productos = orderData.metadata?.productos || orderData.productos || orderData.items || [];
    let productosTexto = '';

    if (productos.length > 0) {
      productosTexto = productos.map((p, idx) =>
        `${idx + 1}. ${p.nombre || p.name || 'Producto'} x${p.cantidad || p.quantity || 1}`
      ).join('\n');
    } else {
      productosTexto = 'No disponible';
    }

    // Cliente
    const clienteEmail = transactionData.customer_email || orderData.email || 'No especificado';
    const clienteNombre = orderData.customer_data?.full_name ||
                          orderData.metadata?.customer?.name ||
                          'Cliente';

    // Fecha y hora
    const fecha = new Date().toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Construir el mensaje con formato enriquecido de Telegram
    const mensaje = `
🎉 <b>¡NUEVA VENTA REALIZADA!</b> 🎉

💰 <b>Monto Total:</b> ${amount}
📦 <b>Orden:</b> #${orderData.numero_orden || 'N/A'}

👤 <b>Cliente:</b>
   ${clienteNombre}
   📧 ${clienteEmail}

🛍️ <b>Productos:</b>
${productosTexto}

💳 <b>Método de pago:</b> ${transactionData.payment_method?.type || 'Tarjeta'}
✅ <b>Estado:</b> APROBADO

🕐 <b>Fecha:</b> ${fecha}

---
🔗 ID Transacción: ${transactionData.id || 'N/A'}
`.trim();

    // Enviar el mensaje a Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: 'HTML', // Permite usar formato HTML en el mensaje
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logError('Error al enviar notificación a Telegram:', errorData);
      return false;
    }

    log('✅ Notificación enviada a Telegram exitosamente');
    return true;

  } catch (error) {
    logError('❌ Error en notifyNewSale:', error);
    return false;
  }
}

/**
 * Envía una notificación de prueba para verificar la configuración
 * @returns {Promise<Object>} - Resultado de la prueba
 */
export async function sendTestNotification() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!botToken || !chatId) {
      return {
        success: false,
        error: 'TELEGRAM_BOT_TOKEN y TELEGRAM_ADMIN_CHAT_ID deben estar configurados en .env.local',
      };
    }

    const mensaje = `
🔔 <b>Notificación de Prueba</b>

✅ Tu bot de Telegram está configurado correctamente y funcionando.

Ahora recibirás notificaciones cuando se realicen ventas en tu tienda.

🕐 ${new Date().toLocaleString('es-CO')}
`.trim();

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.description || 'Error desconocido',
        details: errorData,
      };
    }

    return {
      success: true,
      message: 'Notificación de prueba enviada exitosamente',
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Envía una notificación cuando hay un error crítico en el proceso de pago
 * @param {string} errorMessage - Mensaje de error
 * @param {Object} context - Contexto adicional del error
 */
export async function notifyPaymentError(errorMessage, context = {}) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!botToken || !chatId) {
      return false;
    }

    const mensaje = `
⚠️ <b>ERROR EN PROCESO DE PAGO</b>

🚨 <b>Error:</b> ${errorMessage}

📋 <b>Detalles:</b>
${JSON.stringify(context, null, 2)}

🕐 ${new Date().toLocaleString('es-CO')}
`.trim();

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: 'HTML',
      }),
    });

    return true;

  } catch (error) {
    logError('Error al enviar notificación de error:', error);
    return false;
  }
}
