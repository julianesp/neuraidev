import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Obtener todos los productos con sus payment links
export async function GET() {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { data: productos, error } = await supabase
      .from("products")
      .select("id, nombre, precio, categoria, metadata, imagen_url")
      .order("nombre");

    if (error) throw error;

    // Formatear respuesta con payment_link extraído
    const productosConPaymentLink = productos.map((producto) => ({
      ...producto,
      payment_link: producto.metadata?.payment_link || null,
    }));

    return NextResponse.json({ productos: productosConPaymentLink });
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return NextResponse.json(
      { error: "Error obteniendo productos" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar payment link de un producto
export async function PATCH(request) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { productoId, paymentLink } = await request.json();

    if (!productoId) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 }
      );
    }

    // Primero obtener el producto actual para preservar metadata existente
    const { data: productoActual, error: errorGet } = await supabase
      .from("products")
      .select("metadata")
      .eq("id", productoId)
      .single();

    if (errorGet) throw errorGet;

    // Actualizar metadata preservando otros campos
    const metadataActualizado = {
      ...(productoActual.metadata || {}),
      payment_link: paymentLink || null,
    };

    // Si paymentLink es null o vacío, eliminar la propiedad
    if (!paymentLink) {
      delete metadataActualizado.payment_link;
    }

    const { data, error } = await supabase
      .from("products")
      .update({ metadata: metadataActualizado })
      .eq("id", productoId)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      producto: data[0],
      message: paymentLink
        ? "Payment link actualizado exitosamente"
        : "Payment link eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error actualizando payment link:", error);
    return NextResponse.json(
      { error: "Error actualizando payment link" },
      { status: 500 }
    );
  }
}
