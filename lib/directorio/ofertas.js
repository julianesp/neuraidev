import { d1Execute, d1Select, d1SelectOne } from "@/lib/db-d1";
import { ErrorDirectorio, parsearFotos } from "./negocios";
import { OFERTA_MAX_DIAS, limiteOfertas, limiteFotos } from "./planes";

/** Hoy en hora de Colombia, formato YYYY-MM-DD. */
export const hoyColombia = (fecha = new Date()) =>
  fecha.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

const sumarDias = (yyyyMmDd, dias) => {
  const d = new Date(`${yyyyMmDd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

/** "2026-11-14" → "viernes 14 de noviembre" */
export function formatearVence(vence) {
  return new Date(`${vence}T12:00:00Z`).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** Valida los datos de una oferta. Lanza ErrorDirectorio. */
export function validarOferta(body) {
  const titulo = String(body.titulo ?? "").trim().slice(0, 80);
  if (titulo.length < 3) throw new ErrorDirectorio("Escribe el título de la oferta (mínimo 3 letras).");

  const hoy = hoyColombia();
  const vence = String(body.vence ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vence) || Number.isNaN(new Date(`${vence}T12:00:00Z`).getTime())) {
    throw new ErrorDirectorio("Elige hasta qué día vale la oferta.");
  }
  if (vence < hoy) throw new ErrorDirectorio("La fecha de la oferta ya pasó.");
  if (vence > sumarDias(hoy, OFERTA_MAX_DIAS)) {
    throw new ErrorDirectorio(`Una oferta puede durar máximo ${OFERTA_MAX_DIAS} días.`);
  }

  const base = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;
  let imagen = String(body.imagen_url ?? "").trim().slice(0, 500);
  if (imagen && (!/^https:\/\//i.test(imagen) || (base && !imagen.startsWith(base)))) imagen = "";

  return {
    titulo,
    descripcion: String(body.descripcion ?? "").trim().slice(0, 300),
    imagen_url: imagen,
    vence,
  };
}

/** Crea una oferta respetando el límite del plan del negocio. */
export async function crearOferta(negocio, datos) {
  const { n } = (await d1SelectOne(
    "SELECT COUNT(*) AS n FROM directorio_ofertas WHERE negocio_id = ? AND vence >= ?",
    [negocio.id, hoyColombia()]
  )) || { n: 0 };
  const limite = limiteOfertas(negocio.plan_hasta);
  if (n >= limite) {
    throw new ErrorDirectorio(
      limite === 1
        ? "Con el plan gratis puedes tener 1 oferta vigente. Quita la actual o activa el plan para tener hasta 3."
        : `Ya tienes ${limite} ofertas vigentes. Quita una para publicar otra.`
    );
  }
  const id = crypto.randomUUID();
  await d1Execute(
    `INSERT INTO directorio_ofertas (id, negocio_id, titulo, descripcion, imagen_url, vence, created_at)
     VALUES (?,?,?,?,?,?,?)`,
    [id, negocio.id, datos.titulo, datos.descripcion, datos.imagen_url, datos.vence, new Date().toISOString()]
  );
  return id;
}

/** Ofertas vigentes de varios negocios: { [negocioId]: [oferta, ...] } (más próxima a vencer primero). */
export async function ofertasPorNegocios(ids) {
  const resultado = {};
  if (!ids.length) return resultado;
  const filas = await d1Select(
    `SELECT id, negocio_id, titulo, descripcion, imagen_url, vence FROM directorio_ofertas
      WHERE negocio_id IN (${ids.map(() => "?").join(", ")}) AND vence >= ?
      ORDER BY vence ASC, created_at DESC`,
    [...ids, hoyColombia()]
  );
  for (const f of filas) (resultado[f.negocio_id] ||= []).push(f);
  return resultado;
}

/** Ofertas vigentes de todo el directorio (solo de negocios publicados) para la fila "Ofertas de hoy". */
export async function ofertasVigentes(limite = 20) {
  const filas = await d1Select(
    `SELECT o.id, o.titulo, o.descripcion, o.imagen_url, o.vence,
            n.slug, n.nombre, n.municipio, n.categoria, n.logo_url, n.fotos, n.plan_hasta
       FROM directorio_ofertas o
       JOIN directorio_negocios n ON n.id = o.negocio_id
      WHERE n.estado = 'aprobado' AND o.vence >= ?
      ORDER BY o.created_at DESC
      LIMIT ?`,
    [hoyColombia(), limite]
  );
  return filas.map(({ fotos, plan_hasta, ...resto }) => ({
    ...resto,
    portada: resto.imagen_url || parsearFotos(fotos).slice(0, limiteFotos(plan_hasta))[0] || resto.logo_url || "",
  }));
}
