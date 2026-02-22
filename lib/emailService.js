/**
 * Servicio de envío de emails
 * Usar Resend para envío de emails transaccionales
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@neurai.dev';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://neurai.dev';

/**
 * Enviar email de confirmación de suscripción
 */
export async function sendConfirmationEmail(email, nombre, token) {
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY no configurado. Email no enviado.');
    return { success: false, error: 'RESEND_API_KEY no configurado' };
  }

  const confirmUrl = `${SITE_URL}/api/notifications/confirm?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a Neurai.dev!</h1>
        </div>
        <div class="content">
          <p>Hola ${nombre || 'amigo/a'},</p>

          <p>Gracias por suscribirte a las notificaciones de nuevos productos en <strong>Neurai.dev</strong>.</p>

          <p>Te enviaremos un email cada vez que subamos productos nuevos a nuestra tienda, para que seas el primero en verlos.</p>

          <p>Para confirmar tu suscripción, haz clic en el botón de abajo:</p>

          <div style="text-align: center;">
            <a href="${confirmUrl}" class="button">Confirmar Suscripción</a>
          </div>

          <p style="font-size: 12px; color: #666;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
            ${confirmUrl}
          </p>

          <p>Si no te suscribiste, puedes ignorar este email.</p>

          <p>¡Saludos!<br>El equipo de Neurai.dev</p>
        </div>
        <div class="footer">
          <p>
            Neurai.dev - Tu tienda de tecnología y más<br>
            <a href="${SITE_URL}/api/notifications/subscribe?email=${encodeURIComponent(email)}&action=unsubscribe">Cancelar suscripción</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Confirma tu suscripción a Neurai.dev',
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error enviando email:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    console.log('✅ Email de confirmación enviado:', email);
    return { success: true, data };

  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificación de nuevo producto a suscriptores
 */
export async function sendNewProductNotification(subscribers, producto) {
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY no configurado. Emails no enviados.');
    return { success: false, error: 'RESEND_API_KEY no configurado' };
  }

  const productUrl = `${SITE_URL}/producto/${producto.id}`;
  const results = [];

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${SITE_URL}/api/notifications/subscribe?token=${subscriber.token_confirmacion}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .product { background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .product-image { width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 15px; }
          .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          .price { font-size: 24px; color: #9333ea; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Nuevo Producto Disponible!</h1>
          </div>
          <div class="content">
            <p>Hola ${subscriber.nombre || 'amigo/a'},</p>

            <p>Tenemos un nuevo producto que podría interesarte:</p>

            <div class="product">
              ${producto.imagenes && producto.imagenes.length > 0 ? `
                <img src="${producto.imagenes[0]}" alt="${producto.nombre}" class="product-image">
              ` : ''}

              <h2>${producto.nombre}</h2>

              <p>${producto.descripcion || 'Descubre este increíble producto en nuestra tienda.'}</p>

              <p class="price">$${parseFloat(producto.precio).toLocaleString('es-CO')}</p>

              ${producto.stock > 0 ? `
                <p style="color: #10b981; font-weight: bold;">✓ Disponible en stock (${producto.stock} unidades)</p>
              ` : `
                <p style="color: #ef4444; font-weight: bold;">✗ Sin stock</p>
              `}

              <div style="text-align: center; margin-top: 20px;">
                <a href="${productUrl}" class="button">Ver Producto</a>
              </div>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Recibiste este email porque estás suscrito a notificaciones de nuevos productos en Neurai.dev.
            </p>
          </div>
          <div class="footer">
            <p>
              Neurai.dev - Tu tienda de tecnología y más<br>
              <a href="${unsubscribeUrl}">Cancelar suscripción</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [subscriber.email],
          subject: `Nuevo producto: ${producto.nombre}`,
          html: htmlContent,
        }),
      });

      if (response.ok) {
        results.push({ email: subscriber.email, success: true });
        console.log(`✅ Email enviado a: ${subscriber.email}`);
      } else {
        const errorData = await response.json();
        results.push({ email: subscriber.email, success: false, error: errorData });
        console.error(`❌ Error enviando a ${subscriber.email}:`, errorData);
      }

    } catch (error) {
      results.push({ email: subscriber.email, success: false, error: error.message });
      console.error(`❌ Error enviando a ${subscriber.email}:`, error);
    }

    // Pequeña pausa para no saturar el API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { success: true, results };
}
