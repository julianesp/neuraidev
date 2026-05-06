import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getEncuestaBySlug,
  getResultadosEncuesta,
  getVotoUsuarioEncuesta,
  registrarVotoEncuesta,
  getTodosVotosEncuesta,
  borrarVotosEncuesta,
} from "@/lib/supabase/encuestas";
import { clerkClient } from "@clerk/nextjs/server";

const ADMIN_EMAILS = ["julii1295@gmail.com", "admin@neurai.dev"];

async function esAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.emailAddresses.some((e) => ADMIN_EMAILS.includes(e.emailAddress));
}

export async function GET(request, { params }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const vista = searchParams.get("vista");

  const encuesta = await getEncuestaBySlug(slug);
  if (!encuesta) return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });

  if (vista === "mi-voto") {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ voto: null });
    const voto = await getVotoUsuarioEncuesta(encuesta.id, userId);
    return NextResponse.json({ voto });
  }

  if (vista === "admin") {
    const admin = await esAdmin();
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    const votos = await getTodosVotosEncuesta(encuesta.id);
    return NextResponse.json({ votos });
  }

  const votos = await getResultadosEncuesta(encuesta.id);
  return NextResponse.json({ votos, encuesta });
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const encuesta = await getEncuestaBySlug(slug);
    if (!encuesta) return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });

    const body = await request.json();
    const { user_name, user_email, user_picture, candidato_id, municipio, departamento } = body;

    const voto = await registrarVotoEncuesta({
      encuesta_id: encuesta.id,
      user_id: userId,
      user_name,
      user_email,
      user_picture,
      candidato_id,
      municipio,
      departamento,
    });
    return NextResponse.json({ voto });
  } catch (error) {
    const status = error.message.includes("Ya has registrado") ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { slug } = await params;
    const admin = await esAdmin();
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    const encuesta = await getEncuestaBySlug(slug);
    if (!encuesta) return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    await borrarVotosEncuesta(encuesta.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
