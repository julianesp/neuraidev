import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { d1Select, d1SelectOne, d1Execute } from '@/lib/db-d1';
import { isAdminServer } from '@/lib/auth/server-roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Las fotos originales del celular pueden ser de 200 MP: procesarlas toma tiempo.
export const maxDuration = 120;

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const CDN = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://images.neurai.dev';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  // Sin esto el SDK firma un checksum del cuerpo vacío en la URL prefirmada.
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

const EXT_FOTO = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
const EXT_VIDEO = ['mp4', 'webm', 'mov', 'mkv', '3gp'];

async function requireAdmin() {
  const user = await currentUser();
  if (!user || !isAdminServer(user)) return null;
  return user;
}

const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

async function lugarExiste(id) {
  if (!id || !/^[a-z0-9-]{1,40}$/.test(id)) return false;
  return !!(await d1SelectOne(`SELECT id FROM colon_lugares WHERE id = ?`, [id]));
}

async function siguienteOrden(lugarId) {
  const r = await d1SelectOne(
    `SELECT COALESCE(MAX(orden), 0) AS m FROM colon_lugar_media WHERE lugar_id = ?`,
    [lugarId]
  );
  return (r?.m || 0) + 1;
}

const err = (msg, status = 400) => NextResponse.json({ error: msg }, { status });

