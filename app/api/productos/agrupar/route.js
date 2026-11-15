import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/api-auth';
import { d1Select, d1Execute } from '@/lib/db-d1';
import { leerMetadata, stockPorColor } from '@/lib/stockColor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const urlDe = (img) => (typeof img === 'object' && img ? img.url : img) || '';

function leerImagenes(valor) {
  let arr = valor;
  if (typeof arr === 'string') {
    try { arr = JSON.parse(arr); } catch { arr = []; }
  }
  return (Array.isArray(arr) ? arr : []).map(urlDe).filter(Boolean);
}

/**
 * POST /api/productos/agrupar
 * { principalId, items: [{ id, color }] }
 *
 * Une varios productos iguales de distinto color en uno solo (el principal):
 * colores, todas las fotos, foto y unidades de cada color, y stock total.
 * Los demás quedan ocultos (disponible = 0), no se borran: así se conserva su
 * historial de ventas y se pueden volver a activar.
 */
export async function POST(request) {
  try {
    const { userId, isAdmin } = await authenticateRequest(request);
    if (!userId || !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const items = Array.isArray(body.items) ? body.items : [];
    const principalId = String(body.principalId || '');
    const ids = [...new Set(items.map((i) => String(i?.id || '')).filter(Boolean))];

    if (ids.length < 2) {
      return NextResponse.json({ error: 'Elige al menos 2 productos' }, { status: 400 });
    }
    if (!ids.includes(principalId)) {
      return NextResponse.json({ error: 'Elige cuál producto queda como principal' }, { status: 400 });
    }

    const rows = await d1Select(
      `SELECT id, nombre, stock, imagen_principal, imagenes, metadata FROM products WHERE id IN (${ids.map(() => '?').join(', ')})`,
      ids
    );
    const porId = new Map((rows || []).map((r) => [String(r.id), r]));
    if (porId.size !== ids.length) {
      return NextResponse.json({ error: 'Algún producto ya no existe' }, { status: 404 });
    }

    // El principal primero, luego los demás en el orden elegido
    const orden = [principalId, ...ids.filter((id) => id !== principalId)];
    const colorPedido = new Map(items.map((i) => [String(i.id), String(i.color || '').trim().slice(0, 40)]));

    const colores = [];
    const fotos = [];
    const fotoPorColor = {};
    const unidadesPorColor = {};
    const agregarFoto = (u) => u && !fotos.includes(u) && fotos.push(u);

    for (const id of orden) {
      const p = porId.get(id);
      const meta = leerMetadata(p.metadata);
      const propias = leerImagenes(p.imagenes);
      const principal = p.imagen_principal || propias[0] || null;
      const yaColores = Array.isArray(meta.colores_disponibles) ? meta.colores_disponibles : [];

      // Producto que ya tiene varios colores: se conservan los suyos
      const coloresDeEste =
        yaColores.length > 1 ? yaColores : [colorPedido.get(id) || yaColores[0] || ''];
      if (coloresDeEste.some((c) => !c)) {
        return NextResponse.json({ error: `Escribe el color de «${p.nombre}»` }, { status: 400 });
      }

      agregarFoto(principal);
      propias.forEach(agregarFoto);

      const stockColorPrevio = stockPorColor(meta);
      for (const c of coloresDeEste) {
        if (!colores.includes(c)) colores.push(c);
        const foto = meta.imagenes_por_color?.[c] || principal;
        if (foto && !fotoPorColor[c]) fotoPorColor[c] = foto;
        const unidades =
          coloresDeEste.length > 1
            ? stockColorPrevio?.[c] ?? 0
            : Math.max(parseInt(p.stock, 10) || 0, 0);
        unidadesPorColor[c] = (unidadesPorColor[c] || 0) + unidades;
      }
    }

    const principal = porId.get(principalId);
    const metaPrincipal = leerMetadata(principal.metadata);
    const total = Object.values(unidadesPorColor).reduce((t, n) => t + n, 0);
    const metadata = {
      ...metaPrincipal,
      colores_disponibles: colores,
      imagenes_por_color: fotoPorColor,
      stock_por_color: unidadesPorColor,
    };
    const ahora = new Date().toISOString();

    await d1Execute(
      'UPDATE products SET imagenes = ?, metadata = ?, stock = ?, disponible = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(fotos), JSON.stringify(metadata), total, total > 0 ? 1 : 0, ahora, principalId]
    );

    const otros = orden.slice(1);
    for (const id of otros) {
      const meta = { ...leerMetadata(porId.get(id).metadata), agrupado_en: principalId };
      // Sus unidades ya quedaron sumadas en el principal: aquí pasan a 0
      await d1Execute('UPDATE products SET disponible = 0, stock = 0, metadata = ?, updated_at = ? WHERE id = ?', [
        JSON.stringify(meta),
        ahora,
        id,
      ]);
    }

    return NextResponse.json({ success: true, principalId, colores, stock: total, ocultos: otros });
  } catch (error) {
    console.error('[productos/agrupar] Error:', error);
    return NextResponse.json({ error: 'No se pudieron agrupar los productos' }, { status: 500 });
  }
}
