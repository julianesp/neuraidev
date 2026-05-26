import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const jsonHeaders = { "Content-Type": "application/json" };

async function verificarAdmin(request) {
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch {}

  const referer = request.headers.get("referer") || "";
  if (referer.includes("/dashboard/")) return "dashboard-user";

  return null;
}

// GET - listar audios
export async function GET(request) {
  const userId = await verificarAdmin(request);
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: jsonHeaders });
  }

  // Not implemented: migrating from Supabase Storage to Cloudflare R2 or another provider
  return NextResponse.json(
    { error: "Not implemented: audio storage migrating from Supabase to Cloudflare" },
    { status: 501, headers: jsonHeaders }
  );
}

// POST - subir audio
export async function POST(request) {
  const userId = await verificarAdmin(request);
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: jsonHeaders });
  }

  // Not implemented: migrating from Supabase Storage to Cloudflare R2 or another provider
  return NextResponse.json(
    { error: "Not implemented: audio storage migrating from Supabase to Cloudflare" },
    { status: 501, headers: jsonHeaders }
  );
}

// DELETE - eliminar audio
export async function DELETE(request) {
  const userId = await verificarAdmin(request);
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: jsonHeaders });
  }

  // Not implemented: migrating from Supabase Storage to Cloudflare R2 or another provider
  return NextResponse.json(
    { error: "Not implemented: audio storage migrating from Supabase to Cloudflare" },
    { status: 501, headers: jsonHeaders }
  );
}
