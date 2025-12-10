import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/perfil/favoritos
 * Obtiene todos los favoritos del usuario actual con información del producto
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Obtener favoritos
    const { data: favoritos, error: favError } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false });

    if (favError) {
      console.error("Error al obtener favoritos:", favError);
      return NextResponse.json(
        { error: "Error al obtener favoritos" },
        { status: 500 },
      );
    }

    if (!favoritos || favoritos.length === 0) {
      return NextResponse.json([]);
    }

    // Obtener información de los productos
    const productIds = favoritos.map((f) => f.producto_id);

    const { data: productos, error: prodError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (prodError) {
      console.error("❌ Error al obtener productos:", prodError);
      // Devolver favoritos sin información de productos
      return NextResponse.json(favoritos);
    }

    // Combinar favoritos con información de productos
    const favoritosConProductos = favoritos.map((fav) => ({
      ...fav,
      producto: productos.find((p) => p.id === fav.producto_id) || null,
    }));

    return NextResponse.json(favoritosConProductos);
  } catch (error) {
    console.error("Error en GET /api/perfil/favoritos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/perfil/favoritos
 * Agrega un producto a favoritos
 */
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { producto_id, precio } = body;

    if (!producto_id) {
      return NextResponse.json(
        { error: "Falta el ID del producto" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseClient();

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("clerk_user_id", userId)
      .eq("producto_id", producto_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "El producto ya está en favoritos" },
        { status: 400 },
      );
    }

    // Agregar a favoritos
    const { data, error } = await supabase
      .from("user_favorites")
      .insert({
        clerk_user_id: userId,
        producto_id,
        precio_al_agregar: precio,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al agregar favorito:", error);
      return NextResponse.json(
        { error: "Error al agregar favorito" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/perfil/favoritos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
