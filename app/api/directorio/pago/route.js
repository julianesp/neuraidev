import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { d1Execute, d1Select, d1SelectOne } from "@/lib/db-d1";
import { DIRECTORIO_GRATIS, PLANES } from "@/lib/directorio/planes";

export const dynamic = "force-dynamic";

async function usuario() {
  const user = await currentUser().catch(() => null);
  if (!user) return null;
  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "",
    nombre: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Cliente",
  };
}

// POST { negocio_id, plan: "mensual" | "semestral" }
// Crea el pago pendiente (el monto sale de PLANES, no del cliente) y devuelve
// la configuración para abrir el checkout de ePayco en el navegador.
export async function POST(request) {
  try {
    const u = await usuario();
    if (!u) return NextResponse.json({ error: "Inicia sesión para pagar." }, { status: 401 });

    if (DIRECTORIO_GRATIS) {
      return NextResponse.json({ error: "El directorio es gratis por ahora: no necesitas pagar." }, { status: 400 });
    }

    const { negocio_id, plan: planId } = await request.json();
    const plan = PLANES[planId];
    if (!plan) return NextResponse.json({ error: "Plan no válido." }, { status: 400 });

    const negocio = await d1SelectOne(
      "SELECT id, nombre FROM directorio_negocios WHERE id = ? AND owner_id = ?",
      [String(negocio_id || ""), u.id]
    );
    if (!negocio) return NextResponse.json({ error: "No encontramos ese negocio en tu cuenta." }, { status: 404 });

    const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
    if (!publicKey) {
      console.error("[directorio/pago] Falta NEXT_PUBLIC_EPAYCO_PUBLIC_KEY");
      return NextResponse.json({ error: "El pago no está disponible en este momento." }, { status: 500 });
    }

    const referencia = `DIR-${negocio.id.replace(/-/g, "").slice(0, 8)}-${Date.now()}`;
    await d1Execute(
      `INSERT INTO directorio_pagos (id, referencia, negocio_id, owner_id, plan, meses, monto, estado, created_at)
       VALUES (?,?,?,?,?,?,?,'pendiente',?)`,
      [crypto.randomUUID(), referencia, negocio.id, u.id, plan.id, plan.meses, plan.precio, new Date().toISOString()]
    );

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev";
    const monto = plan.precio;
    return NextResponse.json({
      referencia,
      config: {
        key: publicKey,
        test: process.env.EPAYCO_TEST_MODE === "true",
        name: `Directorio Putumayo - ${plan.nombre}`,
        description: `Plan del directorio (${plan.nombre}) para ${negocio.nombre}`.slice(0, 120),
        invoice: referencia,
        currency: "cop",
        amount: String(monto),
        tax_base: monto.toFixed(2),
        tax: "0.00",
        country: "co",
        lang: "es",
        name_billing: u.nombre,
        email_billing: u.email.toLowerCase(),
        extra1: negocio.id,
        extra2: plan.id,
        extra3: referencia,
        // Sin parámetros en la URL: ePayco le agrega los suyos (ref_payco).
        response: `${baseUrl}/directorio/mis-negocios`,
        confirmation: `${baseUrl}/api/webhooks/directorio`,
        external: "false",
        autoclick: false,
        method_confirmation: "POST",
        methodsDisable: [],
      },
    });
  } catch (error) {
    console.error("Error en POST /api/directorio/pago:", error);
    return NextResponse.json({ error: "No se pudo iniciar el pago. Intenta de nuevo." }, { status: 500 });
  }
}

// GET → estado del pago más reciente (últimas 3 h). La página lo consulta al
// volver de ePayco: PSE/Nequi confirman unos minutos después por el webhook.
export async function GET() {
  try {
    const u = await usuario();
    if (!u) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
    const desde = new Date(Date.now() - 3 * 3600_000).toISOString();
    const [ultimo] = await d1Select(
      `SELECT referencia, negocio_id, plan, monto, estado, created_at
         FROM directorio_pagos WHERE owner_id = ? AND created_at > ?
        ORDER BY created_at DESC LIMIT 1`,
      [u.id, desde]
    );
    return NextResponse.json({ pago: ultimo || null });
  } catch (error) {
    console.error("Error en GET /api/directorio/pago:", error);
    return NextResponse.json({ pago: null });
  }
}
