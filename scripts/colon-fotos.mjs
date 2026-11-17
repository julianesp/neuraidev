// Prepara las fotos de un lugar de Colón para /colon.
//
// Las fotos originales del celular (200 MP, 25–45 MB) se suben a R2 por el
// panel de Cloudflare. Este script las descarga, las reduce a 2400 px (visor) y
// 900 px (cuadrícula), les incrusta «Foto tomada por neurai.dev» y las sube a
// myTown/<lugar>/1.jpg, 1-sm.jpg, 2.jpg… Los originales no se tocan.
//
// Uso:
//   node --env-file=.env.local scripts/colon-fotos.mjs <lugar> <prefijo-originales>
// Ejemplos:
//   node --env-file=.env.local scripts/colon-fotos.mjs termales myTown/termales/originales/
//   node --env-file=.env.local scripts/colon-fotos.mjs parque myTown/ --solo-raiz
//
// Luego agregar/actualizar el lugar en app/colon/lugares.js con la cantidad que imprime.

import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { fotoConMarca } from "../lib/marcaAgua.js";

const [lugar, prefijo, ...flags] = process.argv.slice(2);
if (!lugar || !prefijo) {
  console.error("Uso: node --env-file=.env.local scripts/colon-fotos.mjs <lugar> <prefijo-originales> [--solo-raiz]");
  process.exit(1);
}
const soloRaiz = flags.includes("--solo-raiz"); // ignora subcarpetas del prefijo
const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || "neurai-pos-images";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const claves = [];
let token;
do {
  const r = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefijo, ContinuationToken: token }));
  for (const o of r.Contents || []) {
    const resto = o.Key.slice(prefijo.length);
    if (!/\.(jpe?g|png|webp|heic)$/i.test(o.Key)) continue;
    if (soloRaiz && resto.includes("/")) continue;
    claves.push(o.Key);
  }
  token = r.NextContinuationToken;
} while (token);

// Orden natural: 1, 2, … 10
claves.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (claves.length === 0) {
  console.error(`No hay imágenes en ${prefijo}`);
  process.exit(1);
}

for (const [i, clave] of claves.entries()) {
  const n = i + 1;
  const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: clave }));
  const original = Buffer.from(await obj.Body.transformToByteArray());

  for (const [lado, sufijo, calidad] of [[2400, "", 82], [900, "-sm", 78]]) {
    const buf = await fotoConMarca(original, { lado, calidad });
    const destino = `myTown/${lugar}/${n}${sufijo}.jpg`;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: destino,
      Body: buf,
      ContentType: "image/jpeg",
      // Sin "immutable": si se reprocesa una foto, el navegador la actualiza.
      CacheControl: "public, max-age=86400",
    }));
    console.log(`${clave} → ${destino} (${Math.round(buf.length / 1024)} KB)`);
  }
}

console.log(`\nListo: ${claves.length} fotos en myTown/${lugar}/ → fotosDe("${lugar}", ${claves.length}, …) en app/colon/lugares.js`);
