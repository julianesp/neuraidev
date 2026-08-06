import { NextResponse } from "next/server";
import { getCategoriesWithStock } from "@/utils/categoriesWithStock";

export const dynamic = "force-dynamic";

// GET /api/categorias/stock — devuelve las categorías que tienen al menos un
// producto disponible con stock. Usado por componentes cliente (NavBar, Home)
// para no mostrar categorías vacías.
export async function GET() {
  try {
    const categorias = await getCategoriesWithStock();
    return NextResponse.json({ success: true, categorias: [...categorias] });
  } catch (error) {
    console.error("[GET /api/categorias/stock]", error);
    return NextResponse.json(
      { success: false, categorias: [] },
      { status: 500 },
    );
  }
}
