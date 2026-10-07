import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { d1Select } from "@/lib/db-d1";
import { isAdminServer } from "@/lib/auth/server-roles";
import {
  ErrorFastfood,
  actualizarItem,
  actualizarNegocio,
  crearEspecial,
  crearItem,
  crearNegocio,
  eliminarItemOEspecial,
  eliminarNegocio,
  getDetalleNegocio,
  responderError,
  actualizarEspecial,
} from "@/lib/fastfoods/acciones";
import {
  cambiarEstadoPedido,
  canjearPremio,
  listarClientes,
  listarPedidos,
} from "@/lib/fastfoods/pedidos";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await currentUser();
  if (!user || !isAdminServer(user)) throw new ErrorFastfood(403, "No autorizado");
}

// GET /api/admin/fastfoods          → lista de negocios
// GET /api/admin/fastfoods?id=<id>  → negocio + menú completo + especiales vigentes
// GET /api/admin/fastfoods?id=<id>&pedidos=1 | &clientes=1
export async function GET(request) {
  try {
    await requireAdmin();
    const q = new URL(request.url).searchParams;
    const id = q.get("id");
    if (id && q.get("pedidos")) return NextResponse.json({ pedidos: await listarPedidos(id) });
    if (id && q.get("clientes")) return NextResponse.json({ clientes: await listarClientes(id) });
    if (id) return NextResponse.json(await getDetalleNegocio(id));

    const negocios = await d1Select(
      `SELECT id, slug, nombre, logo_url, estado, plan, plan_vence_en, owner_clerk_id, owner_email, created_at
       FROM fastfoods ORDER BY created_at DESC`
    );
    return NextResponse.json({ negocios });
  } catch (error) {
    return responderError(error, "GET /api/admin/fastfoods");
  }
}

// POST /api/admin/fastfoods — según body.accion:
//   'crear_negocio'   { nombre, slug?, owner_email? }
//   'crear_item'      { fastfood_id, nombre, precio, categoria?, descripcion? }
//   'crear_especial'  { fastfood_id, titulo, hasta: "HH:MM", precio?, descripcion?, foto_path? }
export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();

    if (body.accion === "crear_negocio") {
      const creado = await crearNegocio({
        nombre: body.nombre,
        slug: body.slug,
        ownerEmail: body.owner_email,
      });
      return NextResponse.json({ success: true, ...creado });
    }
    if (!body.fastfood_id) throw new ErrorFastfood(400, "fastfood_id requerido");
    if (body.accion === "crear_item") {
      return NextResponse.json({ success: true, ...(await crearItem(body.fastfood_id, body)) });
    }
    if (body.accion === "crear_especial") {
      return NextResponse.json({ success: true, ...(await crearEspecial(body.fastfood_id, body)) });
    }
    if (body.accion === "canjear") {
      await canjearPremio(body.fastfood_id, body.telefono);
      return NextResponse.json({ success: true });
    }
    throw new ErrorFastfood(400, "Acción no reconocida");
  } catch (error) {
    return responderError(error, "POST /api/admin/fastfoods");
  }
}

// PATCH /api/admin/fastfoods — según body.tipo:
//   'negocio' { id, ...campos }   (horario y tema como objetos; imágenes por *_path)
//   'item'    { fastfood_id, id, ...campos }
export async function PATCH(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    if (!body.id) throw new ErrorFastfood(400, "ID requerido");

    if (body.tipo === "negocio") {
      await actualizarNegocio(body.id, body, { admin: true });
    } else if (body.tipo === "item") {
      await actualizarItem(body.fastfood_id, body.id, body);
    } else if (body.tipo === "pedido") {
      await cambiarEstadoPedido(body.fastfood_id, body.id, body.estado);
    } else if (body.tipo === "especial") {
      await actualizarEspecial(body.fastfood_id, body.id, body);
    } else {
      throw new ErrorFastfood(400, "Tipo no reconocido");
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return responderError(error, "PATCH /api/admin/fastfoods");
  }
}

// DELETE /api/admin/fastfoods?fastfood_id=<id>&item=<id> | &especial=<id>
// DELETE /api/admin/fastfoods?negocio=<id>
export async function DELETE(request) {
  try {
    await requireAdmin();
    const q = new URL(request.url).searchParams;

    if (q.get("negocio")) {
      await eliminarNegocio(q.get("negocio"));
    } else if (q.get("item") || q.get("especial")) {
      await eliminarItemOEspecial(q.get("fastfood_id"), {
        item: q.get("item"),
        especial: q.get("especial"),
      });
    } else {
      throw new ErrorFastfood(400, "Falta ?item=, ?especial= o ?negocio=");
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return responderError(error, "DELETE /api/admin/fastfoods");
  }
}
