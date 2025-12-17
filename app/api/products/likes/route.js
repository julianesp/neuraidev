import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/products/likes?productoId=xxx
 * Obtener información de likes de un producto
 * Retorna: { totalLikes, userHasLiked }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productoId = searchParams.get("productoId");

    if (!productoId) {
      return NextResponse.json(
        { error: "productoId es requerido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const user = await currentUser();

    // Obtener total de likes del producto
    const { count: totalLikes, error: countError } = await supabase
      .from('product_likes')
      .select('id', { count: 'exact', head: true })
      .eq('producto_id', productoId);

    if (countError) {
      console.error("Error contando likes:", countError);
      return NextResponse.json(
        { error: "Error al obtener likes" },
        { status: 500 }
      );
    }

    // Si hay usuario autenticado, verificar si dio like
    let userHasLiked = false;
    if (user) {
      const { data: userLike, error: likeError } = await supabase
        .from('product_likes')
        .select('id')
        .eq('producto_id', productoId)
        .eq('user_id', user.id)
        .single();

      if (!likeError && userLike) {
        userHasLiked = true;
      }
    }

    return NextResponse.json({
      totalLikes: totalLikes || 0,
      userHasLiked,
    });

  } catch (error) {
    console.error("Error en GET /api/products/likes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/likes
 * Dar like a un producto (toggle: si ya dio like, lo quita)
 * Body: { productoId }
 */
export async function POST(request) {
  try {
    // Verificar autenticación
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para dar like" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productoId } = body;

    if (!productoId) {
      return NextResponse.json(
        { error: "productoId es requerido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verificar que el producto existe
    const { data: producto, error: productoError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productoId)
      .single();

    if (productoError || !producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el usuario ya dio like
    const { data: existingLike, error: checkError } = await supabase
      .from('product_likes')
      .select('id')
      .eq('producto_id', productoId)
      .eq('user_id', user.id)
      .single();

    // Si ya dio like, quitarlo (toggle)
    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('product_likes')
        .delete()
        .eq('producto_id', productoId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error("Error quitando like:", deleteError);
        return NextResponse.json(
          { error: "Error al quitar el like" },
          { status: 500 }
        );
      }

      // Obtener nuevo total
      const { count: totalLikes } = await supabase
        .from('product_likes')
        .select('id', { count: 'exact', head: true })
        .eq('producto_id', productoId);

      return NextResponse.json({
        success: true,
        action: "removed",
        userHasLiked: false,
        totalLikes: totalLikes || 0,
      });
    }

    // Si no ha dado like, agregarlo
    const { error: insertError } = await supabase
      .from('product_likes')
      .insert([
        {
          producto_id: productoId,
          user_id: user.id,
        }
      ]);

    if (insertError) {
      console.error("Error insertando like:", insertError);
      return NextResponse.json(
        { error: "Error al dar like" },
        { status: 500 }
      );
    }

    // Obtener nuevo total
    const { count: totalLikes } = await supabase
      .from('product_likes')
      .select('id', { count: 'exact', head: true })
      .eq('producto_id', productoId);

    return NextResponse.json({
      success: true,
      action: "added",
      userHasLiked: true,
      totalLikes: totalLikes || 0,
    }, { status: 201 });

  } catch (error) {
    console.error("Error en POST /api/products/likes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
