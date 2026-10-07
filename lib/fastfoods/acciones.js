/**
 * Operaciones de /fastfoods compartidas por el admin (/api/admin/fastfoods)
 * y por los dueños (/api/mi-negocio). Quien llama decide sobre QUÉ negocio
 * se actúa; aquí se valida que cada plato/especial pertenezca a ese negocio.
 */

import { NextResponse } from "next/server";
import { d1Select, d1SelectOne, d1Execute } from "@/lib/db-d1";
import { borrarImagenesNegocio } from "./r2";
import {
  ESTADOS,
  PLANES,
  PLANTILLAS,
  horaBogotaAISO,
  normalizarTema,
  parseJSON,
  slugify,
  validarSlug,
} from "./utils";

export class ErrorFastfood extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Convierte errores en respuesta JSON; los inesperados se registran y van como 500. */
export function responderError(error, contexto) {
  if (error instanceof ErrorFastfood) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(`Error en ${contexto}:`, error);
  return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
}

// Pesos sin decimales: "$8.000" (punto de miles) → 8000.
function precioEntero(valor) {
  const n = typeof valor === "number" ? Math.round(valor) : Number(String(valor ?? "").replace(/\D/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** El dueño puede editar estos campos; el admin además los de CAMPOS_ADMIN. */
const TEXTO_DUENO = [
  "nombre", "descripcion", "whatsapp", "direccion", "ciudad", "instagram", "facebook", "tiktok",
];
const TEXTO_ADMIN = ["plan_vence_en", "owner_email"];

export async function validarSlugDisponible(valor, excluirId = null) {
  const slug = slugify(valor);
  const error = validarSlug(slug);
  if (error) throw new ErrorFastfood(400, error);
  const existe = await d1SelectOne(
    `SELECT id FROM fastfoods WHERE slug = ? ${excluirId ? "AND id != ?" : ""}`,
    excluirId ? [slug, excluirId] : [slug]
  );
  if (existe) throw new ErrorFastfood(409, `El enlace /fastfoods/${slug} ya está en uso`);
  return slug;
}

export async function crearNegocio({ nombre, slug, ownerClerkId = null, ownerEmail = null, whatsapp, ciudad, estado = "pendiente" }) {
  nombre = (nombre || "").trim();
  if (!nombre) throw new ErrorFastfood(400, "El nombre es requerido");
  const slugFinal = await validarSlugDisponible(slug || nombre);
  const id = crypto.randomUUID();
  const ahora = new Date().toISOString();
  await d1Execute(
    `INSERT INTO fastfoods
       (id, slug, nombre, owner_clerk_id, owner_email, whatsapp, ciudad, estado, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      slugFinal,
      nombre,
      ownerClerkId,
      ownerEmail ? ownerEmail.trim().toLowerCase() : null,
      (whatsapp || "").replace(/\D/g, "") || null,
      (ciudad || "").trim() || null,
      estado,
      ahora,
      ahora,
    ]
  );
  return { id, slug: slugFinal };
}

/** Negocio + menú completo + especiales vigentes (para los editores). */
export async function getDetalleNegocio(id) {
  const negocio = await d1SelectOne(`SELECT * FROM fastfoods WHERE id = ?`, [id]);
  if (!negocio) throw new ErrorFastfood(404, "El negocio no existe");
  const [menu, especiales] = await Promise.all([
    d1Select(`SELECT * FROM fastfood_menu WHERE fastfood_id = ? ORDER BY orden ASC, created_at ASC`, [id]),
    d1Select(
      `SELECT * FROM fastfood_especiales WHERE fastfood_id = ? AND expira_en > ? ORDER BY created_at DESC`,
      [id, new Date().toISOString()]
    ),
  ]);
  return {
    negocio: {
      ...negocio,
      domicilio: !!negocio.domicilio,
      horario: parseJSON(negocio.horario, {}),
      tema: normalizarTema(negocio.tema),
    },
    menu,
    especiales,
  };
}

export async function crearItem(fastfoodId, body) {
  const nombre = (body.nombre || "").trim();
  if (!nombre) throw new ErrorFastfood(400, "El nombre del plato es requerido");
  const maxOrden = await d1SelectOne(
    `SELECT COALESCE(MAX(orden), 0) AS m FROM fastfood_menu WHERE fastfood_id = ?`,
    [fastfoodId]
  );
  const id = crypto.randomUUID();
  await d1Execute(
    `INSERT INTO fastfood_menu
       (id, fastfood_id, categoria, nombre, descripcion, precio, disponible, orden, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [
      id,
      fastfoodId,
      (body.categoria || "").trim() || null,
      nombre,
      (body.descripcion || "").trim() || null,
      precioEntero(body.precio),
      (maxOrden?.m || 0) + 1,
      new Date().toISOString(),
    ]
  );
  return { id };
}

/** "" o vacío = sin límite; si no, entero entre 1 y 10000. */
function porcionesValidas(valor) {
  if (valor === undefined || valor === null || valor === "") return null;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1 || n > 10000) throw new ErrorFastfood(400, "Porciones no válidas");
  return n;
}

export async function crearEspecial(fastfoodId, body) {
  const titulo = (body.titulo || "").trim();
  const expira = horaBogotaAISO(body.hasta);
  if (!titulo || !expira) throw new ErrorFastfood(400, "Plato y hora de fin (HH:MM) son requeridos");
  const id = crypto.randomUUID();
  await d1Execute(
    `INSERT INTO fastfood_especiales
       (id, fastfood_id, titulo, descripcion, precio, foto_url, foto_path, porciones, expira_en, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      fastfoodId,
      titulo,
      (body.descripcion || "").trim() || null,
      body.precio ? precioEntero(body.precio) : null,
      urlDe(pathDelNegocio(body.foto_path, fastfoodId)),
      pathDelNegocio(body.foto_path, fastfoodId),
      porcionesValidas(body.porciones),
      expira,
      new Date().toISOString(),
    ]
  );
  return { id, expira_en: expira };
}

/** URL pública de una foto, armada en el servidor (nunca la que manda el cliente). */
function urlDe(path) {
  return path ? `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${path}` : null;
}

/** Valida que una foto esté en la carpeta del negocio (subida por /api/fastfoods/imagen). */
function pathDelNegocio(path, fastfoodId) {
  if (!path) return null;
  if (typeof path !== "string" || !path.startsWith(`fastfoods/${fastfoodId}/`) || path.includes("..")) {
    throw new ErrorFastfood(400, "Imagen no válida");
  }
  return path;
}

/**
 * Agrega al UPDATE una imagen si viene `<img>_path` en el body ("" la quita).
 * Anota la anterior para borrarla de R2.
 */
function setImagen(body, img, fastfoodId, anterior, campos, params, viejos) {
  if (typeof body[`${img}_path`] !== "string") return;
  const path = pathDelNegocio(body[`${img}_path`], fastfoodId);
  campos.push(`${img}_url = ?`, `${img}_path = ?`);
  params.push(urlDe(path), path);
  if (anterior?.[`${img}_path`] && anterior[`${img}_path`] !== path) viejos.push(anterior[`${img}_path`]);
}

export async function actualizarNegocio(id, body, { admin = false } = {}) {
  const anterior = await d1SelectOne(`SELECT slug, logo_path, portada_path FROM fastfoods WHERE id = ?`, [id]);
  if (!anterior) throw new ErrorFastfood(404, "El negocio no existe");

  const campos = [];
  const params = [];
  const viejos = [];
  for (const col of admin ? [...TEXTO_DUENO, ...TEXTO_ADMIN] : TEXTO_DUENO) {
    if (typeof body[col] !== "string") continue;
    let valor = body[col].trim() || null;
    if (col === "nombre" && !valor) throw new ErrorFastfood(400, "El nombre no puede quedar vacío");
    if (col === "whatsapp" && valor) valor = valor.replace(/\D/g, "") || null;
    if (col === "owner_email" && valor) valor = valor.toLowerCase();
    campos.push(`${col} = ?`);
    params.push(valor);
  }
  setImagen(body, "logo", id, anterior, campos, params, viejos);
  setImagen(body, "portada", id, anterior, campos, params, viejos);

  if (typeof body.domicilio !== "undefined") {
    campos.push("domicilio = ?");
    params.push(body.domicilio ? 1 : 0);
  }
  if (body.horario && typeof body.horario === "object") {
    campos.push("horario = ?");
    params.push(JSON.stringify(body.horario));
  }
  if (body.tema && typeof body.tema === "object") {
    campos.push("tema = ?");
    params.push(JSON.stringify(normalizarTema(body.tema)));
  }

  // Tarjeta de sellos: la define el dueño (si la usa, cada cuántos pedidos y qué premio).
  if (body.sellos && typeof body.sellos === "object") {
    const activo = !!body.sellos.activo;
    const meta = Number(body.sellos.meta);
    const premio = String(body.sellos.premio ?? "").trim().slice(0, 80);
    if (activo && (!Number.isInteger(meta) || meta < 2 || meta > 50)) {
      throw new ErrorFastfood(400, "Los sellos deben ser entre 2 y 50 pedidos");
    }
    if (activo && !premio) throw new ErrorFastfood(400, "Escribe el premio de la tarjeta de sellos");
    campos.push("sellos_activo = ?", "sellos_meta = ?", "sellos_premio = ?");
    params.push(activo ? 1 : 0, Number.isInteger(meta) ? meta : null, premio || null);
  }

  // Solo el admin: enlace, plantilla, estado y plan.
  if (admin) {
    if (typeof body.slug === "string" && body.slug !== anterior.slug) {
      campos.push("slug = ?");
      params.push(await validarSlugDisponible(body.slug, id));
    }
    if (PLANTILLAS.some((p) => p.key === body.plantilla)) {
      campos.push("plantilla = ?");
      params.push(body.plantilla);
    }
    if (ESTADOS.includes(body.estado)) {
      campos.push("estado = ?");
      params.push(body.estado);
    }
    if (PLANES.includes(body.plan)) {
      campos.push("plan = ?");
      params.push(body.plan);
    }
  }

  if (campos.length === 0) throw new ErrorFastfood(400, "No hay cambios");
  campos.push("updated_at = ?");
  params.push(new Date().toISOString(), id);
  await d1Execute(`UPDATE fastfoods SET ${campos.join(", ")} WHERE id = ?`, params);
  await borrarImagenesNegocio(id, viejos);
}

/** Plato o especial, solo si pertenece al negocio indicado. */
async function getFilaDelNegocio(tabla, filaId, fastfoodId) {
  const fila = await d1SelectOne(`SELECT * FROM ${tabla} WHERE id = ?`, [filaId]);
  if (!fila || fila.fastfood_id !== fastfoodId) throw new ErrorFastfood(404, "No existe");
  return fila;
}

export async function actualizarItem(fastfoodId, itemId, body) {
  const anterior = await getFilaDelNegocio("fastfood_menu", itemId, fastfoodId);
  const campos = [];
  const params = [];
  const viejos = [];
  for (const col of ["categoria", "nombre", "descripcion"]) {
    if (typeof body[col] !== "string") continue;
    const valor = body[col].trim() || null;
    if (col === "nombre" && !valor) throw new ErrorFastfood(400, "El nombre no puede quedar vacío");
    campos.push(`${col} = ?`);
    params.push(valor);
  }
  setImagen(body, "foto", fastfoodId, anterior, campos, params, viejos);
  if (typeof body.precio !== "undefined") {
    campos.push("precio = ?");
    params.push(precioEntero(body.precio));
  }
  if (typeof body.disponible !== "undefined") {
    campos.push("disponible = ?");
    params.push(body.disponible ? 1 : 0);
  }
  if (Number.isInteger(body.orden)) {
    campos.push("orden = ?");
    params.push(body.orden);
  }
  if (campos.length === 0) throw new ErrorFastfood(400, "No hay cambios");
  params.push(itemId);
  await d1Execute(`UPDATE fastfood_menu SET ${campos.join(", ")} WHERE id = ?`, params);
  await borrarImagenesNegocio(fastfoodId, viejos);
}

export async function eliminarItemOEspecial(fastfoodId, { item, especial }) {
  const tabla = item ? "fastfood_menu" : "fastfood_especiales";
  const fila = await getFilaDelNegocio(tabla, item || especial, fastfoodId);
  await d1Execute(`DELETE FROM ${tabla} WHERE id = ?`, [fila.id]);
  await borrarImagenesNegocio(fastfoodId, [fila.foto_path]);
}

export async function eliminarNegocio(id) {
  const negocio = await d1SelectOne(`SELECT logo_path, portada_path FROM fastfoods WHERE id = ?`, [id]);
  if (!negocio) return;
  const fotos = await d1Select(
    `SELECT foto_path FROM fastfood_menu WHERE fastfood_id = ? AND foto_path IS NOT NULL
     UNION ALL
     SELECT foto_path FROM fastfood_especiales WHERE fastfood_id = ? AND foto_path IS NOT NULL`,
    [id, id]
  );
  await d1Execute(`DELETE FROM fastfood_menu WHERE fastfood_id = ?`, [id]);
  await d1Execute(`DELETE FROM fastfood_especiales WHERE fastfood_id = ?`, [id]);
  await d1Execute(`DELETE FROM fastfoods WHERE id = ?`, [id]);
  await borrarImagenesNegocio(id, [...fotos.map((f) => f.foto_path), negocio.logo_path, negocio.portada_path]);
}
