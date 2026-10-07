/**
 * Imágenes de /fastfoods en R2 (solo servidor).
 *
 * Cada negocio guarda sus fotos en `fastfoods/<negocioId>/`. Los dueños no
 * usan /api/upload-image (su DELETE es solo para admins): suben por
 * /api/fastfoods/imagen y el servidor borra las fotos reemplazadas, nunca
 * fuera de la carpeta del negocio.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// Sin SVG: se serviría desde nuestro dominio y puede llevar scripts.
const TIPOS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const EXTENSIONES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

export const MAX_BYTES = 4 * 1024 * 1024; // límite de cuerpo de Vercel ~4.5 MB

/** Sube una imagen a fastfoods/<negocioId>/ y devuelve { url, path }. */
export async function subirImagenNegocio(negocioId, file) {
  // Algunos celulares mandan el tipo vacío: lo deducimos de la extensión.
  const ext = (file.name || "").split(".").pop()?.toLowerCase() || "";
  const contentType = TIPOS[file.type] ? file.type : EXTENSIONES[ext];
  if (!contentType) throw new ErrorImagen("Solo se permiten fotos JPG, PNG o WebP");
  if (file.size > MAX_BYTES) throw new ErrorImagen("La foto no debe superar los 4 MB");

  const path = `fastfoods/${negocioId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${TIPOS[contentType]}`;
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: path,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: contentType,
    })
  );
  return { url: `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${path}`, path };
}

/**
 * Borra fotos reemplazadas o eliminadas. Ignora todo lo que no esté bajo
 * fastfoods/<negocioId>/, así un path manipulado no puede tocar otros archivos.
 */
export async function borrarImagenesNegocio(negocioId, paths) {
  const prefijo = `fastfoods/${negocioId}/`;
  const validos = (paths || []).filter(
    (p) => typeof p === "string" && p.startsWith(prefijo) && !p.includes("..")
  );
  await Promise.all(
    validos.map((Key) =>
      r2
        .send(new DeleteObjectCommand({ Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME, Key }))
        .catch((e) => console.error("[fastfoods] no se pudo borrar de R2", Key, e))
    )
  );
}

export class ErrorImagen extends Error {}
