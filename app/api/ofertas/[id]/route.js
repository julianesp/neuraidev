import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server-roles";
import {
  actualizarOferta,
  eliminarOferta
} from "@/lib/supabase/ofertas";

/**
 * PUT /api/ofertas/[id]
 * Actualiza una oferta existente (solo admin)
 */
export async function PUT(request, { params }) {
  try {
    // Verificar que sea admin
    const { isAdmin } = await getCurrentUserWithRole();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Validaciones opcionales (solo si vienen en el body)
    if (body.porcentaje_descuento && (body.porcentaje_descuento < 1 || body.porcentaje_descuento > 100)) {
      return NextResponse.json(
        { error: "El porcentaje debe estar entre 1 y 100" },
        { status: 400 }
      );
    }

    if (body.productos_ids && body.productos_ids.length === 0) {
      return NextResponse.json(
        { error: "Debes seleccionar al menos un producto" },
        { status: 400 }
      );
    }

    if (body.fecha_inicio && body.fecha_fin) {
      if (new Date(body.fecha_fin) <= new Date(body.fecha_inicio)) {
        return NextResponse.json(
          { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
          { status: 400 }
        );
      }
    }

    const oferta = await actualizarOferta(id, body);

    return NextResponse.json(
      { message: "Oferta actualizada exitosamente", oferta },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en PUT /api/ofertas/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Error actualizando oferta" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ofertas/[id]
 * Elimina una oferta (solo admin)
 */
export async function DELETE(request, { params }) {
  try {
    // Verificar que sea admin
    const { isAdmin } = await getCurrentUserWithRole();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { id } = params;

    await eliminarOferta(id);

    return NextResponse.json(
      { message: "Oferta eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en DELETE /api/ofertas/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Error eliminando oferta" },
      { status: 500 }
    );
  }
}
