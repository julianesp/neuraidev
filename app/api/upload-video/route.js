import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API para subir videos a Supabase Storage
 * POST /api/upload-video
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'product-videos';

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tamaño máximo (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es muy pesado. Máximo 50MB.' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no soportado. Usa MP4, WebM o MOV.' },
        { status: 400 }
      );
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;

    // Convertir el archivo a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Supabase Storage usando el cliente con SERVICE_ROLE_KEY
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error subiendo video a Supabase:', error);

      // Si el bucket no existe, dar instrucciones
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json(
          {
            error: 'El bucket "product-videos" no existe. Por favor créalo en Supabase Dashboard > Storage.',
            instructions: [
              '1. Ve a Supabase Dashboard > Storage',
              '2. Click en "New bucket"',
              '3. Nombre: product-videos',
              '4. Marca como público',
              '5. Click en "Create bucket"',
            ],
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Error subiendo el video' },
        { status: 500 }
      );
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error en upload-video:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
