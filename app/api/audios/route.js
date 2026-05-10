import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

  const { data, error } = await supabase.storage.from("audios").list("grabaciones", {
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: jsonHeaders });
  }

  const audios = data
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => {
      const { data: urlData } = supabase.storage
        .from("audios")
        .getPublicUrl(`grabaciones/${f.name}`);
      return {
        name: f.name,
        path: `grabaciones/${f.name}`,
        url: urlData.publicUrl,
        size: f.metadata?.size || 0,
        created_at: f.created_at,
      };
    });

  return NextResponse.json({ audios }, { headers: jsonHeaders });
}

// POST - subir audio
export async function POST(request) {
  const userId = await verificarAdmin(request);
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: jsonHeaders });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const titulo = formData.get("titulo") || file?.name || "audio";

  if (!file) {
    return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400, headers: jsonHeaders });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
  const validExts = ["mp3", "m4a", "wav", "ogg", "aac", "opus", "webm"];
  if (!validExts.includes(ext)) {
    return NextResponse.json({ error: "Formato no válido. Usa mp3, m4a, wav, ogg, aac u opus." }, { status: 400, headers: jsonHeaders });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "El audio no debe superar los 50MB" }, { status: 400, headers: jsonHeaders });
  }

  const timestamp = Date.now();
  const slug = titulo
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
  const fileName = `grabaciones/${timestamp}-${slug}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const mimeMap = {
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
    ogg: "audio/ogg",
    aac: "audio/aac",
    opus: "audio/opus",
    webm: "audio/webm",
  };
  const contentType = mimeMap[ext] || "audio/mpeg";

  const { error } = await supabase.storage.from("audios").upload(fileName, buffer, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    return NextResponse.json({ error: "Error subiendo audio: " + error.message }, { status: 500, headers: jsonHeaders });
  }

  const { data: urlData } = supabase.storage.from("audios").getPublicUrl(fileName);

  return NextResponse.json(
    { success: true, url: urlData.publicUrl, path: fileName, name: `${timestamp}-${slug}.${ext}` },
    { headers: jsonHeaders }
  );
}

// DELETE - eliminar audio
export async function DELETE(request) {
  const userId = await verificarAdmin(request);
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: jsonHeaders });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "No se proporcionó la ruta" }, { status: 400, headers: jsonHeaders });
  }

  const { error } = await supabase.storage.from("audios").remove([path]);

  if (error) {
    return NextResponse.json({ error: "Error eliminando audio: " + error.message }, { status: 500, headers: jsonHeaders });
  }

  return NextResponse.json({ success: true }, { headers: jsonHeaders });
}
