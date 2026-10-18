import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAuthInfo } from '@/lib/auth/server-roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  // Sin esto el SDK firma un checksum CRC32 del cuerpo vacío en la URL
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

const validExtensions = ['mp4', 'webm', 'mov', 'mkv', 'avi', '3gp'];

/**
 * Devuelve una URL prefirmada para que el navegador suba el video directo a R2.
 * Así el archivo no pasa por la función de Vercel (límite de ~4.5MB por petición)
 * y se pueden subir videos grandes grabados con el celular.
 */
export async function POST(request) {
  try {
    const { isAuthenticated } = await getAuthInfo();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { fileName = '', contentType = '' } = await request.json();
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    if (!contentType.startsWith('video/') && !validExtensions.includes(extension)) {
      return NextResponse.json(
        { error: `Formato no soportado. Tipo recibido: ${contentType || 'desconocido'}` },
        { status: 400 }
      );
    }

    const safeExtension = validExtensions.includes(extension) ? extension : 'mp4';
    const type = contentType || 'video/mp4';
    const randomString = Math.random().toString(36).substring(2, 15);
    const storageFileName = `videos/${Date.now()}-${randomString}.${safeExtension}`;

    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: storageFileName,
        ContentType: type,
      }),
      { expiresIn: 3600 }
    );

    return NextResponse.json({
      uploadUrl,
      contentType: type,
      url: `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${storageFileName}`,
      fileName: storageFileName,
    });
  } catch (error) {
    console.error('Error en upload-video/presign:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
