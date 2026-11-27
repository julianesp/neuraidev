/**
 * Vistas previas al compartir (og:image) de /fastfoods (solo servidor).
 *
 * WhatsApp descarta imágenes de vista previa pesadas (~300 KB): next/og genera
 * PNG de 1+ MB con fotos, así que se entregan como JPEG comprimido. Además
 * next/og no decodifica WebP: las fotos se pasan antes a JPEG con el binding
 * IMAGES de Cloudflare (sharp no corre en Workers).
 */

import { aJpeg } from "@/lib/imagenesCloudflare";

export const OG_ANCHO = 1200;
export const OG_ALTO = 630;

/** Foto (JPG/PNG/WebP) lista para dibujar en next/og: data URL JPEG de 1200×630, o null. */
export async function fotoParaOg(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const jpeg = await aJpeg(await res.arrayBuffer(), { width: OG_ANCHO, height: OG_ALTO, fit: "cover", quality: 80 });
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch (e) {
    console.error("[fastfoods/og] no se pudo preparar la foto", url, e?.message);
    return null;
  }
}

/** Convierte la respuesta de next/og (PNG) en JPEG liviano para WhatsApp/Facebook. */
export async function comoJpeg(imageResponse, { cache = "public, max-age=300, s-maxage=300" } = {}) {
  const jpeg = await aJpeg(await imageResponse.arrayBuffer(), { quality: 72 });
  return new Response(jpeg, {
    headers: { "Content-Type": "image/jpeg", "Content-Length": String(jpeg.length), "Cache-Control": cache },
  });
}
