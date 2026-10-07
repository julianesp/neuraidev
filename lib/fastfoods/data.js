/**
 * Consultas de /fastfoods contra D1 (solo servidor).
 */

import { d1Select, d1SelectOne } from "@/lib/db-d1";
import { buildProductUrl, generateProductSlug } from "@/utils/slugify";
import { ahoraBogota, normalizarTema, parseJSON } from "./utils";
import { fotosDe } from "./acciones";

/** Agrega `fotos` (galería, con la portada primero) a cada fila. */
const conFotos = (filas) => filas.map((f) => ({ ...f, fotos: fotosDe(f) }));

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

/**
 * Solo lo que puede verse en el navegador: la plantilla pasa el negocio a
 * componentes de cliente (carrito) y todo queda serializado en el HTML.
 */
const CAMPOS_PUBLICOS = [
  "id", "slug", "nombre", "descripcion", "logo_url", "portada_url", "whatsapp", "direccion",
  "ciudad", "instagram", "facebook", "tiktok", "horario", "domicilio", "plantilla", "tema",
  "estado", "plan", "sellos_activo", "sellos_meta", "sellos_premio",
];

export function negocioPublico(negocio) {
  const publico = Object.fromEntries(CAMPOS_PUBLICOS.map((k) => [k, negocio[k] ?? null]));
  publico.domicilio = !!negocio.domicilio;
  publico.sellos_activo = !!negocio.sellos_activo && negocio.sellos_meta > 0 && !!negocio.sellos_premio;
  return publico;
}

export async function getMenu(fastfoodId, { soloDisponibles = true } = {}) {
  return conFotos(await d1Select(
    `SELECT id, categoria, nombre, descripcion, precio, foto_url, foto_path, fotos, disponible, tamano, orden
     FROM fastfood_menu
     WHERE fastfood_id = ? ${soloDisponibles ? "AND disponible = 1" : ""}
     ORDER BY orden ASC, created_at ASC`,
    [fastfoodId]
  ));
}

/** Especiales cuyo expira_en aún no pasa (los más recientes primero). */
export async function getEspecialesVigentes(fastfoodId) {
  return conFotos(await d1Select(
    `SELECT id, titulo, descripcion, precio, foto_url, foto_path, fotos, expira_en, porciones, vendidas, created_at
     FROM fastfood_especiales
     WHERE fastfood_id = ? AND expira_en > ?
     ORDER BY created_at DESC`,
    [fastfoodId, new Date().toISOString()]
  ));
}

// Hash FNV-1a + mezcla final (fmix32 de MurmurHash3): orden "al azar" pero
// repetible para una misma clave, y muy distinto aunque la clave cambie poco.
function hash(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * 4 productos baratos de neurai.dev para el bloque sobre el footer
 * (solo en plan gratis). Son compras de impulso: cables, cargadores, soportes.
 * Rotan cada día (fecha de Bogotá) y cada negocio (`semilla`) tiene su propia
 * combinación; durante el mismo día se ven siempre los mismos.
 */
export async function getProductosNeurai(limite = 4, semilla = "") {
  try {
    const candidatos = await d1Select(
      `SELECT id, nombre, precio, precio_oferta, imagen_principal, imagenes, categoria
       FROM products
       WHERE disponible = 1 AND stock > 0 AND precio BETWEEN 5000 AND 80000`
    );
    const dia = ahoraBogota().fecha;
    const filas = candidatos
      .map((p) => ({ p, orden: hash(`${dia}:${semilla}:${p.id}`) }))
      .sort((a, b) => a.orden - b.orden)
      .slice(0, limite)
      .map(({ p }) => p);
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

/**
 * Un plato para su página propia (/fastfoods/<slug>/plato/<id>): del menú
 * (disponible) o un especial. Los especiales vencidos se devuelven con
 * vencido=true para mostrar "ya terminó" en vez de un 404 (los enlaces
 * compartidos se siguen abriendo días después).
 */
export async function getPlato(slug, platoId) {
  const negocio = await getFastfoodPorSlug(slug);
  if (!negocio || negocio.estado !== "publicado") return null;

  const item = await d1SelectOne(
    `SELECT id, nombre, descripcion, precio, foto_url, foto_path, fotos, tamano
     FROM fastfood_menu WHERE id = ? AND fastfood_id = ? AND disponible = 1`,
    [platoId, negocio.id]
  );
  if (item) return { negocio, plato: { ...item, fotos: fotosDe(item), tipo: "menu", quedan: null } };

  const e = await d1SelectOne(
    `SELECT id, titulo AS nombre, descripcion, precio, foto_url, foto_path, fotos, expira_en, porciones, vendidas
     FROM fastfood_especiales WHERE id = ? AND fastfood_id = ?`,
    [platoId, negocio.id]
  );
  if (!e) return null;
  return {
    negocio,
    plato: {
      ...e,
      fotos: fotosDe(e),
      tipo: "especial",
      vencido: e.expira_en <= new Date().toISOString(),
      quedan: e.porciones == null ? null : Math.max(0, e.porciones - (e.vendidas || 0)),
    },
  };
}
