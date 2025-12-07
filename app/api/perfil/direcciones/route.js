import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/perfil/direcciones
 * Obtiene todas las direcciones del usuario actual
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("clerk_user_id", userId)
      .order("es_predeterminada", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener direcciones:", error);
      return NextResponse.json(
        { error: "Error al obtener direcciones" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error en GET /api/perfil/direcciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/perfil/direcciones
 * Crea una nueva dirección para el usuario actual
 */
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      nombre_completo,
      telefono,
      direccion_linea1,
      direccion_linea2,
      ciudad,
      departamento,
      codigo_postal,
      pais,
      tipo,
      es_predeterminada,
      notas,
    } = body;

    // Validaciones básicas
    if (!nombre_completo || !telefono || !direccion_linea1 || !ciudad || !departamento) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Si es predeterminada, quitar el flag de las demás
    if (es_predeterminada) {
      await supabase
        .from("user_addresses")
        .update({ es_predeterminada: false })
        .eq("clerk_user_id", userId);
    }

    // Crear la dirección
    const { data, error } = await supabase
      .from("user_addresses")
      .insert({
        clerk_user_id: userId,
        nombre_completo,
        telefono,
        direccion_linea1,
        direccion_linea2,
        ciudad,
        departamento,
        codigo_postal,
        pais: pais || "Colombia",
        tipo: tipo || "casa",
        es_predeterminada: es_predeterminada || false,
        notas,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al crear dirección:", error);
      return NextResponse.json(
        { error: "Error al crear dirección" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/perfil/direcciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
