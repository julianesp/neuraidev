import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server-roles";
import { obtenerEstadisticasOfertas } from "@/lib/supabase/ofertas";

/**
 * GET /api/ofertas/estadisticas
 * Obtiene estadísticas de ofertas (solo admin)
 */
export async function GET() {
  try {
    // Verificar que sea admin
    const { isAdmin } = await getCurrentUserWithRole();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const estadisticas = await obtenerEstadisticasOfertas();

    return NextResponse.json(estadisticas, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/ofertas/estadisticas:", error);
    return NextResponse.json(
      { error: "Error obteniendo estadísticas" },
      { status: 500 }
    );
  }
}
