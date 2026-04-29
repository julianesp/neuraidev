import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getPublicaciones,
  crearPublicacion,
  eliminarPublicacion,
  actualizarPublicacion,
} from "@/lib/supabase/blume";

const ADMIN_EMAIL = "hesucabrera223@umariana.edu.co";

async function verificarAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const emails = user.emailAddresses.map((e) => e.emailAddress);
  return emails.includes(ADMIN_EMAIL);
}

export async function GET() {
  try {
    const publicaciones = await getPublicaciones();
    return NextResponse.json({ publicaciones });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const esAdmin = await verificarAdmin();
    if (!esAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const body = await request.json();
    const { titulo, descripcion, imagen_url, imagen_path, imagenes_urls, imagenes_paths } = body;

    if (!titulo || !imagen_url) {
      return NextResponse.json({ error: "Título e imagen son obligatorios" }, { status: 400 });
    }

    const publicacion = await crearPublicacion({ titulo, descripcion, imagen_url, imagen_path, imagenes_urls, imagenes_paths });
    return NextResponse.json({ publicacion });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const esAdmin = await verificarAdmin();
    if (!esAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = await Promise.resolve(searchParams.get("id"));
    const imagen_path = await Promise.resolve(searchParams.get("imagen_path"));
    const imagenes_paths_raw = await Promise.resolve(searchParams.get("imagenes_paths"));
    const imagenes_paths = imagenes_paths_raw ? JSON.parse(imagenes_paths_raw) : [];

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    await eliminarPublicacion(id, imagen_path, imagenes_paths);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const esAdmin = await verificarAdmin();
    if (!esAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const body = await request.json();
    const { id, titulo, descripcion } = body;

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const publicacion = await actualizarPublicacion(id, { titulo, descripcion });
    return NextResponse.json({ publicacion });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
