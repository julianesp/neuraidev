import { NextResponse } from "next/server";
import { isAdminServer } from "@/lib/auth/server-roles";
import { currentUser } from "@clerk/nextjs/server";

// Crea la tabla page_views usando la API REST de Supabase Management
export async function POST() {
  try {
    const user = await currentUser();
    if (!user || !isAdminServer(user)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Crear tabla vía Supabase REST con service role
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Usar pg directamente no está disponible, ejecutar SQL via endpoint
    const sql = `
      CREATE TABLE IF NOT EXISTS public.page_views (
        id BIGSERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        visits INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS page_views_date_idx ON public.page_views(date);
    `;

    // Intentar via Supabase SQL API (solo funciona con service role)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/execute_sql`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      }
    );

    if (!res.ok) {
      // Si no hay función RPC, devolver el SQL para ejecutar manualmente
      return NextResponse.json({
        ok: false,
        manual: true,
        sql: sql.trim(),
        message: "Ejecuta este SQL en el editor de Supabase",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
