import { NextResponse } from 'next/server';
import { d1Select } from '@/lib/db-d1';

// GET /api/clientes-vitrina  (público, solo lectura)
// Devuelve los clientes que autorizaron aparecer en la vitrina pública,
// junto con sus productos comprados (solo si autorizaron mostrarlos).
export async function GET() {
  try {
    const clientes = await d1Select(
      `SELECT id, nombre, email, total_compras, mostrar_productos, avatar_url
       FROM clientes
       WHERE publicar_como_cliente = 1
       ORDER BY total_gastado DESC
       LIMIT 60`
    );

    if (clientes.length === 0) {
      return NextResponse.json({ clientes: [] });
    }

    // Productos comprados solo para quienes autorizaron mostrarlos
    const emailsConProductos = clientes
      .filter((c) => c.mostrar_productos && c.email)
      .map((c) => c.email);

    const productosPorEmail = {};
    if (emailsConProductos.length > 0) {
      const placeholders = emailsConProductos.map(() => '?').join(', ');
      const ventas = await d1Select(
        `SELECT cliente_email, producto_nombre
         FROM ventas
         WHERE cliente_email IN (${placeholders})
         ORDER BY fecha_venta DESC`,
        emailsConProductos
      );
      for (const v of ventas) {
        if (!productosPorEmail[v.cliente_email]) productosPorEmail[v.cliente_email] = [];
        if (!productosPorEmail[v.cliente_email].includes(v.producto_nombre)) {
          productosPorEmail[v.cliente_email].push(v.producto_nombre);
        }
      }
    }

    // No exponer el email al público; solo nombre, productos y avatar.
    const resultado = clientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      avatar_url: c.avatar_url || null,
      total_compras: c.total_compras || 0,
      productos: c.mostrar_productos ? (productosPorEmail[c.email] || []) : [],
    }));

    return NextResponse.json({ clientes: resultado });
  } catch (error) {
    console.error('Error en GET /api/clientes-vitrina:', error);
    return NextResponse.json({ clientes: [] });
  }
}
