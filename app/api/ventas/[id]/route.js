import { NextResponse } from 'next/server';
import { d1Select, d1Execute } from '@/lib/db-d1';
import { auth } from '@clerk/nextjs/server';

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const rows = await d1Select('SELECT * FROM ventas WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });

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

    const {
      producto_nombre, cantidad, precio_venta, precio_compra,
      cliente_nombre, cliente_telefono, cliente_email,
      metodo_pago, comprobante_pago, notas,
    } = body;

    if (!producto_nombre || !cantidad || !precio_venta || precio_compra === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const precioVenta = parseFloat(precio_venta);
    const precioCompra = parseFloat(precio_compra);
    const cant = parseInt(cantidad);
    const ahora = new Date().toISOString();

    await d1Execute(
      `UPDATE ventas SET
        producto_nombre = ?, cantidad = ?, precio_venta = ?, precio_compra = ?,
        subtotal_venta = ?, subtotal_compra = ?, ganancia_total = ?,
        cliente_nombre = ?, cliente_telefono = ?, cliente_email = ?,
        metodo_pago = ?, comprobante_pago = ?, notas = ?, updated_at = ?
       WHERE id = ?`,
      [
        producto_nombre, cant, precioVenta, precioCompra,
        precioVenta * cant, precioCompra * cant, (precioVenta - precioCompra) * cant,
        cliente_nombre || null, cliente_telefono || null, cliente_email || null,
        metodo_pago || 'nequi', comprobante_pago || null, notas || null, ahora,
        id,
      ]
    );

    const updated = await d1Select('SELECT * FROM ventas WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(updated[0]);
  } catch (e) {
    console.error('Error PUT /api/ventas/[id]:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
