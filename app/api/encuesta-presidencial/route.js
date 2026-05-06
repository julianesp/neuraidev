import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import {
  registrarVoto,
  getResultadosPorMunicipio,
  getResultadosPorDepartamento,
  getTodosLosVotos,
  getVotoDeUsuario,
  borrarTodosLosVotos,
} from "@/lib/supabase/encuesta-presidencial";

const ADMIN_EMAILS = ["julii1295@gmail.com", "admin@neurai.dev"];

async function esAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.emailAddresses.some((e) => ADMIN_EMAILS.includes(e.emailAddress));
}

// GET /api/encuesta-presidencial?vista=municipios|departamentos|admin
export async function GET(request) {
  try {
    const { searchParams } = await Promise.resolve(new URL(request.url));
    const vista = searchParams.get("vista") || "municipios";

    if (vista === "admin") {
      const admin = await esAdmin();
      if (!admin) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      const votos = await getTodosLosVotos();
      return NextResponse.json({ votos });
    }

    if (vista === "mi-voto") {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ voto: null });
      const voto = await getVotoDeUsuario(userId);
      return NextResponse.json({ voto });
    }

    if (vista === "departamentos") {
      const resultados = await getResultadosPorDepartamento();
      return NextResponse.json({ resultados });
    }

    const resultados = await getResultadosPorMunicipio();
    return NextResponse.json({ resultados });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/encuesta-presidencial — registrar voto
export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, user_name, user_email, user_picture, municipio, departamento, candidato_id } = body;

    if (!user_id || !user_name || !municipio || !departamento || !candidato_id) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: usuario, municipio, departamento y candidato." },
        { status: 400 }
      );
    }

    const voto = await registrarVoto({ user_id, user_name, user_email, user_picture, municipio, departamento, candidato_id });
    return NextResponse.json({ voto });
  } catch (error) {
    const status = error.message.includes("Ya has registrado") ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

// DELETE /api/encuesta-presidencial — borrar todos los votos (solo admin)
export async function DELETE() {
  try {
    const admin = await esAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    await borrarTodosLosVotos();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
