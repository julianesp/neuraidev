/**
 * Consultas de /fastfoods contra D1 (solo servidor).
 */

import { d1Select, d1SelectOne } from "@/lib/db-d1";
import { buildProductUrl, generateProductSlug } from "@/utils/slugify";
import { normalizarTema, parseJSON } from "./utils";

export async function getFastfoodPorSlug(slug) {
  const negocio = await d1SelectOne(`SELECT * FROM fastfoods WHERE slug = ?`, [slug]);
  if (!negocio) return null;
  return {
    ...negocio,
    domicilio: !!negocio.domicilio,
    horario: parseJSON(negocio.horario, null),
    tema: normalizarTema(negocio.tema),
  };
}

export async function getMenu(fastfoodId, { soloDisponibles = true } = {}) {
  return d1Select(
    `SELECT id, categoria, nombre, descripcion, precio, foto_url, foto_path, disponible, orden
     FROM fastfood_menu
     WHERE fastfood_id = ? ${soloDisponibles ? "AND disponible = 1" : ""}
     ORDER BY orden ASC, created_at ASC`,
    [fastfoodId]
  );
}

/** Especiales cuyo expira_en aún no pasa (los más recientes primero). */
export async function getEspecialesVigentes(fastfoodId) {
  return d1Select(
    `SELECT id, titulo, descripcion, precio, foto_url, foto_path, expira_en, created_at
     FROM fastfood_especiales
     WHERE fastfood_id = ? AND expira_en > ?
     ORDER BY created_at DESC`,
    [fastfoodId, new Date().toISOString()]
  );
}

/**
 * 4 productos baratos de neurai.dev para el bloque sobre el footer
 * (solo en plan gratis). Son compras de impulso: cables, cargadores, soportes.
 */
export async function getProductosNeurai(limite = 4) {
  try {
    const filas = await d1Select(
      `SELECT id, nombre, precio, precio_oferta, imagen_principal, imagenes, categoria
       FROM products
       WHERE disponible = 1 AND stock > 0 AND precio BETWEEN 5000 AND 80000
       ORDER BY RANDOM()
       LIMIT ?`,
      [limite]
    );
    return filas.map((p) => {
      const primera = parseJSON(p.imagenes, [])?.[0];
      return {
        id: p.id,
        nombre: p.nombre,
        precio: p.precio_oferta || p.precio,
        imagen: p.imagen_principal || (typeof primera === "string" ? primera : primera?.url) || null,
        // products no tiene columna slug: se arma igual que en el resto del sitio.
        href: buildProductUrl(p.categoria, generateProductSlug(p), p),
      };
    });
  } catch (e) {
    // Si falla, la página del negocio igual debe mostrarse.
    console.error("[fastfoods] productos neurai", e);
    return [];
  }
}

/** Negocios publicados para el directorio de /fastfoods. */
export async function getNegociosPublicados() {
  const filas = await d1Select(
    `SELECT f.id, f.slug, f.nombre, f.descripcion, f.logo_url, f.portada_url, f.ciudad, f.horario, f.tema,
            (SELECT COUNT(*) FROM fastfood_especiales e WHERE e.fastfood_id = f.id AND e.expira_en > ?) AS especiales
     FROM fastfoods f
     WHERE f.estado = 'publicado'
     ORDER BY especiales DESC, f.updated_at DESC`,
    [new Date().toISOString()]
  );
  return filas.map((f) => ({
    ...f,
    horario: parseJSON(f.horario, null),
    tema: normalizarTema(f.tema),
  }));
}
