import { NextResponse } from "next/server";
import { listarPublicos } from "@/lib/directorio/negocios";

export const dynamic = "force-dynamic";

// GET /api/directorio?q=&municipio=&categoria=&pagina=  (público)
export async function GET(request) {
  try {
    const p = new URL(request.url).searchParams;
    const data = await listarPublicos({
      q: p.get("q"),
      municipio: p.get("municipio"),
      categoria: p.get("categoria"),
      pagina: p.get("pagina"),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en GET /api/directorio:", error);
    return NextResponse.json({ negocios: [], total: 0, pagina: 1, paginas: 1 });
  }
}
