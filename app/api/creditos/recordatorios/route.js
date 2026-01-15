import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { obtenerCreditoPorId, marcarRecordatorioEnviado } from '@/lib/supabase/creditos';
import { resend, DEFAULT_FROM_EMAIL, isResendConfigured } from '@/lib/resend/client';

/**
 * Template HTML para el email de recordatorio
 */
function generarEmailRecordatorio(credito) {
  const fechaLimite = new Date(credito.fecha_limite_pago).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const diasRestantes = Math.ceil((new Date(credito.fecha_limite_pago) - new Date()) / (1000 * 60 * 60 * 24));
  const urgencia = diasRestantes < 0 ? 'vencido' : diasRestantes <= 3 ? 'urgente' : 'normal';

  const mensajeUrgencia = urgencia === 'vencido'
    ? '⚠️ Este crédito está VENCIDO'
    : urgencia === 'urgente'
    ? '⏰ Este crédito vence pronto'
    : '📅 Recordatorio de pago';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Pago - Neurai.dev</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">Neurai.dev</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">${mensajeUrgencia}</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea; margin-top: 0;">Hola ${credito.nombre_cliente},</h2>

    <p>Te escribimos para recordarte sobre el pago pendiente de tu crédito:</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencia === 'vencido' ? '#ef4444' : urgencia === 'urgente' ? '#f59e0b' : '#667eea'};">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Producto:</td>
          <td style="padding: 8px 0;">${credito.producto_nombre}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Monto total:</td>
          <td style="padding: 8px 0; font-size: 18px; color: #667eea;">$${Number(credito.monto_total).toLocaleString('es-CO')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Monto pagado:</td>
          <td style="padding: 8px 0;">$${Number(credito.monto_pagado).toLocaleString('es-CO')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Saldo pendiente:</td>
          <td style="padding: 8px 0; font-size: 20px; font-weight: bold; color: ${urgencia === 'vencido' ? '#ef4444' : '#667eea'};">$${Number(credito.monto_pendiente).toLocaleString('es-CO')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Fecha límite:</td>
          <td style="padding: 8px 0; ${urgencia === 'vencido' ? 'color: #ef4444; font-weight: bold;' : ''}">${fechaLimite}</td>
        </tr>
        ${diasRestantes >= 0 ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Días restantes:</td>
          <td style="padding: 8px 0; ${urgencia === 'urgente' ? 'color: #f59e0b; font-weight: bold;' : ''}">${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}</td>
        </tr>
        ` : `
        <tr>
          <td colspan="2" style="padding: 8px 0; color: #ef4444; font-weight: bold;">
            ⚠️ Pago vencido hace ${Math.abs(diasRestantes)} ${Math.abs(diasRestantes) === 1 ? 'día' : 'días'}
          </td>
        </tr>
        `}
      </table>
    </div>

    ${urgencia === 'vencido' ? `
    <div style="background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <strong>⚠️ Atención:</strong> Este crédito está vencido. Por favor, ponte en contacto con nosotros lo antes posible para regularizar tu pago.
    </div>
    ` : ''}

    <p>Para realizar el pago, puedes:</p>
    <ul style="line-height: 2;">
      <li>📱 Contactarnos vía WhatsApp</li>
      <li>💳 Realizar una transferencia bancaria</li>
      <li>🏪 Visitar nuestra tienda</li>
    </ul>

    <p style="margin-top: 30px;">Si ya realizaste el pago, por favor ignora este mensaje.</p>

    <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.</p>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 14px; margin: 0;">
        Gracias por tu confianza,<br>
        <strong style="color: #667eea;">Equipo Neurai.dev</strong>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">
        Este es un correo automático, por favor no respondas a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// POST - Enviar recordatorio de pago por email
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { credito_id } = body;

    if (!credito_id) {
      return NextResponse.json(
        { error: 'credito_id es requerido' },
        { status: 400 }
      );
    }

    // Obtener el crédito
    const credito = await obtenerCreditoPorId(credito_id);

    if (!credito) {
      return NextResponse.json(
        { error: 'Crédito no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que la API key de Resend esté configurada
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY no está configurada en las variables de entorno' },
        { status: 500 }
      );
    }

    // Enviar el email
    const emailHtml = generarEmailRecordatorio(credito);

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: credito.email_cliente,
      subject: `Recordatorio de pago - ${credito.producto_nombre}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error enviando email con Resend:', error);
      return NextResponse.json(
        { error: 'Error al enviar el email', details: error },
        { status: 500 }
      );
    }

    // Marcar el recordatorio como enviado
    await marcarRecordatorioEnviado(credito_id);

    return NextResponse.json({
      success: true,
      message: 'Recordatorio enviado exitosamente',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Error en POST /api/creditos/recordatorios:', error);
    return NextResponse.json(
      { error: 'Error al enviar recordatorio', details: error.message },
      { status: 500 }
    );
  }
}
