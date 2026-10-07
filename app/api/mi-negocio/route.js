import { NextResponse, after } from "next/server";
import {
  ErrorFastfood,
  actualizarItem,
  actualizarNegocio,
  crearEspecial,
  crearItem,
  crearNegocio,
  eliminarItemOEspecial,
  getDetalleNegocio,
  responderError,
  validarSlugDisponible,
} from "@/lib/fastfoods/acciones";
import { getDuenoYNegocio, requireNegocioDelDueno } from "@/lib/fastfoods/dueno";
import { notifyNewFastfood } from "@/lib/notificationService";
import {
  actualizarPorciones,
  cambiarEstadoPedido,
  canjearPremio,
  listarClientes,
  listarPedidos,
} from "@/lib/fastfoods/pedidos";

export const dynamic = "force-dynamic";

/*
 * Panel del dueño (/mi-negocio). Siempre actúa sobre el negocio de la cuenta
 * con sesión: el fastfood_id que mande el cliente se ignora. No puede tocar
 * enlace, plantilla, estado ni plan (eso es del admin).
 */

// GET /api/mi-negocio             → { negocio, menu, especiales } o { negocio: null }
// GET /api/mi-negocio?pedidos=1   → { pedidos } abiertos + cerrados de las últimas 24 h
// GET /api/mi-negocio?clientes=1  → { clientes } con pedidos entregados y sellos
// GET /api/mi-negocio?slug=<x>    → { disponible, slug, error? } para el formulario de registro
export async function GET(request) {
  try {
    const slug = new URL(request.url).searchParams.get("slug");
    if (slug !== null) {
      try {
        return NextResponse.json({ disponible: true, slug: await validarSlugDisponible(slug) });
      } catch (error) {
        if (error instanceof ErrorFastfood) {
          return NextResponse.json({ disponible: false, error: error.message });
        }
        throw error;
      }
    }

    const { negocio, correo } = await getDuenoYNegocio();
    if (!negocio) return NextResponse.json({ negocio: null, correo });
    const q = new URL(request.url).searchParams;
    if (q.get("pedidos")) return NextResponse.json({ pedidos: await listarPedidos(negocio.id) });
    if (q.get("clientes")) return NextResponse.json({ clientes: await listarClientes(negocio.id) });
    return NextResponse.json(await getDetalleNegocio(negocio.id));
  } catch (error) {
    return responderError(error, "GET /api/mi-negocio");
  }
}

// POST /api/mi-negocio — según body.accion:
//   'crear_negocio'   { nombre, slug, whatsapp, ciudad? }  → queda publicado de una vez
//   'crear_item'      { nombre, precio, categoria?, descripcion? }
//   'crear_especial'  { titulo, hasta: "HH:MM", precio?, descripcion?, foto_path?, porciones? }
//   'canjear'         { telefono }  → entrega el premio de la tarjeta de sellos
export async function POST(request) {
  try {
    const body = await request.json();

    if (body.accion === "crear_negocio") {
      const { user, negocio, correo } = await getDuenoYNegocio();
      if (negocio) throw new ErrorFastfood(409, "Tu cuenta ya tiene un negocio");
      if (!(body.whatsapp || "").replace(/\D/g, "")) {
        throw new ErrorFastfood(400, "El WhatsApp es necesario para recibir los pedidos");
      }
      const creado = await crearNegocio({
        nombre: body.nombre,
        slug: body.slug,
        whatsapp: body.whatsapp,
        ciudad: body.ciudad,
        ownerClerkId: user.id,
        ownerEmail: correo,
        estado: "publicado",
      });
      after(() =>
        notifyNewFastfood({
          nombre: body.nombre,
          slug: creado.slug,
          ciudad: body.ciudad,
          whatsapp: body.whatsapp,
          correo,
        })
      );
      return NextResponse.json({ success: true, ...creado });
    }

    const { negocio } = await requireNegocioDelDueno();
    if (body.accion === "crear_item") {
      return NextResponse.json({ success: true, ...(await crearItem(negocio.id, body)) });
    }
    if (body.accion === "crear_especial") {
      return NextResponse.json({ success: true, ...(await crearEspecial(negocio.id, body)) });
    }
    if (body.accion === "canjear") {
      await canjearPremio(negocio.id, body.telefono);
      return NextResponse.json({ success: true });
    }
    throw new ErrorFastfood(400, "Acción no reconocida");
  } catch (error) {
    // El índice único de owner_clerk_id frena una doble creación simultánea.
    if (String(error?.message).includes("UNIQUE constraint failed: fastfoods.owner_clerk_id")) {
      return NextResponse.json({ error: "Tu cuenta ya tiene un negocio" }, { status: 409 });
    }
    return responderError(error, "POST /api/mi-negocio");
  }
}

// PATCH /api/mi-negocio — según body.tipo:
//   'negocio' { ...campos }       (sin enlace, plantilla, estado ni plan)
//   'item'    { id, ...campos }
//   'pedido'  { id, estado }
//   'especial' { id, porciones }   (null = sin límite)
export async function PATCH(request) {
  try {
    const { negocio } = await requireNegocioDelDueno();
    const body = await request.json();

    if (body.tipo === "negocio") {
      await actualizarNegocio(negocio.id, body, { admin: false });
    } else if (body.tipo === "item") {
      if (!body.id) throw new ErrorFastfood(400, "ID requerido");
      await actualizarItem(negocio.id, body.id, body);
    } else if (body.tipo === "pedido") {
      await cambiarEstadoPedido(negocio.id, body.id, body.estado);
    } else if (body.tipo === "especial") {
      await actualizarPorciones(negocio.id, body.id, body.porciones);
    } else {
      throw new ErrorFastfood(400, "Tipo no reconocido");
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return responderError(error, "PATCH /api/mi-negocio");
  }
}

// DELETE /api/mi-negocio?item=<id> | ?especial=<id>
export async function DELETE(request) {
  try {
    const { negocio } = await requireNegocioDelDueno();
    const q = new URL(request.url).searchParams;
    if (!q.get("item") && !q.get("especial")) throw new ErrorFastfood(400, "Falta ?item= o ?especial=");
    await eliminarItemOEspecial(negocio.id, { item: q.get("item"), especial: q.get("especial") });
    return NextResponse.json({ success: true });
  } catch (error) {
    return responderError(error, "DELETE /api/mi-negocio");
  }
}
