import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/db';
import { sendEmail } from '@/lib/emailService';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://neurai.dev';

function formatearMoneda(valor) {
  return `$${Number(valor || 0).toLocaleString('es-CO')}`;
}

function construirEmailRecordatorio(credito) {
  const fechaLimite = new Date(credito.fecha_limite_pago);
  const ahora = new Date();
  const diasRestantes = Math.ceil((fechaLimite - ahora) / (1000 * 60 * 60 * 24));
  const vencido = diasRestantes < 0;

  const fechaLimiteTexto = fechaLimite.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let mensajePlazo;
  if (vencido) {
    mensajePlazo = `El plazo de pago venció el <strong>${fechaLimiteTexto}</strong>. Te agradecemos que te comuniques con nosotros para ponernos al día cuando puedas.`;
  } else if (diasRestantes === 0) {
    mensajePlazo = `El plazo de pago es <strong>hoy, ${fechaLimiteTexto}</strong>.`;
  } else {
    mensajePlazo = `El plazo de pago es el <strong>${fechaLimiteTexto}</strong> (${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}).`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .row:last-child { border-bottom: none; }
        .label { color: #666; }
        .value { font-weight: bold; color: #111; }
        .pendiente { color: #dc2626; font-size: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Recordatorio de pago</h1>
        </div>
        <div class="content">
          <p>Hola ${credito.nombre_cliente || 'amigo/a'},</p>

          <p>Te escribimos desde <strong>Neurai.dev</strong> para recordarte con cariño sobre tu compra a crédito. ¡Gracias por confiar en nosotros y por tenernos en cuenta! 🙌</p>

          <p>${mensajePlazo}</p>

          <div class="card">
            <div class="row">
              <span class="label">Producto</span>
              <span class="value">${credito.producto_nombre}</span>
            </div>
            <div class="row">
              <span class="label">Monto total</span>
              <span class="value">${formatearMoneda(credito.monto_total)}</span>
            </div>
            <div class="row">
              <span class="label">Pagado</span>
              <span class="value" style="color:#16a34a;">${formatearMoneda(credito.monto_pagado)}</span>
            </div>
            <div class="row">
              <span class="label">Saldo pendiente</span>
              <span class="value pendiente">${formatearMoneda(credito.monto_pendiente)}</span>
            </div>
          </div>

          <p>Si ya realizaste el pago, por favor ignora este mensaje. Si tienes cualquier duda o necesitas coordinar la forma de pago, contáctanos y con gusto te ayudamos.</p>

          <p>¡Un abrazo!<br>El equipo de Neurai.dev</p>
        </div>
        <div class="footer">
          <p>Neurai.dev - Tu tienda de tecnología y más<br>
          <a href="${SITE_URL}">${SITE_URL.replace(/^https?:\/\//, '')}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = vencido
    ? `Recordatorio de pago pendiente - Neurai.dev`
    : `Recordatorio: tu pago vence pronto - Neurai.dev`;

  return { subject, html };
}

// POST - Enviar recordatorio de pago por email a un cliente con crédito
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { credito_id } = body;

    if (!credito_id) {
      return NextResponse.json(
        { error: 'ID de crédito requerido' },
        { status: 400 }
      );
    }

    const db = getSupabaseServerClient();

    // Buscar el crédito
    const { data: credito } = await db
      .from('creditos')
      .select('*')
      .eq('id', credito_id)
      .single();

    if (!credito) {
      return NextResponse.json(
        { error: 'Crédito no encontrado' },
        { status: 404 }
      );
    }

    if (!credito.email_cliente) {
      return NextResponse.json(
        { error: 'Este crédito no tiene email del cliente' },
        { status: 400 }
      );
    }

    if (credito.estado === 'pagado_total') {
      return NextResponse.json(
        { error: 'Este crédito ya está pagado' },
        { status: 400 }
      );
    }

    // Construir y enviar el email
    const { subject, html } = construirEmailRecordatorio(credito);

    const resultado = await sendEmail({
      to: credito.email_cliente,
      subject,
      html,
    });

    if (!resultado.success) {
      console.error('Error enviando recordatorio:', resultado.error);
      return NextResponse.json(
        {
          error:
            'No se pudo enviar el email. Verifica la configuración de Resend.',
        },
        { status: 502 }
      );
    }

    // Registrar el recordatorio en el crédito
    await db
      .from('creditos')
      .update({
        numero_recordatorios: (credito.numero_recordatorios || 0) + 1,
        fecha_ultimo_recordatorio: new Date().toISOString(),
      })
      .eq('id', credito_id);

    return NextResponse.json({
      success: true,
      message: `Recordatorio enviado a ${credito.email_cliente}`,
    });
  } catch (error) {
    console.error('Error en POST /api/creditos/recordatorios:', error);
    return NextResponse.json(
      { error: 'Error al enviar el recordatorio' },
      { status: 500 }
    );
  }
}
