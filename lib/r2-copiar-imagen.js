// Copia una imagen remota (p. ej. la foto de perfil de Facebook que entrega
// Clerk) al bucket R2 del sitio y devuelve su URL pública. Las URLs de
// Facebook caducan, por eso no se guardan tal cual.
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const TIPOS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/**
 * @param {string} url   imagen de origen (https)
 * @param {string} nombre  base del archivo, sin extensión (p. ej. "testimonios/<id>")
 * @returns {Promise<string|null>} URL pública en R2, o null si no se pudo
 */
export async function copiarImagenAR2(url, nombre) {
  try {
    if (!url || !/^https:\/\//.test(url)) return null;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    const tipo = (res.headers.get("content-type") || "").split(";")[0].trim();
    const ext = TIPOS[tipo];
    if (!ext) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) return null;

    const key = `${nombre}.${ext}`;
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: tipo,
        CacheControl: "public, max-age=31536000",
      }),
    );
    return `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
  } catch (e) {
    console.error("[r2] no se pudo copiar la imagen:", e?.message || e);
    return null;
  }
}
