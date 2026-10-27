import { NextResponse } from 'next/server';
import { d1Execute } from '@/lib/db';
import { getCurrentUserWithRole } from '@/lib/auth/server-roles';
import {
  conProductos,
  datosPromocion,
  obtenerPromocion,
  promocionVigente,
} from '@/lib/promociones-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/promociones/[id] → la promoción con sus productos y precios
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const promo = await obtenerPromocion(id);
    // Vencida o desactivada: para el público ya no existe
    if (!promo || !promocionVigente(promo)) {
      return NextResponse.json(
        { success: false, error: 'Promoción no encontrada' },
        { status: 404 }
      );
    }
    const [promocion] = await conProductos([promo]);
    return NextResponse.json({ success: true, promocion });
  } catch (error) {
    console.error('[GET /api/promociones/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/promociones/[id] (solo admin)
 */
export async function PUT(request, { params }) {
  try {
    const { isAdmin } = await getCurrentUserWithRole();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const datos = { ...datosPromocion(await request.json()), updated_at: new Date().toISOString() };
    const cols = Object.keys(datos);
    await d1Execute(
      `UPDATE promociones SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
      [...Object.values(datos), id]
    );

    return NextResponse.json({ success: true, promocion: await obtenerPromocion(id) });
  } catch (error) {
    console.error('[PUT /api/promociones/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la promoción' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/promociones/[id] (solo admin)
 */
export async function DELETE(request, { params }) {
  try {
    const { isAdmin } = await getCurrentUserWithRole();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    await d1Execute('DELETE FROM promociones WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/promociones/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la promoción' },
      { status: 500 }
    );
  }
}
