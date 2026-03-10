import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db";
import { sendEmail } from "@/lib/emailService";

/**
 * API Route para reenviar confirmación de compra por email
 * POST /api/orders/resend-confirmation
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: "Falta la referencia de la orden" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Buscar la orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("numero_orden", reference)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la orden esté pagada
    if (order.estado !== "completado" && order.estado_pago !== "completado") {
      return NextResponse.json(
        { error: "La orden no está completada" },
        { status: 400 }
      );
    }

    const customerEmail = order.correo_cliente || order.customer_email;
    const customerName = order.nombre_cliente || order.customer_name || "Cliente";

    if (!customerEmail) {
      return NextResponse.json(
        { error: "No se encontró el email del cliente" },
        { status: 400 }
      );
    }

    // Preparar datos de la orden para el email
    const orderItems = order.metadata?.productos || order.productos || order.items || [];
    const productsList = orderItems
      .map(
        (item) =>
          `- ${item.name || item.nombre} x${item.quantity || item.cantidad || 1} - $${parseFloat(item.price || item.precio || 0).toLocaleString("es-CO")}`
      )
      .join("\n");

    // Construir el HTML del email
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Compra - Neurai.dev</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .order-details {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .products {
      margin: 20px 0;
    }
    .product-item {
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .total {
      font-size: 1.2em;
      font-weight: bold;
      color: #667eea;
      margin-top: 15px;
      text-align: right;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 0.9em;
      border-top: 1px solid #e0e0e0;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ ¡Gracias por tu compra!</h1>
    <p>Tu pedido ha sido confirmado exitosamente</p>
  </div>

  <div class="content">
    <p>Hola <strong>${customerName}</strong>,</p>

    <p>Gracias por confiar en <strong>Neurai.dev</strong>. Tu pedido ha sido procesado exitosamente y pronto lo recibirás.</p>

    <div class="order-details">
      <h2>📦 Detalles de tu Pedido</h2>
      <p><strong>Número de Orden:</strong> ${order.numero_orden}</p>
      <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
      <p><strong>Estado:</strong> ${order.estado === "completado" ? "✅ Completado" : order.estado}</p>
    </div>

    <div class="products">
      <h3>Productos:</h3>
      ${orderItems
        .map(
          (item) => `
        <div class="product-item">
          <strong>${item.name || item.nombre}</strong><br>
          Cantidad: ${item.quantity || item.cantidad || 1} -
          $${parseFloat(item.price || item.precio || 0).toLocaleString("es-CO")} COP
        </div>
      `
        )
        .join("")}

      <div class="total">
        Total: $${parseFloat(order.total || 0).toLocaleString("es-CO")} COP
      </div>
    </div>

    <p style="text-align: center;">
      <a href="https://neurai.dev/factura/${order.numero_orden}" class="button">
        📄 Ver Factura
      </a>
    </p>

    <h3>📍 ¿Qué sigue ahora?</h3>
    <ol>
      <li><strong>Confirmación:</strong> Este email confirma tu compra.</li>
      <li><strong>Preparación:</strong> Estamos preparando tu pedido.</li>
      <li><strong>Envío:</strong> Te enviaremos el código de seguimiento pronto.</li>
    </ol>

    <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
    <ul>
      <li>📧 Email: <a href="mailto:contacto@neurai.dev">contacto@neurai.dev</a></li>
      <li>💬 WhatsApp: <a href="https://wa.me/573174503604">+57 317 450 3604</a></li>
    </ul>
  </div>

  <div class="footer">
    <p>© 2025 Neurai.dev - Tienda Online de Tecnología</p>
    <p>Este es un email automático, por favor no responder.</p>
  </div>
</body>
</html>
    `;

    // Enviar el email
    try {
      await sendEmail({
        to: customerEmail,
        subject: `✅ Confirmación de Compra - Orden ${order.numero_orden}`,
        html: emailHtml,
        text: `
Hola ${customerName},

Gracias por tu compra en Neurai.dev.

Número de Orden: ${order.numero_orden}
Fecha: ${new Date(order.created_at).toLocaleDateString("es-ES")}
Total: $${parseFloat(order.total || 0).toLocaleString("es-CO")} COP

Productos:
${productsList}

Puedes ver tu factura en: https://neurai.dev/factura/${order.numero_orden}

Si tienes alguna pregunta, contáctanos:
- Email: contacto@neurai.dev
- WhatsApp: +57 317 450 3604

¡Gracias por confiar en nosotros!

Neurai.dev
        `,
      });

      return NextResponse.json({
        success: true,
        message: "Confirmación reenviada exitosamente",
      });
    } catch (emailError) {
      console.error("Error enviando email:", emailError);
      return NextResponse.json(
        { error: "Error al enviar el email", details: emailError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error procesando reenvío:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

// GET para verificar el estado del endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/orders/resend-confirmation",
    methods: ["POST"],
    description: "Reenvía la confirmación de compra por email",
  });
}
