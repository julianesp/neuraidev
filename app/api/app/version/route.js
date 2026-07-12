import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/app/version
 * Informa a la app móvil cuál es la última versión (APK) disponible, para
 * mostrar el banner "Hay una versión nueva" cuando el usuario tiene un build
 * anterior. Solo relevante para cambios NATIVOS (los de JS llegan por OTA).
 *
 * Configurable por variables de entorno (sin tocar código ni base de datos):
 *   APP_LATEST_VERSION_CODE  -> número de la última versión publicada (ej. "2")
 *   APP_DOWNLOAD_URL         -> enlace de descarga del APK (build de EAS)
 *   APP_UPDATE_NOTE          -> texto breve mostrado en el banner
 *
 * Respuesta: { versionCode, urlDescarga, nota }
 */
export async function GET() {
  const versionCode = Number(process.env.APP_LATEST_VERSION_CODE) || 1;
  const urlDescarga = process.env.APP_DOWNLOAD_URL || '';
  const nota =
    process.env.APP_UPDATE_NOTE ||
    'Actualiza la app para tener las últimas mejoras.';

  return NextResponse.json(
    { versionCode, urlDescarga, nota },
    {
      // Cache corto: permite propagar una versión nueva sin martillar el server.
      headers: { 'Cache-Control': 'public, max-age=300' },
    },
  );
}
