import { NextResponse } from "next/server";
import { responderError } from "@/lib/fastfoods/acciones";
import { getEspecialesDeHoy } from "@/lib/fastfoods/pedidos";

export const dynamic = "force-dynamic";

// GET /api/fastfoods/hoy?ciudad=&limite= — especiales vigentes de todos los negocios
// (sección del home de neurai.dev y de la app).
export async function GET(request) {
  try {
    const q = new URL(request.url).searchParams;
    const limite = Math.min(Math.max(Number(q.get("limite")) || 12, 1), 60);
    const especiales = await getEspecialesDeHoy({ ciudad: q.get("ciudad") || null, limite });
    return NextResponse.json(
      { especiales },
      // Cambia poco minuto a minuto: un minuto de caché en el CDN alivia el home.
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (error) {
    return responderError(error, "GET /api/fastfoods/hoy");
  }
}
