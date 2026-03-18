import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/auth/server-roles";
import { getSupabaseClient } from "@/lib/db";

/**
 * GET /api/admin/tiendas
 * Lista todas las tiendas registradas (solo admins)
 */
export async function GET() {
  const { isAdmin } = await getCurrentUserWithRole();
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("tiendas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Error obteniendo tiendas" }, { status: 500 });
  }

  return NextResponse.json({ tiendas: data });
}

/**
 * POST /api/admin/tiendas
 * Asigna rol "tienda" a un usuario en Clerk (solo admins)
 * Body: { clerkUserId }
 */
export async function POST(request) {
  const { isAdmin } = await getCurrentUserWithRole();
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { clerkUserId, accion } = await request.json();
  if (!clerkUserId) {
    return NextResponse.json({ error: "clerkUserId requerido" }, { status: 400 });
  }

  try {
    const client = await clerkClient();

    if (accion === "revocar") {
      await client.users.updateUser(clerkUserId, {
        publicMetadata: { role: null },
      });
      return NextResponse.json({ ok: true, mensaje: "Acceso revocado" });
    }

    // Asignar rol tienda
    await client.users.updateUser(clerkUserId, {
      publicMetadata: { role: "tienda" },
    });

    return NextResponse.json({ ok: true, mensaje: "Rol tienda asignado" });
  } catch (error) {
    console.error("Error actualizando rol en Clerk:", error);
    return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 });
  }
}
