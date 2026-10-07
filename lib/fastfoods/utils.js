/**
 * Helpers puros de /fastfoods (sin acceso a BD): se usan en servidor y cliente.
 *
 * Colombia no tiene horario de verano, así que la hora local es siempre UTC-5.
 * El servidor corre en UTC: todo cálculo de "abierto ahora" o del vencimiento
 * del especial debe pasar por estas funciones.
 */

export const OFFSET_BOGOTA = "-05:00";

export const DIAS = [
  { key: "lun", nombre: "Lunes" },
  { key: "mar", nombre: "Martes" },
  { key: "mie", nombre: "Miércoles" },
  { key: "jue", nombre: "Jueves" },
  { key: "vie", nombre: "Viernes" },
  { key: "sab", nombre: "Sábado" },
  { key: "dom", nombre: "Domingo" },
];

// getUTCDay(): 0 = domingo
const DIA_POR_INDICE = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

export const SECCIONES = [
  { key: "especial", nombre: "Especial de hoy" },
  { key: "menu", nombre: "Menú" },
  { key: "info", nombre: "Ubicación y horario" },
  { key: "neurai", nombre: "Productos neurai.dev" },
];

// Nivel 2: variantes compartidas. El componente de cada una está en
// app/fastfoods/_components/plantillas/index.js con la misma key.
export const PLANTILLAS = [{ key: "clasica", nombre: "Clásica" }];

export const ESTADOS = ["pendiente", "publicado", "suspendido"];
export const PLANES = ["gratis", "pro"];

export const TEMA_POR_DEFECTO = {
  colorPrimario: "#e11d48",
  colorFondo: "#fff7ed",
  secciones: SECCIONES.map((s) => s.key),
};

// Rutas y nombres que no puede tomar un negocio como slug.
export const SLUGS_RESERVADOS = new Set([
  "admin", "api", "dashboard", "registro", "mi-negocio", "neurai", "nuevo",
  "editar", "login", "sign-in", "sign-up", "fastfoods", "opengraph-image", "hoy", "pedido",
]);

export function slugify(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes sin perder la letra
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function validarSlug(slug) {
  if (!slug || slug.length < 3) return "El enlace debe tener al menos 3 caracteres";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "Solo letras, números y guiones";
  if (SLUGS_RESERVADOS.has(slug)) return "Ese enlace está reservado";
  return null;
}

export function parseJSON(valor, porDefecto) {
  if (!valor) return porDefecto;
  if (typeof valor === "object") return valor;
  try {
    return JSON.parse(valor);
  } catch {
    return porDefecto;
  }
}

export function normalizarTema(tema) {
  const t = parseJSON(tema, {});
  const validas = new Set(SECCIONES.map((s) => s.key));
  const secciones = Array.isArray(t.secciones)
    ? t.secciones.filter((s) => validas.has(s))
    : TEMA_POR_DEFECTO.secciones;
  return {
    colorPrimario: esHex(t.colorPrimario) ? t.colorPrimario : TEMA_POR_DEFECTO.colorPrimario,
    colorFondo: esHex(t.colorFondo) ? t.colorFondo : TEMA_POR_DEFECTO.colorFondo,
    secciones,
  };
}

function esHex(c) {
  return typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c);
}

function hexARgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbAHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function luminancia(hex) {
  const [r, g, b] = hexARgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mezclar(a, b, peso) {
  const ra = hexARgb(a);
  const rb = hexARgb(b);
  return rgbAHex(ra.map((v, i) => v * (1 - peso) + rb[i] * peso));
}

/**
 * Variables CSS derivadas del tema. El texto se elige claro u oscuro según el
 * fondo, para que cualquier color que ponga el negocio siga siendo legible.
 */
export function variablesTema(tema) {
  const { colorPrimario, colorFondo } = normalizarTema(tema);
  const fondoOscuro = luminancia(colorFondo) < 0.35;
  const texto = fondoOscuro ? "#f8fafc" : "#1c1917";
  return {
    "--ff-primario": colorPrimario,
    "--ff-sobre-primario": luminancia(colorPrimario) < 0.45 ? "#ffffff" : "#1c1917",
    "--ff-fondo": colorFondo,
    "--ff-texto": texto,
    "--ff-texto-suave": mezclar(texto, colorFondo, 0.4),
    // Tarjetas un poco más claras que el fondo (casi blancas si el fondo es claro).
    "--ff-tarjeta": mezclar(colorFondo, "#ffffff", fondoOscuro ? 0.08 : 0.7),
    "--ff-borde": mezclar(colorFondo, texto, 0.12),
  };
}

export function formatoPrecio(valor) {
  const n = Number(valor) || 0;
  return "$" + n.toLocaleString("es-CO");
}

export function enlaceWhatsapp(numero, mensaje = "") {
  let digitos = (numero || "").replace(/\D/g, "");
  if (!digitos) return null;
  if (digitos.length === 10) digitos = "57" + digitos;
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${digitos}${texto}`;
}

/** Fecha y hora actuales en Bogotá como { fecha: "YYYY-MM-DD", dia: "lun", minutos }. */
export function ahoraBogota(fecha = new Date()) {
  const local = new Date(fecha.getTime() - 5 * 60 * 60 * 1000);
  return {
    fecha: local.toISOString().slice(0, 10),
    dia: DIA_POR_INDICE[local.getUTCDay()],
    diaAnterior: DIA_POR_INDICE[(local.getUTCDay() + 6) % 7],
    minutos: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

function aMinutos(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/**
 * ¿Está abierto ahora? Soporta horarios que pasan la medianoche
 * (p. ej. 18:00–01:00): después de las 00:00 cuenta el turno del día anterior.
 */
export function estaAbierto(horario, fecha = new Date()) {
  const h = parseJSON(horario, null);
  if (!h) return null; // sin horario configurado: no mostramos indicador
  const { dia, diaAnterior, minutos } = ahoraBogota(fecha);

  const hoy = h[dia];
  if (hoy) {
    const abre = aMinutos(hoy.abre);
    const cierra = aMinutos(hoy.cierra);
    if (abre !== null && cierra !== null) {
      if (cierra > abre ? minutos >= abre && minutos < cierra : minutos >= abre) return true;
    }
  }

  const ayer = h[diaAnterior];
  if (ayer) {
    const abre = aMinutos(ayer.abre);
    const cierra = aMinutos(ayer.cierra);
    if (abre !== null && cierra !== null && cierra <= abre && minutos < cierra) return true;
  }
  return false;
}

/**
 * Convierte "HH:MM" (hora de Bogotá) en un ISO UTC. Si esa hora ya pasó hoy,
 * se entiende que es de mañana (un especial publicado a las 11 p. m. "hasta la 1").
 */
export function horaBogotaAISO(hhmm, fecha = new Date()) {
  if (!/^\d{2}:\d{2}$/.test(hhmm || "")) return null;
  const { fecha: hoy } = ahoraBogota(fecha);
  let destino = new Date(`${hoy}T${hhmm}:00${OFFSET_BOGOTA}`);
  if (destino.getTime() <= fecha.getTime()) {
    destino = new Date(destino.getTime() + 24 * 60 * 60 * 1000);
  }
  return destino.toISOString();
}

/** "11:00 p. m." en hora de Bogotá a partir de un ISO. */
export function horaLegible(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}
