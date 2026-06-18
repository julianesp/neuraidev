import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getCurrentUserWithRole } from "@/lib/auth/server-roles";
import { notifyNewBlogComment } from "@/lib/notificationService";

export const dynamic = "force-dynamic";

/**
 * GET /api/blog/comments?slug=mi-articulo
 * Lista los comentarios de un artículo.
 * - Público: solo comentarios aprobados.
 * - Admin: si pasa ?all=true, devuelve también los pendientes (para moderar).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const all = searchParams.get("all") === "true";

    const db = getSupabaseServerClient();

    // Solo un admin puede pedir los comentarios pendientes
    let includePending = false;
    if (all) {
      const { isAdmin } = await getCurrentUserWithRole();
      includePending = isAdmin;
    }

    let query = db
      .from("blog_comments")
      .select("*")
      .order("created_at", { ascending: false });

    if (slug) {
      query = query.eq("post_slug", slug);
    }

    if (!includePending) {
      query = query.eq("approved", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error("Error in GET /api/blog/comments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/comments
 * Crea un comentario. Requiere estar autenticado (login con Google vía Clerk).
 * Queda pendiente de moderación (approved = 0) y notifica al admin por Telegram.
 * Body: { slug, content }
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para comentar" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const slug = (body.slug || "").trim();
    const content = (body.content || "").trim();

    if (!slug || !content) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "El comentario es demasiado largo (máximo 2000 caracteres)" },
        { status: 400 }
      );
    }

    // Datos del usuario tomados de la cuenta de Google (vía Clerk)
    const user = await currentUser();
    const userName =
      user?.fullName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      "Usuario";
    const userImage = user?.imageUrl || null;

    const db = getSupabaseServerClient();

    const { data, error } = await db
      .from("blog_comments")
      .insert({
        id: crypto.randomUUID(),
        post_slug: slug,
        user_id: userId,
        user_name: userName,
        user_image: userImage,
        content,
        approved: false, // moderación previa
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notificar al admin por Telegram (best-effort, no bloquea la respuesta)
    notifyNewBlogComment({
      postSlug: slug,
      userName,
      content,
    }).catch(() => {});

    return NextResponse.json(
      {
        comment: data,
        message:
          "¡Gracias! Tu comentario fue enviado y aparecerá una vez sea aprobado.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/blog/comments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/comments?id=...
 * Elimina un comentario. Permitido al autor del comentario o a un admin.
 */
export async function DELETE(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Falta el id del comentario" },
        { status: 400 }
      );
    }

    const db = getSupabaseServerClient();

    const { data: comment } = await db
      .from("blog_comments")
      .select("*")
      .eq("id", id)
      .single();

    if (!comment) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      );
    }

    const { isAdmin } = await getCurrentUserWithRole();
    if (comment.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        { error: "No puedes eliminar este comentario" },
        { status: 403 }
      );
    }

    const { error } = await db.from("blog_comments").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/blog/comments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/blog/comments
 * Aprueba (o desaprueba) un comentario. Solo admin.
 * Body: { id, approved: boolean }
 */
export async function PATCH(request) {
  try {
    const { isAdmin } = await getCurrentUserWithRole();
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { id, approved } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Falta el id del comentario" },
        { status: 400 }
      );
    }

    const db = getSupabaseServerClient();
    const { error } = await db
      .from("blog_comments")
      .update({ approved: approved === true || approved === 1 })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/blog/comments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
