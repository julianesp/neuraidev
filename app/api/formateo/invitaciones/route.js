import { NextResponse } from 'next/server';
import { d1Select, d1Execute } from '@/lib/db-d1';
import { isAdminServer } from '@/lib/auth/server-roles';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/formateo/invitaciones
// Admin: lista de clientes cargados para calificar el servicio técnico,
// con su estado (pendiente | calificado).
export async function GET() {
  try {
    const user = await currentUser();
    if (!user || !isAdminServer(user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const invitaciones = await d1Select(
      `SELECT id, email, nombre_cliente, estado, testimonio_id, created_at, calificado_at
       FROM formateo_invitaciones
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ invitaciones });
  } catch (error) {
    console.error('Error en GET /api/formateo/invitaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener las invitaciones' },
      { status: 500 }
    );
  }
}

// POST /api/formateo/invitaciones
// Admin: carga uno o varios emails. Acepta:
//   { email, nombre_cliente? }                     -> uno
//   { emails: "a@x.com, b@y.com\nc@z.com" }         -> varios (coma/salto de línea)
// Los emails ya existentes se ignoran (no se duplican).
export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user || !isAdminServer(user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();

    // Normalizar entrada a una lista de { email, nombre }
    let entradas = [];
    if (body.emails) {
      // Varios emails pegados, separados por coma, punto y coma o salto de línea.
      entradas = String(body.emails)
        .split(/[,;\n]+/)
        .map((e) => ({ email: e.trim(), nombre: null }))
        .filter((e) => e.email);
    } else if (body.email) {
      entradas = [{ email: String(body.email).trim(), nombre: body.nombre_cliente?.trim() || null }];
    }

    if (entradas.length === 0) {
      return NextResponse.json({ error: 'Debes indicar al menos un email' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ahora = new Date().toISOString();

    let agregados = 0;
    let duplicados = 0;
    let invalidos = 0;

    for (const { email, nombre } of entradas) {
      const normalizado = email.toLowerCase();
      if (!emailRegex.test(normalizado)) {
        invalidos++;
        continue;
      }
      try {
        await d1Execute(
          `INSERT INTO formateo_invitaciones (id, email, nombre_cliente, estado, created_at)
           VALUES (?, ?, ?, 'pendiente', ?)`,
          [crypto.randomUUID(), normalizado, nombre, ahora]
        );
        agregados++;
      } catch (e) {
        // El índice único sobre email lanza error si ya existe -> se ignora.
        duplicados++;
      }
    }

    return NextResponse.json({
      success: true,
      agregados,
      duplicados,
      invalidos,
    });
  } catch (error) {
    console.error('Error en POST /api/formateo/invitaciones:', error);
    return NextResponse.json(
      { error: 'Error al cargar los emails' },
      { status: 500 }
    );
  }
}

// DELETE /api/formateo/invitaciones?id=...
// Admin: quitar un email de la lista de invitaciones.
export async function DELETE(request) {
  try {
    const user = await currentUser();
    if (!user || !isAdminServer(user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await d1Execute(`DELETE FROM formateo_invitaciones WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/formateo/invitaciones:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la invitación' },
      { status: 500 }
    );
  }
}
