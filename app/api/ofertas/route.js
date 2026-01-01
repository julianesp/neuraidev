import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server-roles";
import {
  obtenerTodasLasOfertas,
  obtenerOfertasActivas,
  crearOferta
} from "@/lib/supabase/ofertas";

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
