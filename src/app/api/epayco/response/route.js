import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

// Página de respuesta de ePayco (donde regresa el usuario)
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const ref_payco = searchParams.get('ref_payco');
  const state_pol = searchParams.get('state_pol'); // Estado de la transacción
  const response_message_pol = searchParams.get('response_message_pol');

  console.warn('[EPAYCO RESPONSE] Usuario regresó de ePayco:', {
    ref_payco,
    state_pol,
    response_message_pol
  });

  // Determinar URL de redirección basada en el estado
  let redirectUrl = '/pedido-confirmado';

  if (ref_payco) {
    redirectUrl += `?numero=${ref_payco}`;

    // Agregar parámetros de estado si están disponibles
    if (state_pol) {
      redirectUrl += `&estado=${state_pol}`;
    }

    if (response_message_pol) {
      redirectUrl += `&mensaje=${encodeURIComponent(response_message_pol)}`;
    }
  }

  // Redireccionar al usuario
  return Response.redirect(new URL(redirectUrl, request.url));
}

// También manejar POST por si ePayco envía datos por POST
export async function POST(request) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    console.warn('[EPAYCO RESPONSE POST] Datos recibidos:', data);

    const ref_payco = data.ref_payco || data.x_ref_payco;
    const state_pol = data.state_pol || data.x_cod_response;
    const response_message_pol = data.response_message_pol || data.x_response;

    let redirectUrl = '/pedido-confirmado';

    if (ref_payco) {
      redirectUrl += `?numero=${ref_payco}`;

      if (state_pol) {
        redirectUrl += `&estado=${state_pol}`;
      }

      if (response_message_pol) {
        redirectUrl += `&mensaje=${encodeURIComponent(response_message_pol)}`;
      }
    }

    // Para POST, devolvemos HTML con redirección JavaScript
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Procesando pago...</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            window.location.href = '${redirectUrl}';
          </script>
          <p>Procesando pago, por favor espere...</p>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('[EPAYCO RESPONSE POST] Error:', error);
    return Response.redirect(new URL('/pedido-confirmado?error=1', request.url));
  }
}