// POST /api/admin/colon/lugares — según body.accion:
//   'crear_lugar'  { titulo, descripcion? }
//   'presign'      { lugar_id, fileName, contentType } → URL para subir directo a R2
//   'foto'         { lugar_id, key } → genera 2400/900 px con marca y la registra
//   'video'        { lugar_id, key } → registra el vídeo ya subido
export async function POST(request) {
  try {
    if (!(await requireAdmin())) return err('No autorizado', 403);
    const body = await request.json();
    const ahora = new Date().toISOString();

    if (body.accion === 'crear_lugar') {
      const titulo = (body.titulo || '').trim();
      if (!titulo) return err('El nombre del lugar es requerido');
      let id = slug(titulo) || `lugar-${Date.now()}`;
      if (await lugarExiste(id)) id = `${id}-${Date.now().toString(36)}`;
      const max = await d1SelectOne(`SELECT COALESCE(MAX(orden), 0) AS m FROM colon_lugares`);
      await d1Execute(
        `INSERT INTO colon_lugares (id, titulo, descripcion, orden, created_at) VALUES (?, ?, ?, ?, ?)`,
        [id, titulo, (body.descripcion || '').trim() || null, (max?.m || 0) + 1, ahora]
      );
      return NextResponse.json({ lugar: { id, titulo, descripcion: body.descripcion || '' } });
    }

    const lugarId = body.lugar_id;
    if (!(await lugarExiste(lugarId))) return err('Lugar no encontrado', 404);

    if (body.accion === 'presign') {
      const fileName = String(body.fileName || '');
      const contentType = String(body.contentType || '');
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      const esVideo = contentType.startsWith('video/') || EXT_VIDEO.includes(ext);
      const esFoto = !esVideo && (contentType.startsWith('image/') || EXT_FOTO.includes(ext));
      if (!esVideo && !esFoto) return err('Solo se aceptan fotos o vídeos');

      const extSegura = esVideo
        ? (EXT_VIDEO.includes(ext) ? ext : 'mp4')
        : (EXT_FOTO.includes(ext) ? ext : 'jpg');
      const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extSegura}`;
      const key = esVideo
        ? `myTown/${lugarId}/videos/${nombre}`
        : `myTown/${lugarId}/originales/${nombre}`;
      const tipo = contentType || (esVideo ? 'video/mp4' : 'image/jpeg');

      const uploadUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: tipo }),
        { expiresIn: 3600 }
      );
      return NextResponse.json({ uploadUrl, key, contentType: tipo, tipo: esVideo ? 'video' : 'foto' });
    }

    const key = String(body.key || '');
    if (!key.startsWith(`myTown/${lugarId}/`) || key.includes('..')) return err('Archivo inválido');

    if (body.accion === 'video') {
      const id = crypto.randomUUID();
      const url = `${CDN}/${key}`;
      await d1Execute(
        `INSERT INTO colon_lugar_media (id, lugar_id, tipo, url, thumb_url, claves, orden, created_at)
         VALUES (?, ?, 'video', ?, NULL, ?, ?, ?)`,
        [id, lugarId, url, JSON.stringify([key]), await siguienteOrden(lugarId), ahora]
      );
      return NextResponse.json({ media: { id, tipo: 'video', url } });
    }

    if (body.accion === 'foto') {
      const obj = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
      const original = Buffer.from(await obj.Body.transformToByteArray());

      const sharp = (await import('sharp')).default;
      const { fotoConMarca } = await import('@/lib/marcaAgua');

      // Se decodifica el original (puede ser enorme) una sola vez y de esa
      // copia de 2400 px salen las dos versiones con la marca.
      let base;
      try {
        base = await sharp(original, { limitInputPixels: false, failOn: 'none' })
          .rotate()
          .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 95 })
          .toBuffer();
      } catch (e) {
        console.error('Colón: no se pudo leer la foto', key, e);
        return err('No se pudo leer la foto. Usa JPG, PNG o WebP.', 422);
      }

      const nombre = key.split('/').pop().replace(/\.[^.]+$/, '');
      const grande = `myTown/${lugarId}/${nombre}.jpg`;
      const chica = `myTown/${lugarId}/${nombre}-sm.jpg`;
      for (const [destino, lado, calidad] of [[grande, 2400, 82], [chica, 900, 78]]) {
        const buf = await fotoConMarca(base, { lado, calidad });
        await r2.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: destino,
            Body: buf,
            ContentType: 'image/jpeg',
            CacheControl: 'public, max-age=31536000, immutable',
          })
        );
      }

      const id = crypto.randomUUID();
      const url = `${CDN}/${grande}`;
      const thumb = `${CDN}/${chica}`;
      await d1Execute(
        `INSERT INTO colon_lugar_media (id, lugar_id, tipo, url, thumb_url, claves, orden, created_at)
         VALUES (?, ?, 'foto', ?, ?, ?, ?, ?)`,
        [id, lugarId, url, thumb, JSON.stringify([grande, chica, key]), await siguienteOrden(lugarId), ahora]
      );
      return NextResponse.json({ media: { id, tipo: 'foto', url, thumb_url: thumb } });
    }

    return err('Acción no válida');
  } catch (error) {
    console.error('Error en POST /api/admin/colon/lugares:', error);
    return err('Error al procesar la solicitud', 500);
  }
}

// Intercambia la posición de una fila con su vecina (dir -1 sube, +1 baja)
// y deja el orden numerado 1..n.
async function mover(tabla, filtro, params, id, dir) {
  const filas = await d1Select(
    `SELECT id FROM ${tabla} ${filtro} ORDER BY orden ASC, created_at ASC`,
    params
  );
  const i = filas.findIndex((f) => f.id === id);
  const j = i + (dir < 0 ? -1 : 1);
  if (i < 0 || j < 0 || j >= filas.length) return;
  [filas[i], filas[j]] = [filas[j], filas[i]];
  for (const [n, f] of filas.entries()) {
    await d1Execute(`UPDATE ${tabla} SET orden = ? WHERE id = ?`, [n + 1, f.id]);
  }
}

// PATCH /api/admin/colon/lugares — según body.accion:
//   'editar_lugar' { id, titulo, descripcion? }
//   'mover_lugar'  { id, dir: -1 | 1 }
//   'mover_media'  { id, dir: -1 | 1 }   (la primera foto es la portada)
//   'portada'      { id }                → pasa esa foto/vídeo al primer lugar
export async function PATCH(request) {
  try {
    if (!(await requireAdmin())) return err('No autorizado', 403);
    const body = await request.json();
    const id = String(body.id || '');
    if (!id) return err('Falta id');

    if (body.accion === 'editar_lugar') {
      const titulo = (body.titulo || '').trim();
      if (!titulo) return err('El nombre del lugar es requerido');
      await d1Execute(`UPDATE colon_lugares SET titulo = ?, descripcion = ? WHERE id = ?`, [
        titulo.slice(0, 80),
        (body.descripcion || '').trim().slice(0, 600) || null,
        id,
      ]);
      return NextResponse.json({ ok: true });
    }

    if (body.accion === 'mover_lugar') {
      await mover('colon_lugares', '', [], id, Number(body.dir));
      return NextResponse.json({ ok: true });
    }

    if (body.accion === 'mover_media' || body.accion === 'portada') {
      const fila = await d1SelectOne(`SELECT lugar_id FROM colon_lugar_media WHERE id = ?`, [id]);
      if (!fila) return err('No encontrado', 404);
      if (body.accion === 'mover_media') {
        await mover('colon_lugar_media', 'WHERE lugar_id = ?', [fila.lugar_id], id, Number(body.dir));
      } else {
        await d1Execute(
          `UPDATE colon_lugar_media SET orden = (SELECT COALESCE(MIN(orden), 0) - 1 FROM colon_lugar_media WHERE lugar_id = ?) WHERE id = ?`,
          [fila.lugar_id, id]
        );
      }
      return NextResponse.json({ ok: true });
    }

    return err('Acción no válida');
  } catch (error) {
    console.error('Error en PATCH /api/admin/colon/lugares:', error);
    return err('Error al guardar', 500);
  }
}

// DELETE /api/admin/colon/lugares?media_id=…  → borra una foto/vídeo
// DELETE /api/admin/colon/lugares?lugar_id=…  → borra un lugar creado desde la página
export async function DELETE(request) {
  try {
    if (!(await requireAdmin())) return err('No autorizado', 403);
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('media_id');
    const lugarId = searchParams.get('lugar_id');

    let filas = [];
    if (mediaId) {
      filas = await d1Select(`SELECT id, claves FROM colon_lugar_media WHERE id = ?`, [mediaId]);
      if (filas.length === 0) return err('No encontrado', 404);
      await d1Execute(`DELETE FROM colon_lugar_media WHERE id = ?`, [mediaId]);
    } else if (lugarId) {
      filas = await d1Select(`SELECT id, claves FROM colon_lugar_media WHERE lugar_id = ?`, [lugarId]);
      await d1Execute(`DELETE FROM colon_lugar_media WHERE lugar_id = ?`, [lugarId]);
      await d1Execute(`DELETE FROM colon_lugares WHERE id = ?`, [lugarId]);
    } else {
      return err('Falta media_id o lugar_id');
    }

    const claves = filas.flatMap((f) => {
      try {
        return JSON.parse(f.claves || '[]');
      } catch {
        return [];
      }
    });
    if (claves.length > 0) {
      await r2
        .send(
          new DeleteObjectsCommand({
            Bucket: BUCKET,
            Delete: { Objects: claves.map((Key) => ({ Key })) },
          })
        )
        .catch((e) => console.error('Colón: no se pudieron borrar de R2', e));
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error en DELETE /api/admin/colon/lugares:', error);
    return err('Error al borrar', 500);
  }
}
