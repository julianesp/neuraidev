// Subida de fotos y vídeos de los lugares de Colón (página /colon y panel
// /dashboard/colon). El archivo va directo del navegador a R2 con una URL
// prefirmada (sin el límite de 4,5 MB de Vercel); luego el servidor genera las
// versiones de la foto con la marca y lo registra en D1.

export const API_LUGARES = "/api/admin/colon/lugares";

export async function apiLugares(method, body) {
  const r = await fetch(API_LUGARES, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `Error ${r.status}`);
  return data;
}

export async function borrarLugarMedia({ mediaId, lugarId }) {
  const q = mediaId ? `media_id=${encodeURIComponent(mediaId)}` : `lugar_id=${encodeURIComponent(lugarId)}`;
  const r = await fetch(`${API_LUGARES}?${q}`, { method: "DELETE" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `Error ${r.status}`);
}

function subirConProgreso(url, archivo, contentType, onProgreso) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgreso(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Subida falló (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Sin conexión durante la subida"));
    xhr.send(archivo);
  });
}

/**
 * Sube los archivos uno por uno (con datos móviles varias subidas a la vez se
 * estorban). onCola recibe la lista de estados cada vez que cambia:
 * { nombre, estado: esperando|subiendo|procesando|listo|error, progreso, error }
 * Devuelve cuántos se subieron bien.
 */
export async function subirArchivosLugar(lugarId, archivos, onCola) {
  let cola = archivos.map((a) => ({ nombre: a.name, estado: "esperando", progreso: 0 }));
  const actualizar = (i, cambios) => {
    cola = cola.map((item, j) => (j === i ? { ...item, ...cambios } : item));
    onCola(cola);
  };
  onCola(cola);

  let ok = 0;
  for (const [i, archivo] of archivos.entries()) {
    try {
      actualizar(i, { estado: "subiendo" });
      const { uploadUrl, key, contentType, tipo } = await apiLugares("POST", {
        accion: "presign",
        lugar_id: lugarId,
        fileName: archivo.name,
        contentType: archivo.type,
      });
      await subirConProgreso(uploadUrl, archivo, contentType, (p) => actualizar(i, { progreso: p }));
      actualizar(i, { estado: "procesando", progreso: 100 });
      await apiLugares("POST", { accion: tipo, lugar_id: lugarId, key });
      actualizar(i, { estado: "listo" });
      ok++;
    } catch (err) {
      actualizar(i, { estado: "error", error: err.message });
    }
  }
  return ok;
}

export function textoEstado(c) {
  if (c.estado === "subiendo") return `Subiendo ${c.progreso}%`;
  if (c.estado === "procesando") return "Procesando…";
  if (c.estado === "listo") return "Listo";
  if (c.estado === "error") return c.error;
  return "En espera";
}
