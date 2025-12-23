import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener la URL del stream desde los parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const streamUrl = searchParams.get('url');

    console.log('[Proxy] URL solicitada:', streamUrl);

    if (!streamUrl) {
      console.error('[Proxy] No se proporcionó URL');
      return NextResponse.json(
        { error: 'URL del stream no proporcionada' },
        { status: 400 }
      );
    }

    // Validar que la URL sea del dominio permitido
    const allowedDomains = ['stream.selectafm.com', 'selectafm.com', 'virtualtronics.com', 'radio25.virtualtronics.com'];
    let url: URL;

    try {
      url = new URL(streamUrl);
    } catch (e) {
      console.error('[Proxy] URL inválida:', e);
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
      console.error('[Proxy] Dominio no autorizado:', url.hostname);
      return NextResponse.json(
        { error: 'Dominio no autorizado' },
        { status: 403 }
      );
    }

    console.log('[Proxy] Conectando al stream:', streamUrl);

    // Hacer la petición al stream con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    let response: Response;
    try {
      response = await fetch(streamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'audio/*,*/*',
        },
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[Proxy] Error al hacer fetch:', fetchError);
      return NextResponse.json(
        {
          error: 'No se pudo conectar al stream',
          details: fetchError instanceof Error ? fetchError.message : 'Error desconocido'
        },
        { status: 502 }
      );
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[Proxy] Respuesta no OK:', response.status, response.statusText);
      return NextResponse.json(
        {
          error: `Error del servidor de stream: ${response.status}`,
          details: response.statusText
        },
        { status: 502 }
      );
    }

    console.log('[Proxy] Stream conectado exitosamente');
    console.log('[Proxy] Content-Type:', response.headers.get('content-type'));

    // Crear los headers para la respuesta
    const headers = new Headers();

    // Copiar headers importantes del stream
    const contentType = response.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    } else {
      // Si no hay content-type, asumir audio MP3
      headers.set('Content-Type', 'audio/mpeg');
    }

    // Headers CORS
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Headers de caché para streaming
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Retornar el stream
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[Proxy] Error general:', error);
    return NextResponse.json(
      {
        error: 'Error al conectar con el stream',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Manejar preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
