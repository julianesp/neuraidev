// Loader de next/image: redimensiona con Cloudflare Image Transformations
// (zona neurai.dev) en vez del optimizador de Vercel, cuya cuota gratuita se
// agotó (respondía 402 y las imágenes de producto no cargaban).
// Solo se transforman imágenes de nuestros buckets R2; el resto se sirve tal cual.

const CDN = "https://images.neurai.dev";
const R2_PUBLICO = "https://pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev";
const HOSTS_PROPIOS = ["images.neurai.dev", "media.neurai.dev"];

export function cloudflareImageUrl(src, { width, quality = 80 } = {}) {
  if (!src || typeof src !== "string") return src;

  let url = src.startsWith(R2_PUBLICO) ? src.replace(R2_PUBLICO, CDN) : src;
  // Codificar espacios y tildes (rutas como "carcasa transparente 2.5/1.jpg"
  // rompen el srcset); decodeURI primero para no codificar dos veces
  try {
    url = encodeURI(decodeURI(url));
  } catch {}

  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return src; // ruta local (/images/...) u otro formato: sin transformar
  }
  if (!HOSTS_PROPIOS.includes(host)) return src;

  const opciones = [
    width && `width=${width}`,
    `quality=${quality}`,
    "format=auto",
    "fit=scale-down",
  ]
    .filter(Boolean)
    .join(",");
  return `${CDN}/cdn-cgi/image/${opciones}/${url}`;
}

export default function cloudflareLoader({ src, width, quality }) {
  return cloudflareImageUrl(src, { width, quality: quality || 80 });
}
