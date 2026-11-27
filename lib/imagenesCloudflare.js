// Procesamiento de imágenes en Cloudflare Workers con el binding IMAGES
// (reemplaza a sharp, que es nativo y no corre en workerd).
//
// lib/marcaAgua.js sigue usando sharp para scripts/colon-fotos.mjs (Node).

import { env } from "cloudflare:workers";
import { MARCA_PNG_BASE64 } from "./marcaAguaPng.js";

function bytesDe(entrada) {
  if (entrada instanceof Uint8Array) return entrada;
  if (entrada instanceof ArrayBuffer) return new Uint8Array(entrada);
  return new Uint8Array(entrada);
}

function marcaPng() {
  return Uint8Array.from(atob(MARCA_PNG_BASE64), (c) => c.charCodeAt(0));
}

async function aBuffer(resultado) {
  return Buffer.from(await resultado.response().arrayBuffer());
}

/**
 * Igual que fotoConMarca de lib/marcaAgua.js: reduce la foto (sin agrandar)
 * a `lado` px, incrusta «Foto tomada por neurai.dev» abajo a la derecha y
 * devuelve un JPEG (Buffer).
 */
export async function fotoConMarca(entrada, { lado = 2400, calidad = 82 } = {}) {
  const bytes = bytesDe(entrada);
  const info = await env.IMAGES.info(bytes);
  const escala = Math.min(1, lado / Math.max(info.width || lado, info.height || lado));
  const width = Math.round((info.width || lado) * escala);
  const height = Math.round((info.height || lado) * escala);

  // ~30 % del lado corto ×1.4, como en la versión con sharp
  const anchoMarca = Math.max(140, Math.round(Math.min(width * 0.3, height * 0.42)));
  const margen = Math.round(Math.min(width, height) * 0.015);

  return aBuffer(
    await env.IMAGES.input(bytes)
      .transform({ width: lado, height: lado, fit: "scale-down" })
      .draw(env.IMAGES.input(marcaPng()).transform({ width: anchoMarca }), {
        bottom: margen,
        right: margen,
      })
      .output({ format: "image/jpeg", quality: calidad }),
  );
}

/** Redimensiona/recorta y devuelve JPEG (Buffer). */
export async function aJpeg(entrada, { width, height, fit = "cover", quality = 80 } = {}) {
  const t = await env.IMAGES.input(bytesDe(entrada));
  const conTamano = width || height ? t.transform({ width, height, fit }) : t;
  return aBuffer(await conTamano.output({ format: "image/jpeg", quality }));
}
