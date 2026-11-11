// Reduce el peso de una foto ANTES de subirla (se ejecuta en el navegador).
// Una foto de celular pesa 3-6 MB; para la web basta con ~1600 px y 250 KB.
// Si algo falla o el resultado no es más liviano, se sube la original.
export async function comprimirImagen(file, { maxLado = 1600, calidad = 0.82 } = {}) {
  try {
    if (!file?.type?.startsWith("image/")) return file;
    if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
    if (file.size < 150 * 1024) return file; // ya es liviana

    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close?.();

    // PNG (logos con transparencia) → WebP; el resto → JPEG.
    const tipo = file.type === "image/png" ? "image/webp" : "image/jpeg";
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, tipo, calidad));
    if (!blob || blob.type !== tipo || blob.size >= file.size) return file;

    const ext = tipo === "image/webp" ? "webp" : "jpg";
    const base = (file.name || "foto").replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.${ext}`, { type: tipo });
  } catch {
    return file;
  }
}
