import { NextResponse } from 'next/server';
import { d1Select, d1Execute } from '@/lib/db-d1';
import { isAdminServer } from '@/lib/auth/server-roles';
import { currentUser } from '@clerk/nextjs/server';

// GET /api/admin/clientes-vitrina
// Devuelve la lista de clientes con sus productos comprados (desde `ventas`,
// agrupados por email) y el estado de los toggles de publicación.
export async function GET() {
  try {
    const user = await currentUser();
    if (!user || !isAdminServer(user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const clientes = await d1Select(
      `SELECT id, nombre, email, telefono, total_compras, total_gastado,
              publicar_como_cliente, mostrar_productos, avatar_url
       FROM clientes
       ORDER BY total_gastado DESC`
    );

    // Traer los productos comprados por cada cliente desde la tabla `ventas`,
    // relacionando por email. Se hace en una sola consulta y se agrupa en memoria.
    const emails = clientes
      .map((c) => c.email)
      .filter((e) => e && e.trim() !== '');

    const productosPorEmail = {};
    if (emails.length > 0) {
      const placeholders = emails.map(() => '?').join(', ');
      const ventas = await d1Select(
        `SELECT cliente_email, producto_nombre, fecha_venta
         FROM ventas
         WHERE cliente_email IN (${placeholders})
         ORDER BY fecha_venta DESC`,
        emails
      );

      for (const venta of ventas) {
        const key = venta.cliente_email;
        if (!productosPorEmail[key]) productosPorEmail[key] = [];
        // Evitar repetir el mismo producto en la lista
        if (!productosPorEmail[key].includes(venta.producto_nombre)) {
          productosPorEmail[key].push(venta.producto_nombre);
        }
      }
    }

    const resultado = clientes.map((c) => ({
      ...c,
      publicar_como_cliente: !!c.publicar_como_cliente,
      mostrar_productos: !!c.mostrar_productos,
      productos: productosPorEmail[c.email] || [],
    }));

    return NextResponse.json({ clientes: resultado });
  } catch (error) {
    console.error('Error en GET /api/admin/clientes-vitrina:', error);
    return NextResponse.json(
      { error: 'Error al obtener los clientes' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/clientes-vitrina
// Actualiza los toggles de publicación de un cliente.
// Body: { id, publicar_como_cliente?, mostrar_productos? }
export async function PATCH(request) {
  try {
    const user = await currentUser();
    if (!user || !isAdminServer(user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, publicar_como_cliente, mostrar_productos } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de cliente requerido' },
        { status: 400 }
      );
    }

    const campos = [];
    const params = [];

    if (typeof publicar_como_cliente === 'boolean') {
      campos.push('publicar_como_cliente = ?');
      params.push(publicar_como_cliente ? 1 : 0);
    }

    if (typeof mostrar_productos === 'boolean') {
      campos.push('mostrar_productos = ?');
      params.push(mostrar_productos ? 1 : 0);
    }

    if (campos.length === 0) {
      return NextResponse.json(
        { error: 'No hay cambios para aplicar' },
        { status: 400 }
      );
    }

    params.push(id);
    await d1Execute(
      `UPDATE clientes SET ${campos.join(', ')} WHERE id = ?`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en PATCH /api/admin/clientes-vitrina:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el cliente' },
      { status: 500 }
    );
  }
}
