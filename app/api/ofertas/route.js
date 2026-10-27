import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server-roles";
import { getSupabaseServerClient } from "@/lib/db";
import { parseIds } from "@/lib/precios";

// D1 guarda productos_ids como texto JSON y activa como 0/1.
const normalizar = (o) => ({
  ...o,
  productos_ids: parseIds(o.productos_ids),
  activa: o.activa === 1 || o.activa === true,
});

async function obtenerTodasLasOfertas() {
  const db = getSupabaseServerClient();
  const { data } = await db.from('ofertas').select('*').order('created_at', { ascending: false });
  return (data || []).map(normalizar);
}

// Devuelve solo las ofertas VIGENTES para el público: además del flag
// `activa`, deben estar dentro de su rango de fechas (fecha_inicio <= ahora <=
// fecha_fin). Es el mismo criterio `esVigente` que usa el panel admin, de modo
// que una oferta marcada "Inactiva"/"Expirada"/"Futura" ahí no se muestre en el
// storefront. Las fechas se guardan en ISO UTC, comparables lexicográficamente.
async function obtenerOfertasActivas() {
  const db = getSupabaseServerClient();
  const ahora = new Date().toISOString();
  const { data } = await db
    .from('ofertas')
    .select('*')
    .eq('activa', true)
    .lte('fecha_inicio', ahora)
    .gte('fecha_fin', ahora)
    .order('created_at', { ascending: false });
  return (data || []).map(normalizar);
}

async function crearOferta(ofertaData) {
  const db = getSupabaseServerClient();
  const ahora = new Date().toISOString();
  const { data } = await db
    .from('ofertas')
    .insert({
      id: crypto.randomUUID(),
      nombre: ofertaData.nombre,
      descripcion: ofertaData.descripcion || null,
      porcentaje_descuento: Number(ofertaData.porcentaje_descuento),
      productos_ids: ofertaData.productos_ids,
      fecha_inicio: new Date(ofertaData.fecha_inicio).toISOString(),
      fecha_fin: new Date(ofertaData.fecha_fin).toISOString(),
      activa: ofertaData.activa !== false,
      tipo_oferta: ofertaData.tipo_oferta || 'individual',
      created_at: ahora,
      updated_at: ahora,
    })
    .select()
    .single();
  return data ? normalizar(data) : data;
}

/**
 * GET /api/ofertas
 * Obtiene todas las ofertas (admin) u ofertas activas (público)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const soloActivas = searchParams.get("activas") === "true";

    // Verificar si es admin
    const { isAdmin } = await getCurrentUserWithRole();

    let ofertas;

    if (soloActivas || !isAdmin) {
      // Usuarios normales solo ven ofertas activas
      ofertas = await obtenerOfertasActivas();
    } else {
      // Admin ve todas las ofertas
      ofertas = await obtenerTodasLasOfertas();
    }

    return NextResponse.json({ ofertas }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/ofertas:", error);
    return NextResponse.json(
      { error: "Error obteniendo ofertas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ofertas
 * Crea una nueva oferta (solo admin)
 */
export async function POST(request) {
  try {
    // Verificar que sea admin
    const { isAdmin } = await getCurrentUserWithRole();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validaciones
    if (!body.nombre || !body.porcentaje_descuento) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (body.porcentaje_descuento < 1 || body.porcentaje_descuento > 100) {
      return NextResponse.json(
        { error: "El porcentaje debe estar entre 1 y 100" },
        { status: 400 }
      );
    }

    if (!body.productos_ids || body.productos_ids.length === 0) {
      return NextResponse.json(
        { error: "Debes seleccionar al menos un producto" },
        { status: 400 }
      );
    }

    if (!body.fecha_inicio || !body.fecha_fin) {
      return NextResponse.json(
        { error: "Debes especificar fechas de inicio y fin" },
        { status: 400 }
      );
    }

    if (new Date(body.fecha_fin) <= new Date(body.fecha_inicio)) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
        { status: 400 }
      );
    }

    const oferta = await crearOferta(body);

    return NextResponse.json(
      { message: "Oferta creada exitosamente", oferta },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/ofertas:", error);
    return NextResponse.json(
      { error: error.message || "Error creando oferta" },
      { status: 500 }
    );
  }
}
