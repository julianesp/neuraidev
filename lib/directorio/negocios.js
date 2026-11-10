import { d1Select, d1SelectOne, d1Execute } from "@/lib/db-d1";
import { normalizarHorario } from "./horario";
import {
  MAX_FOTOS,
  POR_PAGINA,
  categoriaValida,
  municipioValido,
} from "./constantes";

const COLUMNAS_PUBLICAS = `id, slug, nombre, categoria, municipio, descripcion, telefono, whatsapp,
  direccion, horario, facebook, instagram, logo_url, fotos, destacado, vistas, created_at, updated_at`;

export class ErrorDirectorio extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.status = status;
  }
}

export function parsearFotos(valor) {
  if (!valor) return [];
  try {
    const arr = JSON.parse(valor);
    return Array.isArray(arr) ? arr.filter((u) => typeof u === "string") : [];
  } catch {
    return [];
  }
}

function conFotos(fila) {
  return fila ? { ...fila, fotos: parsearFotos(fila.fotos) } : fila;
}

export function slugify(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ───────────────────────── Validación ─────────────────────────

const limpiar = (v, max) => String(v ?? "").trim().slice(0, max);
const soloDigitos = (v) => String(v ?? "").replace(/\D/g, "");

function normalizarUrl(v) {
  const s = limpiar(v, 300);
  if (!s) return "";
  const conProtocolo = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(conProtocolo);
    if (!u.hostname.includes(".")) return "";
    return u.toString();
  } catch {
    return "";
  }
}

function urlDeImagenPropia(v) {
  const base = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;
  const s = limpiar(v, 500);
  if (!s) return "";
  if (!/^https:\/\//i.test(s)) return "";
  if (base && !s.startsWith(base)) return "";
  return s;
}

/** Valida y normaliza el cuerpo que llega del formulario. Lanza ErrorDirectorio. */
export function validarNegocio(body) {
  const nombre = limpiar(body.nombre, 80);
  if (nombre.length < 3) throw new ErrorDirectorio("El nombre debe tener al menos 3 letras.");

  if (!categoriaValida(body.categoria)) throw new ErrorDirectorio("Elige una categoría.");
  if (!municipioValido(body.municipio)) throw new ErrorDirectorio("Elige el municipio.");

  // Solo se pide el WhatsApp: ese mismo número es el teléfono del negocio.
  let whatsapp = soloDigitos(body.whatsapp).replace(/^57(?=3\d{9}$)/, "").slice(0, 15);
  if (!whatsapp) throw new ErrorDirectorio("Escribe el número de WhatsApp para que te contacten.");
  if (whatsapp.length !== 10 || !whatsapp.startsWith("3")) {
    throw new ErrorDirectorio("El WhatsApp debe ser un celular de 10 dígitos, por ejemplo 3001234567.");
  }
  whatsapp = `57${whatsapp}`;
  const telefono = whatsapp;

  const fotos = (Array.isArray(body.fotos) ? body.fotos : [])
    .map(urlDeImagenPropia)
    .filter(Boolean)
    .slice(0, MAX_FOTOS);

  return {
    nombre,
    categoria: body.categoria,
    municipio: body.municipio,
    descripcion: limpiar(body.descripcion, 1200),
    telefono,
    whatsapp,
    direccion: limpiar(body.direccion, 160),
    horario: normalizarHorario(body.horario),
    facebook: normalizarUrl(body.facebook),
    instagram: normalizarUrl(body.instagram),
    logo_url: urlDeImagenPropia(body.logo_url),
    fotos,
  };
}

// ───────────────────────── Consultas públicas ─────────────────────────

export async function listarPublicos({ q, municipio, categoria, pagina = 1 } = {}) {
  const where = ["estado = 'aprobado'"];
  const params = [];
  if (municipio && municipioValido(municipio)) {
    where.push("municipio = ?");
    params.push(municipio);
  }
  if (categoria && categoriaValida(categoria)) {
    where.push("categoria = ?");
    params.push(categoria);
  }
  const termino = limpiar(q, 60);
  if (termino) {
    where.push("(LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ? OR LOWER(direccion) LIKE ?)");
    const like = `%${termino.toLowerCase()}%`;
    params.push(like, like, like);
  }
  const clausula = where.join(" AND ");
  const pag = Math.max(1, parseInt(pagina, 10) || 1);

  const [filas, total] = await Promise.all([
    d1Select(
      `SELECT ${COLUMNAS_PUBLICAS} FROM directorio_negocios
       WHERE ${clausula}
       ORDER BY destacado DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, POR_PAGINA, (pag - 1) * POR_PAGINA]
    ),
    d1SelectOne(`SELECT COUNT(*) AS n FROM directorio_negocios WHERE ${clausula}`, params),
  ]);

  return {
    negocios: filas.map(conFotos),
    total: total?.n || 0,
    pagina: pag,
    paginas: Math.max(1, Math.ceil((total?.n || 0) / POR_PAGINA)),
  };
}

export async function contarPor(columna) {
  if (columna !== "municipio" && columna !== "categoria") return {};
  const filas = await d1Select(
    `SELECT ${columna} AS clave, COUNT(*) AS n FROM directorio_negocios
     WHERE estado = 'aprobado' GROUP BY ${columna}`
  );
  return Object.fromEntries(filas.map((f) => [f.clave, f.n]));
}

export async function obtenerPorSlug(slug) {
  const fila = await d1SelectOne(
    `SELECT ${COLUMNAS_PUBLICAS} FROM directorio_negocios WHERE slug = ? AND estado = 'aprobado'`,
    [slug]
  );
  return conFotos(fila);
}

export async function masVisitados(limite = 12) {
  const filas = await d1Select(
    `SELECT ${COLUMNAS_PUBLICAS} FROM directorio_negocios
     WHERE estado = 'aprobado' AND vistas > 0
     ORDER BY vistas DESC, created_at DESC LIMIT ?`,
    [limite]
  );
  return filas.map(conFotos);
}

export async function registrarVista(id) {
  await d1Execute("UPDATE directorio_negocios SET vistas = vistas + 1 WHERE id = ?", [id]);
}

export async function slugsAprobados() {
  return d1Select(
    "SELECT slug, updated_at FROM directorio_negocios WHERE estado = 'aprobado'"
  );
}

// ───────────────────────── Escritura ─────────────────────────

export async function slugUnico(nombre, municipio) {
  const base = slugify(`${nombre}-${municipio}`) || "negocio";
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const existe = await d1SelectOne("SELECT 1 AS x FROM directorio_negocios WHERE slug = ?", [slug]);
    if (!existe) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function insertarNegocio(datos, { ownerId, ownerEmail, estado }) {
  const id = crypto.randomUUID();
  const slug = await slugUnico(datos.nombre, datos.municipio);
  const ahora = new Date().toISOString();
  await d1Execute(
    `INSERT INTO directorio_negocios
      (id, slug, nombre, categoria, municipio, descripcion, telefono, whatsapp, direccion, horario,
       facebook, instagram, logo_url, fotos, owner_id, owner_email, estado,
       created_at, updated_at, aprobado_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, slug, datos.nombre, datos.categoria, datos.municipio, datos.descripcion, datos.telefono,
      datos.whatsapp, datos.direccion, datos.horario, datos.facebook, datos.instagram,
      datos.logo_url, JSON.stringify(datos.fotos), ownerId, ownerEmail || null, estado,
      ahora, ahora, estado === "aprobado" ? ahora : null,
    ]
  );
  return { id, slug };
}
