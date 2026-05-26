import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/db";

// Cliente D1 compatible con API Supabase
const supabase = getSupabaseClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, email, razon } = body;

    // Validar datos requeridos
    if (!nombre || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    // Obtener userId si está autenticado
    const user = await currentUser();
    const userId = user?.id || null;

    // Generar número de referencia único
    const referencia = `DEL-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // Obtener IP del cliente
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "Desconocida";

    // Verificar si ya existe una solicitud pendiente para este email
    const { data: existente, error: errorExistente } = await supabase
      .from("solicitudes_eliminacion")
      .select("referencia, estado, fecha_solicitud")
      .eq("email", email)
      .in("estado", ["pendiente", "en_proceso"])
      .order("fecha_solicitud", { ascending: false })
      .limit(1)
      .single();

    if (existente && !errorExistente) {
      return NextResponse.json(
        {
          error: `Ya existe una solicitud ${existente.estado} para este email (Ref: ${existente.referencia})`,
          referencia_existente: existente.referencia,
        },
        { status: 409 }
      );
    }

    // Guardar la solicitud en Supabase
    const { data, error } = await supabase
      .from("solicitudes_eliminacion")
      .insert([
        {
          referencia,
          nombre,
          email,
          razon: razon || null,
          user_id: userId || null,
          ip_address: ipAddress,
          estado: "pendiente",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error al guardar solicitud en Supabase:", error);
      return NextResponse.json(
        { error: "Error al procesar la solicitud" },
        { status: 500 }
      );
    }

    // Log en consola para administradores
    console.log(`
      ═══════════════════════════════════════════════════════════
      🔴 NUEVA SOLICITUD DE ELIMINACIÓN DE DATOS
      ═══════════════════════════════════════════════════════════
      Referencia: ${referencia}
      Nombre: ${nombre}
      Email: ${email}
      Razón: ${razon || "No especificada"}
      User ID: ${userId || "No autenticado"}
      Fecha: ${new Date().toLocaleString("es-CO")}
      IP: ${ipAddress}
      ═══════════════════════════════════════════════════════════
      ⚠️  ACCIÓN REQUERIDA: Procesar eliminación en 30 días
      📊 Ver en Supabase: solicitudes_eliminacion (ID: ${data.id})
      ═══════════════════════════════════════════════════════════
    `);

    // TODO: Enviar email de confirmación al usuario
    // Puedes usar un servicio como SendGrid, AWS SES, etc.
    // Ejemplo:
    /*
    await sendEmail({
      to: email,
      subject: `Confirmación de solicitud de eliminación - Ref: ${referencia}`,
      body: `
        Hola ${nombre},

        Hemos recibido tu solicitud de eliminación de datos personales.

        Número de referencia: ${referencia}
        Fecha de solicitud: ${new Date().toLocaleDateString('es-CO')}

        Procesaremos tu solicitud en un plazo máximo de 30 días.
        Te notificaremos una vez completado el proceso.

        Si tienes alguna pregunta, contáctanos en julii1295@gmail.com

        Saludos,
        Equipo NeuraI.dev
      `
    });
    */

    return NextResponse.json({
      success: true,
      referencia,
      mensaje:
        "Solicitud recibida correctamente. Procesaremos tu solicitud en un plazo máximo de 30 días.",
    });
  } catch (error) {
    console.error("Error al procesar solicitud de eliminación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Método GET para obtener el estado de una solicitud por referencia
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const referencia = searchParams.get("referencia");

    if (!referencia) {
      return NextResponse.json(
        { error: "Número de referencia requerido" },
        { status: 400 }
      );
    }

    // Buscar la solicitud en Supabase
    const { data, error } = await supabase
      .from("solicitudes_eliminacion")
      .select("referencia, estado, fecha_solicitud, fecha_completado, nombre")
      .eq("referencia", referencia)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Calcular días transcurridos
    const diasTranscurridos = Math.floor(
      (new Date() - new Date(data.fecha_solicitud)) / (1000 * 60 * 60 * 24)
    );

    let mensaje = "";
    switch (data.estado) {
      case "pendiente":
        mensaje = `Tu solicitud está pendiente. Días transcurridos: ${diasTranscurridos}/30`;
        break;
      case "en_proceso":
        mensaje = `Tu solicitud está siendo procesada. Días transcurridos: ${diasTranscurridos}/30`;
        break;
      case "completada":
        mensaje = `Tu solicitud ha sido completada. Tus datos han sido eliminados.`;
        break;
      case "rechazada":
        mensaje = `Tu solicitud ha sido rechazada. Contacta con soporte para más información.`;
        break;
      case "cancelada":
        mensaje = `Tu solicitud ha sido cancelada.`;
        break;
      default:
        mensaje = `Estado: ${data.estado}`;
    }

    return NextResponse.json({
      referencia: data.referencia,
      estado: data.estado,
      nombre: data.nombre,
      fecha_solicitud: data.fecha_solicitud,
      fecha_completado: data.fecha_completado,
      dias_transcurridos: diasTranscurridos,
      mensaje,
    });
  } catch (error) {
    console.error("Error al consultar solicitud:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
