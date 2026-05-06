import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getEncuestasActivas,
  crearEncuesta,
} from "@/lib/supabase/encuestas";

const ADMIN_EMAILS = ["julii1295@gmail.com", "admin@neurai.dev"];

async function esAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.emailAddresses.some((e) => ADMIN_EMAILS.includes(e.emailAddress));
}

export async function GET() {
  const encuestas = await getEncuestasActivas();
  return NextResponse.json({ encuestas });
}

export async function POST(request) {
  try {
    const admin = await esAdmin();
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const body = await request.json();
    const { slug, titulo, descripcion, candidatos, fecha_cierre } = body;

    if (!slug || !titulo || !candidatos?.length || !fecha_cierre) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const encuesta = await crearEncuesta({ slug, titulo, descripcion, candidatos, fecha_cierre });
    return NextResponse.json({ encuesta });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
