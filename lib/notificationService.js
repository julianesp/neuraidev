/**
 * Servicio de notificaciones para administradores
 * Envía notificaciones push a través de Telegram y Email cuando ocurren eventos importantes
 */

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
const log = (...args) => console.log("[NOTIF]", ...args); // Cambiado a console.log para ver siempre
const logError = (...args) => console.error("[NOTIF ERROR]", ...args);

/**
 * Función de email deshabilitada - Resend fue removido del proyecto
 * @returns {Promise<boolean>}
 */
async function sendEmailNotification() {
  log("⚠️ Email notifications disabled - Resend has been removed");
  return false;
}

/**
 * Envía una notificación de venta exitosa al administrador vía Telegram y Email
 * @param {Object} orderData - Datos de la orden
 * @param {Object} transactionData - Datos de la transacción de Wompi
 * @returns {Promise<boolean>} - true si se envió exitosamente
 */
export async function notifyNewSale(orderData, transactionData) {
  try {
    log("🔔 Iniciando notifyNewSale...");
    log("Order data:", JSON.stringify(orderData, null, 2));
    log("Transaction data:", JSON.stringify(transactionData, null, 2));

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    let telegramSent = false;
    let emailSent = false;

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
    let productosHtml = '';

    if (productos.length > 0) {
      productosTexto = productos.map((p, idx) =>
        `${idx + 1}. ${p.nombre || p.name || 'Producto'} x${p.cantidad || p.quantity || 1}`
      ).join('\n');

      productosHtml = productos.map((p) =>
        `<li>${p.nombre || p.name || 'Producto'} x${p.cantidad || p.quantity || 1}</li>`
      ).join('');
    } else {
      productosTexto = 'No disponible';
      productosHtml = '<li>No disponible</li>';
    }

    // Cliente
    const clienteEmail = transactionData.customer_email || orderData.customer_email || orderData.email || 'No especificado';
    const clienteNombre = orderData.customer_name ||
                          orderData.customer_data?.full_name ||
                          orderData.metadata?.customer?.name ||
                          'Cliente';
    const clienteTelefono = orderData.customer_phone || orderData.metadata?.customer_phone || 'No especificado';
    const clienteDireccion = orderData.customer_address || orderData.direccion_envio || orderData.metadata?.customer_address || 'No especificado';
    const clienteCiudad = orderData.customer_city || orderData.metadata?.customer_city || '';
    const clienteRegion = orderData.customer_region || orderData.metadata?.customer_region || '';
    const clienteUbicacion = [clienteCiudad, clienteRegion].filter(Boolean).join(', ') || 'No especificado';
    const metodoPago = transactionData.payment_method?.type || transactionData.payment_method_type || 'ePayco';

    // Fecha y hora
    const fecha = new Date().toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Intentar enviar por Telegram
    if (!botToken || !chatId) {
      log("⚠️ Telegram no configurado. Omitiendo Telegram.");
    } else {

      // Construir el mensaje con formato enriquecido de Telegram
      const mensaje = `
🎉 <b>¡NUEVA VENTA REALIZADA!</b> 🎉

💰 <b>Monto Total:</b> ${amount}
📦 <b>Orden:</b> #${orderData.numero_orden || 'N/A'}

👤 <b>Cliente:</b>
   ${clienteNombre}
   📧 ${clienteEmail}
   📱 ${clienteTelefono}
   📍 ${clienteDireccion}
   🏙️ ${clienteUbicacion}

🛍️ <b>Productos:</b>
${productosTexto}

💳 <b>Método de pago:</b> ${metodoPago}
✅ <b>Estado:</b> APROBADO

🕐 <b>Fecha:</b> ${fecha}

---
🔗 ID Transacción: ${transactionData.id || 'N/A'}
`.trim();

      // Enviar el mensaje a Telegram
      log("📱 Intentando enviar a Telegram...");
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
        logError('Error al enviar notificación a Telegram:', errorData);
      } else {
        log('✅ Notificación enviada a Telegram exitosamente');
        telegramSent = true;
      }
    }

    // Construir HTML para el email
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .section { background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
    .label { font-weight: bold; color: #667eea; }
    .products { list-style: none; padding: 0; }
    .products li { padding: 8px 0; border-bottom: 1px solid #eee; }
    .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 ¡Nueva Venta Realizada!</h1>
    </div>
    <div class="content">
      <div class="section">
        <p><span class="label">💰 Monto Total:</span> ${amount}</p>
        <p><span class="label">📦 Orden:</span> #${orderData.numero_orden || 'N/A'}</p>
      </div>

      <div class="section">
        <p><span class="label">👤 Cliente:</span></p>
        <p>${clienteNombre}</p>
        <p><span class="label">📧 Email:</span> ${clienteEmail}</p>
      </div>

      <div class="section">
        <p><span class="label">🛍️ Productos:</span></p>
        <ul class="products">
          ${productosHtml}
        </ul>
      </div>

      <div class="section">
        <p><span class="label">💳 Método de pago:</span> ${transactionData.payment_method?.type || 'Tarjeta'}</p>
        <p><span class="label">✅ Estado:</span> APROBADO</p>
        <p><span class="label">🕐 Fecha:</span> ${fecha}</p>
      </div>

      <div class="section">
        <p style="font-size: 12px; color: #999;">
          <span class="label">🔗 ID Transacción:</span> ${transactionData.id || 'N/A'}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>Este es un mensaje automático de notificación de ventas</p>
    </div>
  </div>
</body>
</html>
`.trim();

    // Enviar por email
    emailSent = await sendEmailNotification('🎉 Nueva Venta - Neurai Dev', emailHtml);

    const result = telegramSent || emailSent;
    if (result) {
      log(`✅ Notificación enviada exitosamente (Telegram: ${telegramSent}, Email: ${emailSent})`);
    } else {
      logError('❌ No se pudo enviar ninguna notificación');
    }

    return result;

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
 * Envía una notificación cuando una nueva tienda se registra
 * @param {Object} tiendaData - Datos de la tienda creada
 */
export async function notifyNewTienda(tiendaData) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!botToken || !chatId) return false;

    const fecha = new Date().toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const mensaje = `
🏪 <b>¡NUEVA TIENDA REGISTRADA!</b>

🏷️ <b>Nombre:</b> ${tiendaData.nombre}
📂 <b>Categoría:</b> ${tiendaData.categoria || "No especificada"}
🏙️ <b>Ciudad:</b> ${tiendaData.ciudad || "No especificada"}
📱 <b>Teléfono:</b> ${tiendaData.telefono || "No especificado"}
📝 <b>Descripción:</b> ${tiendaData.descripcion || "Sin descripción"}

🔗 <b>Página pública:</b> /tiendas/${tiendaData.nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}

🕐 <b>Fecha:</b> ${fecha}
`.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
          parse_mode: "HTML",
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("[NOTIF ERROR] Error al notificar nueva tienda:", error);
    return false;
  }
}

/**
 * Envía una notificación cuando el chatbot captura un lead interesado en comprar
 * @param {Object} leadData - Datos del lead {nombre, telefono, producto}
 */
export async function notifyNewLead(leadData) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!botToken || !chatId) return false;

    const fecha = new Date().toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const mensaje = `
🔥 <b>¡NUEVO LEAD DEL CHATBOT!</b>

👤 <b>Nombre:</b> ${leadData.nombre || "No especificado"}
📱 <b>Teléfono/WhatsApp:</b> ${leadData.telefono || "No especificado"}
🛍️ <b>Producto de interés:</b> ${leadData.producto || "No especificado"}

💡 <b>Acción recomendada:</b> Contáctalo pronto para cerrar la venta

🕐 <b>Fecha:</b> ${fecha}
`.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
          parse_mode: "HTML",
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("[NOTIF ERROR] Error al notificar nuevo lead:", error);
    return false;
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
