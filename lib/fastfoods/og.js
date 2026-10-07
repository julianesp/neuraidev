/**
 * Vistas previas al compartir (og:image) de /fastfoods (solo servidor).
 *
 * WhatsApp descarta imágenes de vista previa pesadas (~300 KB): next/og genera
 * PNG de 1+ MB con fotos, así que se entregan como JPEG comprimido. Además
 * next/og no decodifica WebP: las fotos se pasan antes a JPEG con sharp.
 */

import sharp from "sharp";

export const OG_ANCHO = 1200;
export const OG_ALTO = 630;

/** Foto (JPG/PNG/WebP) lista para dibujar en next/og: data URL JPEG de 1200×630, o null. */
export async function fotoParaOg(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
      .rotate() // respeta la orientación EXIF de las fotos de celular
      .resize(OG_ANCHO, OG_ALTO, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch (e) {
    console.error("[fastfoods/og] no se pudo preparar la foto", url, e?.message);
    return null;
  }
}

/** Convierte la respuesta de next/og (PNG) en JPEG liviano para WhatsApp/Facebook. */
export async function comoJpeg(imageResponse, { cache = "public, max-age=300, s-maxage=300" } = {}) {
  const png = Buffer.from(await imageResponse.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality: 72, mozjpeg: true }).toBuffer();
  return new Response(jpeg, {
    headers: { "Content-Type": "image/jpeg", "Content-Length": String(jpeg.length), "Cache-Control": cache },
  });
}
