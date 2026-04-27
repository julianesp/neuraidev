import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import {
  registrarVoto,
  getResultadosPorMunicipio,
  getResultadosPorDepartamento,
  getTodosLosVotos,
} from "@/lib/supabase/encuesta-presidencial";

const ADMIN_EMAIL = "hesucabrera223@umariana.edu.co";

async function esAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.emailAddresses.some((e) => e.emailAddress === ADMIN_EMAIL);
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
    const { facebook_id, facebook_name, facebook_email, facebook_picture, municipio, departamento, candidato_id } = body;

    if (!facebook_id || !facebook_name || !municipio || !departamento || !candidato_id) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: usuario de Facebook, municipio, departamento y candidato." },
        { status: 400 }
      );
    }

    const voto = await registrarVoto({ facebook_id, facebook_name, facebook_email, facebook_picture, municipio, departamento, candidato_id });
    return NextResponse.json({ voto });
  } catch (error) {
    const status = error.message.includes("Ya has registrado") ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
