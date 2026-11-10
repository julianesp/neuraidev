// Horario semanal de un negocio. Se guarda como JSON de texto en la columna
// `horario`: {"lun":{"a":"08:00","c":"18:00"}, "dom":null, ...}  (null = cerrado)

export const DIAS = [
  { id: "lun", nombre: "Lunes" },
  { id: "mar", nombre: "Martes" },
  { id: "mie", nombre: "Miércoles" },
  { id: "jue", nombre: "Jueves" },
  { id: "vie", nombre: "Viernes" },
  { id: "sab", nombre: "Sábado" },
  { id: "dom", nombre: "Domingo" },
];

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Convierte lo que llega del formulario (objeto o texto JSON) en el texto a guardar. */
export function normalizarHorario(valor) {
  let obj = valor;
  if (typeof valor === "string") {
    try {
      obj = JSON.parse(valor);
    } catch {
      return "";
    }
  }
  if (!obj || typeof obj !== "object") return "";

  const limpio = {};
  let algunoAbierto = false;
  for (const { id } of DIAS) {
    const d = obj[id];
    if (d && HORA.test(d.a) && HORA.test(d.c)) {
      limpio[id] = { a: d.a, c: d.c };
      algunoAbierto = true;
    } else {
      limpio[id] = null;
    }
  }
  return algunoAbierto ? JSON.stringify(limpio) : "";
}

/** Texto guardado → objeto por día, o null si no hay horario estructurado. */
export function parsearHorario(texto) {
  if (!texto) return null;
  try {
    const obj = JSON.parse(texto);
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

/** "14:30" → "2:30 pm" */
export function formatearHora(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const sufijo = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}
