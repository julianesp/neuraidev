import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { d1Select, d1SelectOne, d1Execute } from "@/lib/db-d1";
import { isAdminServer } from "@/lib/auth/server-roles";
import {
  ESTADOS,
  PLANES,
  PLANTILLAS,
  horaBogotaAISO,
  normalizarTema,
  parseJSON,
  slugify,
  validarSlug,
} from "@/lib/fastfoods/utils";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await currentUser();
  if (!user || !isAdminServer(user)) return null;
  return user;
}

function noAutorizado() {
  return NextResponse.json({ error: "No autorizado" }, { status: 403 });
}

function precioEntero(valor) {
  const n = Math.round(Number(String(valor ?? "").replace(/[^\d.]/g, "")));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

async function revalidarNegocio(fastfoodId) {
  const n = await d1SelectOne(`SELECT slug FROM fastfoods WHERE id = ?`, [fastfoodId]);
  if (n?.slug) revalidatePath(`/fastfoods/${n.slug}`);
}

/**
 * Arma un UPDATE con los campos de texto permitidos que vengan en el body.
 * Para imágenes (`<campo>_url` + `<campo>_path`) devuelve la ruta vieja de R2
 * en oldPaths, para que el cliente la borre.
 */
function construirSet(body, { texto = [], imagenes = [] }, anterior) {
  const campos = [];
  const params = [];
  const oldPaths = [];
  for (const col of texto) {
    if (typeof body[col] === "string") {
      campos.push(`${col} = ?`);
      params.push(body[col].trim() || null);
    }
  }
  for (const img of imagenes) {
    if (typeof body[`${img}_url`] === "string") {
      campos.push(`${img}_url = ?`, `${img}_path = ?`);
      params.push(body[`${img}_url`] || null, body[`${img}_path`] || null);
      const viejo = anterior?.[`${img}_path`];
      if (viejo && viejo !== body[`${img}_path`]) oldPaths.push(viejo);
    }
  }
  return { campos, params, oldPaths };
}

// GET /api/admin/fastfoods          → lista de negocios
// GET /api/admin/fastfoods?id=<id>  → negocio + menú completo + especiales vigentes
export async function GET(request) {
  try {
    if (!(await requireAdmin())) return noAutorizado();

    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      const negocios = await d1Select(
        `SELECT id, slug, nombre, logo_url, estado, plan, plan_vence_en, created_at
         FROM fastfoods ORDER BY created_at DESC`
      );
      return NextResponse.json({ negocios });
    }

    const negocio = await d1SelectOne(`SELECT * FROM fastfoods WHERE id = ?`, [id]);
    if (!negocio) return NextResponse.json({ error: "No existe" }, { status: 404 });

    const [menu, especiales] = await Promise.all([
      d1Select(
        `SELECT * FROM fastfood_menu WHERE fastfood_id = ? ORDER BY orden ASC, created_at ASC`,
        [id]
      ),
      d1Select(
        `SELECT * FROM fastfood_especiales WHERE fastfood_id = ? AND expira_en > ?
         ORDER BY created_at DESC`,
        [id, new Date().toISOString()]
      ),
    ]);

    return NextResponse.json({
      negocio: {
        ...negocio,
        domicilio: !!negocio.domicilio,
        horario: parseJSON(negocio.horario, {}),
        tema: normalizarTema(negocio.tema),
      },
      menu,
      especiales,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/fastfoods:", error);
    return NextResponse.json({ error: "Error al obtener los datos" }, { status: 500 });
  }
}

// POST /api/admin/fastfoods — según body.accion:
//   'crear_negocio'   { nombre, slug? }
//   'crear_item'      { fastfood_id, nombre, precio, categoria?, descripcion? }
//   'crear_especial'  { fastfood_id, titulo, hasta: "HH:MM", precio?, descripcion?, foto_url?, foto_path? }
export async function POST(request) {
  try {
    if (!(await requireAdmin())) return noAutorizado();

    const body = await request.json();
    const ahora = new Date().toISOString();

    if (body.accion === "crear_negocio") {
      const nombre = (body.nombre || "").trim();
      if (!nombre) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
      const slug = slugify(body.slug || nombre);
      const errorSlug = validarSlug(slug);
      if (errorSlug) return NextResponse.json({ error: errorSlug }, { status: 400 });
      const existe = await d1SelectOne(`SELECT id FROM fastfoods WHERE slug = ?`, [slug]);
      if (existe) {
        return NextResponse.json({ error: `El enlace /fastfoods/${slug} ya está en uso` }, { status: 409 });
      }
      const id = crypto.randomUUID();
      await d1Execute(
        `INSERT INTO fastfoods (id, slug, nombre, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
        [id, slug, nombre, ahora, ahora]
      );
      return NextResponse.json({ success: true, id, slug });
    }

    if (body.accion === "crear_item") {
      const nombre = (body.nombre || "").trim();
      if (!body.fastfood_id || !nombre) {
        return NextResponse.json({ error: "Negocio y nombre son requeridos" }, { status: 400 });
      }
      const maxOrden = await d1SelectOne(
        `SELECT COALESCE(MAX(orden), 0) AS m FROM fastfood_menu WHERE fastfood_id = ?`,
        [body.fastfood_id]
      );
      const id = crypto.randomUUID();
      await d1Execute(
        `INSERT INTO fastfood_menu
           (id, fastfood_id, categoria, nombre, descripcion, precio, disponible, orden, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          id,
          body.fastfood_id,
          (body.categoria || "").trim() || null,
          nombre,
          (body.descripcion || "").trim() || null,
          precioEntero(body.precio),
          (maxOrden?.m || 0) + 1,
          ahora,
        ]
      );
      await revalidarNegocio(body.fastfood_id);
      return NextResponse.json({ success: true, id });
    }

    if (body.accion === "crear_especial") {
      const titulo = (body.titulo || "").trim();
      const expira = horaBogotaAISO(body.hasta);
      if (!body.fastfood_id || !titulo || !expira) {
        return NextResponse.json(
          { error: "Título y hora de fin (HH:MM) son requeridos" },
          { status: 400 }
        );
      }
      const id = crypto.randomUUID();
      await d1Execute(
        `INSERT INTO fastfood_especiales
           (id, fastfood_id, titulo, descripcion, precio, foto_url, foto_path, expira_en, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.fastfood_id,
          titulo,
          (body.descripcion || "").trim() || null,
          body.precio ? precioEntero(body.precio) : null,
          body.foto_url || null,
          body.foto_path || null,
          expira,
          ahora,
        ]
      );
      await revalidarNegocio(body.fastfood_id);
      return NextResponse.json({ success: true, id, expira_en: expira });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error en POST /api/admin/fastfoods:", error);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

// PATCH /api/admin/fastfoods — según body.tipo:
//   'negocio' { id, ...campos }  (horario y tema como objetos)
//   'item'    { id, ...campos }
// Devuelve storage_paths con las imágenes reemplazadas, para limpiar R2.
export async function PATCH(request) {
  try {
    if (!(await requireAdmin())) return noAutorizado();

    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (body.tipo === "negocio") {
      const anterior = await d1SelectOne(
        `SELECT slug, logo_path, portada_path FROM fastfoods WHERE id = ?`,
        [body.id]
      );
      if (!anterior) return NextResponse.json({ error: "No existe" }, { status: 404 });

      const { campos, params, oldPaths } = construirSet(
        body,
        {
          texto: [
            "nombre", "descripcion", "whatsapp", "direccion", "ciudad",
            "instagram", "facebook", "tiktok", "plan_vence_en",
          ],
          imagenes: ["logo", "portada"],
        },
        anterior
      );

      if (typeof body.slug === "string" && body.slug !== anterior.slug) {
        const slug = slugify(body.slug);
        const errorSlug = validarSlug(slug);
        if (errorSlug) return NextResponse.json({ error: errorSlug }, { status: 400 });
        const existe = await d1SelectOne(
          `SELECT id FROM fastfoods WHERE slug = ? AND id != ?`,
          [slug, body.id]
        );
        if (existe) return NextResponse.json({ error: "Ese enlace ya está en uso" }, { status: 409 });
        campos.push("slug = ?");
        params.push(slug);
      }
      if (typeof body.domicilio !== "undefined") {
        campos.push("domicilio = ?");
        params.push(body.domicilio ? 1 : 0);
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
      if (body.horario && typeof body.horario === "object") {
        campos.push("horario = ?");
        params.push(JSON.stringify(body.horario));
      }
      if (body.tema && typeof body.tema === "object") {
        campos.push("tema = ?");
        params.push(JSON.stringify(normalizarTema(body.tema)));
      }

      if (campos.length === 0) return NextResponse.json({ error: "No hay cambios" }, { status: 400 });
      campos.push("updated_at = ?");
      params.push(new Date().toISOString(), body.id);
      await d1Execute(`UPDATE fastfoods SET ${campos.join(", ")} WHERE id = ?`, params);

      revalidatePath(`/fastfoods/${anterior.slug}`);
      await revalidarNegocio(body.id);
      return NextResponse.json({ success: true, storage_paths: oldPaths });
    }

    if (body.tipo === "item") {
      const anterior = await d1SelectOne(
        `SELECT fastfood_id, foto_path FROM fastfood_menu WHERE id = ?`,
        [body.id]
      );
      if (!anterior) return NextResponse.json({ error: "No existe" }, { status: 404 });

      const { campos, params, oldPaths } = construirSet(
        body,
        { texto: ["categoria", "nombre", "descripcion"], imagenes: ["foto"] },
        anterior
      );
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

      if (campos.length === 0) return NextResponse.json({ error: "No hay cambios" }, { status: 400 });
      params.push(body.id);
      await d1Execute(`UPDATE fastfood_menu SET ${campos.join(", ")} WHERE id = ?`, params);
      await revalidarNegocio(anterior.fastfood_id);
      return NextResponse.json({ success: true, storage_paths: oldPaths });
    }

    return NextResponse.json({ error: "Tipo no reconocido" }, { status: 400 });
  } catch (error) {
    console.error("Error en PATCH /api/admin/fastfoods:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE /api/admin/fastfoods?item=<id> | ?especial=<id> | ?negocio=<id>
// Devuelve storage_paths para que el cliente limpie R2.
export async function DELETE(request) {
  try {
    if (!(await requireAdmin())) return noAutorizado();

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("item");
    const especialId = searchParams.get("especial");
    const negocioId = searchParams.get("negocio");

    if (itemId || especialId) {
      const tabla = itemId ? "fastfood_menu" : "fastfood_especiales";
      const id = itemId || especialId;
      const fila = await d1SelectOne(
        `SELECT fastfood_id, foto_path FROM ${tabla} WHERE id = ?`,
        [id]
      );
      if (!fila) return NextResponse.json({ success: true, storage_paths: [] });
      await d1Execute(`DELETE FROM ${tabla} WHERE id = ?`, [id]);
      await revalidarNegocio(fila.fastfood_id);
      return NextResponse.json({
        success: true,
        storage_paths: fila.foto_path ? [fila.foto_path] : [],
      });
    }

    if (negocioId) {
      const negocio = await d1SelectOne(
        `SELECT slug, logo_path, portada_path FROM fastfoods WHERE id = ?`,
        [negocioId]
      );
      if (!negocio) return NextResponse.json({ success: true, storage_paths: [] });
      const fotos = await d1Select(
        `SELECT foto_path FROM fastfood_menu WHERE fastfood_id = ? AND foto_path IS NOT NULL
         UNION ALL
         SELECT foto_path FROM fastfood_especiales WHERE fastfood_id = ? AND foto_path IS NOT NULL`,
        [negocioId, negocioId]
      );
      await d1Execute(`DELETE FROM fastfood_menu WHERE fastfood_id = ?`, [negocioId]);
      await d1Execute(`DELETE FROM fastfood_especiales WHERE fastfood_id = ?`, [negocioId]);
      await d1Execute(`DELETE FROM fastfoods WHERE id = ?`, [negocioId]);
      revalidatePath(`/fastfoods/${negocio.slug}`);
      const paths = fotos.map((f) => f.foto_path);
      if (negocio.logo_path) paths.push(negocio.logo_path);
      if (negocio.portada_path) paths.push(negocio.portada_path);
      return NextResponse.json({ success: true, storage_paths: paths });
    }

    return NextResponse.json({ error: "Falta ?item=, ?especial= o ?negocio=" }, { status: 400 });
  } catch (error) {
    console.error("Error en DELETE /api/admin/fastfoods:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
