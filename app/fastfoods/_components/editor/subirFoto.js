// Sube una foto a la carpeta del negocio en R2. Devuelve { url, path }.
export async function subirFoto(file, negocioId) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("negocio", negocioId);
  const res = await fetch("/api/fastfoods/imagen", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.path) throw new Error(data.error || "No se pudo subir la foto");
  return data;
}
