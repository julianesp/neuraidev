import { NextResponse } from "next/server";
import { d1SelectOne, d1Execute } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const normalizarEmail = (email) => String(email || "").trim().toLowerCase();

/**
 * API Route para registrar cliente voluntariamente
 * POST /api/customers/register
 *
 * Body: { email, name, phone (opcional) }
 *
 * Antes llamaba a la función RPC `register_customer` de Supabase, que no
 * existe en D1 (fallaba siempre con "Error interno del servidor").
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizarEmail(body.email);
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim() || null;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Se requiere email y nombre" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El formato del email no es válido" },
        { status: 400 }
      );
    }

    const existente = await d1SelectOne(
      "SELECT id FROM customers WHERE lower(email) = ? LIMIT 1",
      [email]
    );
    if (existente) {
      return NextResponse.json({
        success: true,
        customerId: existente.id,
        message: "Ya estabas registrado con este correo",
      });
    }

    // customers.id es INTEGER NOT NULL sin autoincremento en D1: lo
    // calculamos en el mismo INSERT para no chocar con otro registro.
    const ahora = new Date().toISOString();
    await d1Execute(
      `INSERT INTO customers (id, email, name, phone, total_orders, total_spent, status, created_at, updated_at)
       SELECT COALESCE(MAX(id), 0) + 1, ?, ?, ?, 0, 0, 'active', ?, ? FROM customers`,
      [email, name, phone, ahora, ahora]
    );

    const creado = await d1SelectOne(
      "SELECT id FROM customers WHERE lower(email) = ? LIMIT 1",
      [email]
    );

    return NextResponse.json({
      success: true,
      customerId: creado?.id ?? null,
      message: "¡Registro exitoso!",
    }, { status: 201 });

  } catch (error) {
    console.error("Error en /api/customers/register:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Verificar si un email ya está registrado
 * GET /api/customers/register?email=example@email.com
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = normalizarEmail(searchParams.get('email'));

    if (!email) {
      return NextResponse.json(
        { error: "Se requiere email" },
        { status: 400 }
      );
    }

    const customer = await d1SelectOne(
      "SELECT id, email, name FROM customers WHERE lower(email) = ? LIMIT 1",
      [email]
    );

    return NextResponse.json({
      success: true,
      registered: !!customer,
      customer: customer || null
    });

  } catch (error) {
    console.error("Error en GET /api/customers/register:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
