// Marca de agua «Foto tomada por neurai.dev» incrustada en la imagen.
//
// Se usa para las fotos públicas de Colón:
//   - scripts/colon-fotos.mjs (fotos subidas a R2 myTown/, versiones 2400/900 px)
//   - /api/upload-image con el campo marca=neurai (panel /dashboard/colon)
//
// La marca va abajo a la derecha y su tamaño es proporcional a la foto.

import sharp from "sharp";
import { MARCA_PNG_BASE64 } from "./marcaAguaPng.js";

const MARCA = Buffer.from(MARCA_PNG_BASE64, "base64");

/**
 * Redimensiona (sin agrandar), corrige la orientación EXIF e incrusta la marca.
 * Acepta fotos enormes (200 MP del celular). Devuelve un JPEG.
 */
export async function fotoConMarca(entrada, { lado = 2400, calidad = 82, mozjpeg = true } = {}) {
  const { data, info } = await sharp(entrada, { limitInputPixels: false, failOn: "none" })
    .rotate()
    .resize(lado, lado, { fit: "inside", withoutEnlargement: true })
    // Píxeles crudos: así la foto se comprime una sola vez (al final).
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  // ~30 % del lado corto ×1.4 (en horizontal ≈ 30 % del ancho; en vertical algo más).
  const anchoMarca = Math.max(140, Math.round(Math.min(width * 0.3, height * 0.42)));
  const marca = await sharp(MARCA).resize({ width: anchoMarca }).png().toBuffer({ resolveWithObject: true });
  const margen = Math.round(Math.min(width, height) * 0.015);

  return sharp(data, { raw: { width, height, channels: info.channels }, limitInputPixels: false })
    .composite([
      {
        input: marca.data,
        left: Math.max(0, width - marca.info.width - margen),
        top: Math.max(0, height - marca.info.height - margen),
      },
    ])
    .jpeg({ quality: calidad, progressive: true, mozjpeg })
    .toBuffer();
}
