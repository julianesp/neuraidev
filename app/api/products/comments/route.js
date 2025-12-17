import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/products/comments?productoId=xxx&limit=10&offset=0
 * Obtener comentarios de un producto
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productoId = searchParams.get("productoId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!productoId) {
      return NextResponse.json(
        { error: "productoId es requerido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Obtener comentarios con conteo de likes
    const { data: comments, error } = await supabase
      .rpc('get_product_comments', {
        p_producto_id: productoId,
        p_limit: limit,
        p_offset: offset
      });

    if (error) {
      console.error("Error obteniendo comentarios:", error);
      return NextResponse.json(
        { error: "Error al obtener comentarios" },
        { status: 500 }
      );
    }

    // Obtener el total de comentarios para paginación
    const { count, error: countError } = await supabase
      .from('product_comments')
      .select('id', { count: 'exact', head: true })
      .eq('producto_id', productoId)
      .eq('is_deleted', false);

    if (countError) {
      console.error("Error contando comentarios:", countError);
    }

    return NextResponse.json({
      comments: comments || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error("Error en GET /api/products/comments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/comments
 * Crear un nuevo comentario
 * Body: { productoId, commentText, rating? }
 */
export async function POST(request) {
  try {
    // Verificar autenticación
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para comentar" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productoId, commentText, rating } = body;

    // Validaciones
    if (!productoId || !commentText) {
      return NextResponse.json(
        { error: "productoId y commentText son requeridos" },
        { status: 400 }
      );
    }

    if (commentText.trim().length < 3) {
      return NextResponse.json(
        { error: "El comentario debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "La calificación debe estar entre 1 y 5" },
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

    // Crear el comentario
    const { data: newComment, error: insertError } = await supabase
      .from('product_comments')
      .insert([
        {
          producto_id: productoId,
          user_id: user.id,
          user_name: user.fullName || user.firstName || 'Usuario',
          user_email: user.emailAddresses[0]?.emailAddress,
          user_image: user.imageUrl,
          comment_text: commentText.trim(),
          rating: rating || null,
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error insertando comentario:", insertError);
      return NextResponse.json(
        { error: "Error al crear el comentario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
    }, { status: 201 });

  } catch (error) {
    console.error("Error en POST /api/products/comments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/comments
 * Editar un comentario existente
 * Body: { commentId, commentText, rating? }
 */
export async function PATCH(request) {
  try {
    // Verificar autenticación
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para editar comentarios" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { commentId, commentText, rating } = body;

    if (!commentId || !commentText) {
      return NextResponse.json(
        { error: "commentId y commentText son requeridos" },
        { status: 400 }
      );
    }

    if (commentText.trim().length < 3) {
      return NextResponse.json(
        { error: "El comentario debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verificar que el comentario pertenece al usuario
    const { data: existingComment, error: fetchError } = await supabase
      .from('product_comments')
      .select('*')
      .eq('id', commentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: "Comentario no encontrado o no tienes permiso para editarlo" },
        { status: 403 }
      );
    }

    // Actualizar el comentario
    const { data: updatedComment, error: updateError } = await supabase
      .from('product_comments')
      .update({
        comment_text: commentText.trim(),
        rating: rating || existingComment.rating,
        is_edited: true,
      })
      .eq('id', commentId)
      .select()
      .single();

    if (updateError) {
      console.error("Error actualizando comentario:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar el comentario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: updatedComment,
    });

  } catch (error) {
    console.error("Error en PATCH /api/products/comments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/comments?commentId=xxx
 * Eliminar (soft delete) un comentario
 */
export async function DELETE(request) {
  try {
    // Verificar autenticación
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para eliminar comentarios" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId es requerido" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verificar que el comentario pertenece al usuario
    const { data: existingComment, error: fetchError } = await supabase
      .from('product_comments')
      .select('*')
      .eq('id', commentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: "Comentario no encontrado o no tienes permiso para eliminarlo" },
        { status: 403 }
      );
    }

    // Soft delete - marcar como eliminado
    const { error: deleteError } = await supabase
      .from('product_comments')
      .update({ is_deleted: true })
      .eq('id', commentId);

    if (deleteError) {
      console.error("Error eliminando comentario:", deleteError);
      return NextResponse.json(
        { error: "Error al eliminar el comentario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comentario eliminado exitosamente",
    });

  } catch (error) {
    console.error("Error en DELETE /api/products/comments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
