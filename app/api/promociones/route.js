import { NextResponse } from 'next/server';
import { d1Execute } from '@/lib/db';
import { getCurrentUserWithRole } from '@/lib/auth/server-roles';
import {
  conProductos,
  datosPromocion,
  obtenerPromociones,
  obtenerPromocion,
} from '@/lib/promociones-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/promociones            → todas (dashboard)
 * GET /api/promociones?activas=true → solo las vigentes (home)
 * Cada promoción trae `productos` con su precio vigente y su precio en la promo.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const soloVigentes = searchParams.get('activas') === 'true';
    const promociones = await conProductos(await obtenerPromociones({ soloVigentes }));
    return NextResponse.json({ success: true, promociones });
  } catch (error) {
    console.error('[GET /api/promociones] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar las promociones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/promociones (solo admin)
 */
export async function POST(request) {
  try {
    const { isAdmin } = await getCurrentUserWithRole();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.nombre || !body.tipo || !Array.isArray(body.productos_ids) || body.productos_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos (nombre, tipo y al menos un producto)' },
        { status: 400 }
      );
    }
    const pct = Number(body.descuento_valor);
    if (!(pct > 0 && pct < 100)) {
      return NextResponse.json(
        { success: false, error: 'El descuento debe estar entre 1 y 99%' },
        { status: 400 }
      );
    }

    const ahora = new Date().toISOString();
    const datos = {
      activo: 1,
      ...datosPromocion(body),
      id: crypto.randomUUID(),
      created_at: ahora,
      updated_at: ahora,
    };
    const cols = Object.keys(datos);
    await d1Execute(
      `INSERT INTO promociones (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
      Object.values(datos)
    );

    return NextResponse.json(
      { success: true, promocion: await obtenerPromocion(datos.id) },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/promociones] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear la promoción' },
      { status: 500 }
    );
  }
}
