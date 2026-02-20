import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/blog/posts/[id]
 * Obtener un artículo específico por ID o slug
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supabase = getSupabaseServerClient();

    // Intentar buscar por UUID primero, luego por slug
    let query = supabase.from("blog_posts").select("*");

    // Verificar si es un UUID o un slug
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );

    if (isUUID) {
      query = query.eq("id", id);
    } else {
      query = query.eq("slug", id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Artículo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("Error in GET /api/blog/posts/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/blog/posts/[id]
 * Actualizar un artículo existente (requiere autenticación)
 */
export async function PATCH(request, { params }) {
  try {
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const supabase = getSupabaseServerClient();

    // Si se está publicando por primera vez, agregar published_at
    if (body.published && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("Error in PATCH /api/blog/posts/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/posts/[id]
 * Eliminar un artículo (requiere autenticación)
 */
export async function DELETE(request, { params }) {
  try {
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Artículo eliminado exitosamente" });
  } catch (error) {
    console.error("Error in DELETE /api/blog/posts/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
