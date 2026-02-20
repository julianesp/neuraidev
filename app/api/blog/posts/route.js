import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/blog/posts
 * Obtener todos los artículos (publicados o borradores según autenticación)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const published = searchParams.get("published");
    const limit = searchParams.get("limit");

    const supabase = await createClient();

    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });

    // Filtrar por categoría
    if (category && category !== "Todos") {
      query = query.eq("category", category);
    }

    // Filtrar por estado de publicación
    if (published !== null) {
      query = query.eq("published", published === "true");
    }

    // Limitar resultados
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (error) {
    console.error("Error in GET /api/blog/posts:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/posts
 * Crear un nuevo artículo (requiere autenticación)
 */
export async function POST(request) {
  try {
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      slug,
      title,
      excerpt,
      content,
      category,
      author,
      read_time,
      image_url,
      published,
      featured,
      meta_title,
      meta_description,
      meta_keywords,
    } = body;

    // Validar campos requeridos
    if (!slug || !title || !excerpt || !content || !category) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar que el slug sea único
    const { data: existingPost } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { error: "Ya existe un artículo con ese slug" },
        { status: 400 }
      );
    }

    // Crear el artículo
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        title,
        excerpt,
        content,
        category,
        author: author || "Equipo Neurai.dev",
        read_time,
        image_url,
        published: published || false,
        featured: featured || false,
        meta_title: meta_title || title,
        meta_description: meta_description || excerpt,
        meta_keywords,
        published_at: published ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/blog/posts:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
