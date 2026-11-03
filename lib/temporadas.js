// Animaciones de temporada de neurai.dev, con sus fechas fijas.
//
//   Nevada: del 15 de noviembre al 31 de diciembre, en todas las páginas.
//     Empieza con unos pocos copos y va aumentando cada día hasta el
//     1° de diciembre (cantidad máxima); se mantiene así hasta el 31 de
//     diciembre y el 1° de enero ya no hay nieve.
//
//   Carnaval de Negros y Blancos (Valle de Sibundoy, Alto Putumayo):
//     del 1° al 7 de enero, solo en la página de inicio.
//
// Las fechas se calculan con la hora de Colombia (America/Bogota) para que
// todos los visitantes vean el cambio el mismo día.
//
// El admin puede encender una "vista previa" desde /dashboard/configuracion
// para ver las animaciones antes de la fecha. Se guarda en localStorage, así
// que solo afecta a ese navegador: los visitantes siguen viendo las fechas.

export const PREVIEW_KEY = "neurai-temporadas-preview";
export const TEMPORADAS_EVENTO = "neurai-temporadas-cambio";

export const NIEVE_INICIO = { mes: 11, dia: 15 }; // 15 de noviembre
export const NIEVE_MAXIMO = { mes: 12, dia: 1 }; // 1° de diciembre
export const NIEVE_FIN = { mes: 12, dia: 31 }; // 31 de diciembre (inclusive)

export const CARNAVAL_INICIO = { mes: 1, dia: 1 };
export const CARNAVAL_FIN = { mes: 1, dia: 7 };

// Cantidad mínima (15 nov) y máxima (desde el 1° dic) en pantallas grandes.
// En celulares se usa la mitad.
export const COPOS_MIN = 10;
export const COPOS_MAX = 90;

const DIA_MS = 24 * 60 * 60 * 1000;

// Fecha "de calendario" de hoy en Colombia: { anio, mes, dia }
export function fechaColombia(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);
  const valor = (tipo) => Number(partes.find((p) => p.type === tipo)?.value);
  return { anio: valor("year"), mes: valor("month"), dia: valor("day") };
}

// "2026-11-20" -> { anio, mes, dia }
export function parsearFecha(texto) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto || "");
  if (!m) return null;
  return { anio: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
}

function aUTC({ anio, mes, dia }) {
  return Date.UTC(anio, mes - 1, dia);
}

// Intensidad de la nieve para una fecha: 0 = sin nieve, 1 = máxima.
// Sube en línea recta del 15 nov (≈11%) al 1° dic (100%).
export function intensidadNieve(f) {
  const enRango =
    (f.mes === 11 && f.dia >= NIEVE_INICIO.dia) || f.mes === 12;
  if (!enRango) return 0;
  if (f.mes === 12) return 1;

  const inicio = aUTC({ anio: f.anio, ...NIEVE_INICIO });
  const maximo = aUTC({ anio: f.anio, ...NIEVE_MAXIMO });
  const hoy = aUTC(f);
  const dias = (maximo - inicio) / DIA_MS; // 16
  const transcurridos = (hoy - inicio) / DIA_MS;
  const minimo = COPOS_MIN / COPOS_MAX;
  return minimo + (1 - minimo) * (transcurridos / dias);
}

// Día del carnaval (1 a 7) o 0 si no es temporada de carnaval.
export function diaCarnaval(f) {
  if (f.mes === 1 && f.dia >= CARNAVAL_INICIO.dia && f.dia <= CARNAVAL_FIN.dia) {
    return f.dia;
  }
  return 0;
}

// ---------- Vista previa (solo en el navegador del admin) ----------

export const PREVIEW_VACIO = {
  nieve: false, // forzar la nieve aunque no sea la fecha
  fechaNieve: "", // simular un día (cambia la cantidad de copos); "" = 1° dic
  carnaval: false, // forzar el carnaval en la página de inicio
  diaCarnaval: 1, // qué día del carnaval simular (1-7)
};

export function leerPreview() {
  try {
    const guardado = JSON.parse(localStorage.getItem(PREVIEW_KEY) || "null");
    return { ...PREVIEW_VACIO, ...(guardado || {}) };
  } catch {
    return { ...PREVIEW_VACIO };
  }
}

export function guardarPreview(cambios) {
  const nuevo = { ...leerPreview(), ...cambios };
  try {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(nuevo));
  } catch {
    // Navegación privada o almacenamiento bloqueado: no pasa nada
  }
  window.dispatchEvent(new Event(TEMPORADAS_EVENTO));
  return nuevo;
}

// Estado efectivo de las temporadas (fechas reales + vista previa).
export function estadoTemporadas(preview = PREVIEW_VACIO, ahora = new Date()) {
  const hoy = fechaColombia(ahora);

  let nieve = intensidadNieve(hoy);
  if (preview.nieve) {
    const simulada = parsearFecha(preview.fechaNieve);
    nieve = simulada ? intensidadNieve(simulada) : 1;
    // Si la fecha simulada queda fuera del rango, mostrar lo mínimo
    if (nieve === 0) nieve = COPOS_MIN / COPOS_MAX;
  }

  let carnaval = diaCarnaval(hoy);
  if (preview.carnaval) {
    const dia = Number(preview.diaCarnaval);
    carnaval = dia >= 1 && dia <= 7 ? dia : 1;
  }

  return {
    nieve,
    carnaval,
    previewNieve: !!preview.nieve,
    previewCarnaval: !!preview.carnaval,
  };
}
