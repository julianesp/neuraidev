import { NextResponse } from 'next/server';
import { d1Select, d1Execute } from '@/lib/db-d1';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('mes');

    const conditions = [];
    const params = [];

    if (mes) {
      const [year, month] = mes.split('-').map(Number);
      const primerDia = `${mes}-01T00:00:00`;
      const ultimoDia = new Date(year, month, 0);
      const ultimoDiaStr = `${mes}-${String(ultimoDia.getDate()).padStart(2, '0')}T23:59:59`;
      conditions.push('fecha_compra >= ? AND fecha_compra <= ?');
      params.push(primerDia, ultimoDiaStr);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(500);

    const compras = await d1Select(
      `SELECT * FROM compras ${where} ORDER BY fecha_compra DESC LIMIT ?`,
      params
    );

    return NextResponse.json({ compras });
  } catch (error) {
    console.error('Error GET /api/compras:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { items, proveedor, notas } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Debes agregar al menos un producto' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.producto_nombre?.trim()) return NextResponse.json({ error: 'Nombre de producto requerido' }, { status: 400 });
      if (!item.cantidad || item.cantidad <= 0) return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 });
      if (item.precio_unitario === undefined || item.precio_unitario < 0) return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }

    const ahora = new Date().toISOString();
    const insertadas = [];

    for (const item of items) {
      const id = crypto.randomUUID();
      const numeroCompra = `C-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const subtotal = item.cantidad * item.precio_unitario;

      await d1Execute(
        `INSERT INTO compras (id, numero_compra, fecha_compra, producto_nombre, cantidad, precio_unitario, subtotal, proveedor, notas, vendedor_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, numeroCompra, ahora, item.producto_nombre.trim(), item.cantidad, item.precio_unitario, subtotal, proveedor || null, notas || null, userId, ahora]
      );
      insertadas.push({ id, producto_nombre: item.producto_nombre, cantidad: item.cantidad, subtotal });
    }

    return NextResponse.json({ success: true, compras: insertadas }, { status: 201 });
  } catch (error) {
    console.error('Error POST /api/compras:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
