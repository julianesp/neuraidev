// Horario semanal de un negocio. Se guarda como JSON de texto en la columna
// `horario`: {"lun":{"a":"08:00","c":"18:00"}, "dom":null, ..., "cierres":["2026-12-24"]}
// (null = cerrado ese día de la semana; `cierres` = fechas puntuales en que no se abre: viajes,
// festivos, vacaciones. Las fechas pasadas se descartan al guardar).

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
const FECHA = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MAX_CIERRES = 60;

/** Fecha de hoy en Colombia como "YYYY-MM-DD" (o la de `ahora` desplazada `dias`). */
export function fechaBogota(ahora = new Date(), dias = 0) {
  const d = new Date(ahora.getTime() + dias * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(d);
}

/** "2026-12-24" → "jueves 24 de diciembre" */
export function formatearFecha(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** Fechas de cierre de hoy en adelante, ordenadas y sin repetir. */
export function cierresProximos(horario, ahora = new Date()) {
  const lista = Array.isArray(horario?.cierres) ? horario.cierres : [];
  const hoy = fechaBogota(ahora);
  return [...new Set(lista.filter((f) => typeof f === "string" && FECHA.test(f) && f >= hoy))].sort();
}

/** ¿Algún día de la semana tiene horas? */
export function tieneHorasSemanales(horario) {
  return !!horario && DIAS.some((d) => horario[d.id]);
}

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
  const cierres = cierresProximos(obj).slice(0, MAX_CIERRES);
  if (cierres.length) limpio.cierres = cierres;
  return algunoAbierto || cierres.length ? JSON.stringify(limpio) : "";
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

const ID_POR_DIA_INGLES = { Mon: "lun", Tue: "mar", Wed: "mie", Thu: "jue", Fri: "vie", Sat: "sab", Sun: "dom" };

const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * ¿Está abierto ahora (hora de Colombia)? true | false | null (sin horario estructurado).
 * Soporta horarios que cruzan la medianoche (ej. 18:00 a 02:00) y los días de cierre puntuales.
 */
export function estaAbierto(horarioTexto, ahora = new Date()) {
  const horario = parsearHorario(horarioTexto);
  if (!horario) return null;
  const cierres = cierresProximos(horario, new Date(ahora.getTime() - 86_400_000));
  const cerradoHoy = cierres.includes(fechaBogota(ahora));
  if (!tieneHorasSemanales(horario)) return cerradoHoy ? false : null;

  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ahora);
  const get = (t) => partes.find((p) => p.type === t)?.value;
  const hoy = ID_POR_DIA_INGLES[get("weekday")];
  const minutos = Number(get("hour")) * 60 + Number(get("minute"));
  const idx = DIAS.findIndex((d) => d.id === hoy);
  const ayer = DIAS[(idx + 6) % 7].id;

  const h = cerradoHoy ? null : horario[hoy]; // día de cierre: no abre su turno (la cola de ayer sí cuenta)
  if (h) {
    const a = aMinutos(h.a);
    const c = aMinutos(h.c);
    if (c > a ? minutos >= a && minutos < c : minutos >= a) return true; // turno normal o inicio del nocturno
  }
  const y = horario[ayer];
  const ayerCerrado = cierres.includes(fechaBogota(ahora, -1));
  if (y && !ayerCerrado && aMinutos(y.c) <= aMinutos(y.a) && minutos < aMinutos(y.c)) return true; // cola del turno nocturno de ayer
  return false;
}
