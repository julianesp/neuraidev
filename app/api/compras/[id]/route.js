import { NextResponse } from 'next/server';
import { d1Select, d1Execute } from '@/lib/db-d1';
import { auth } from '@clerk/nextjs/server';

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const rows = await d1Select('SELECT * FROM compras WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const { producto_nombre, cantidad, precio_unitario, costo_envio, proveedor, notas, fecha_compra } = body;

    if (!producto_nombre?.trim()) return NextResponse.json({ error: 'Nombre de producto requerido' }, { status: 400 });
    if (!cantidad || cantidad <= 0) return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 });
    if (precio_unitario === undefined || precio_unitario < 0) return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    if (!fecha_compra) return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });

    const cant = parseInt(cantidad);
    const precioBase = parseFloat(precio_unitario);
    const envio = parseFloat(costo_envio) || 0;
    const subtotalConEnvio = cant * precioBase + envio;
    const precioUnitarioReal = subtotalConEnvio / cant;
    const fechaFinal = new Date(fecha_compra).toISOString();

    await d1Execute(
      `UPDATE compras SET
        producto_nombre = ?, cantidad = ?, precio_unitario = ?, subtotal = ?,
        costo_envio = ?, proveedor = ?, notas = ?, fecha_compra = ?
       WHERE id = ?`,
      [producto_nombre.trim(), cant, precioUnitarioReal, subtotalConEnvio, envio, proveedor || null, notas || null, fechaFinal, id]
    );

    const updated = await d1Select('SELECT * FROM compras WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(updated[0]);
  } catch (e) {
    console.error('Error PUT /api/compras/[id]:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
