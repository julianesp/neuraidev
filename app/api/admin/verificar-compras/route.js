import { NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { isAdminServer } from '@/lib/auth/server-roles';
import { d1Select } from '@/lib/db';
import { buscarComprasCliente, PEDIDO_PAGADO } from '@/lib/compras-cliente';

export const dynamic = 'force-dynamic';

// GET /api/admin/verificar-compras?testimonio=<id>
// Admin: ¿quien dejó esta calificación ha comprado en neurai? Cruza pedidos
// online, ventas registradas y clientes por cuenta, correo y teléfono, y
// sugiere ventas con un nombre parecido (pista, no prueba).
export async function GET(request) {
  try {
    const admin = await currentUser();
    if (!admin || !isAdminServer(admin)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const id = new URL(request.url).searchParams.get('testimonio');
    if (!id) return NextResponse.json({ error: 'Falta el testimonio' }, { status: 400 });

    const [t] = await d1Select(
      'SELECT id, cliente_nombre, cliente_email, user_id FROM testimonios WHERE id = ?',
      [id]
    );
    if (!t) return NextResponse.json({ error: 'Calificación no encontrada' }, { status: 404 });

    // Correos y teléfonos de su cuenta (Facebook/Google) si inició sesión
    const emails = [t.cliente_email];
    const telefonos = [];
    let cuenta = null;
    if (t.user_id) {
      try {
        const client = await clerkClient();
        const u = await client.users.getUser(t.user_id);
        emails.push(...u.emailAddresses.map((e) => e.emailAddress));
        telefonos.push(...u.phoneNumbers.map((p) => p.phoneNumber));
        cuenta = {
          nombre: u.fullName,
          proveedores: u.externalAccounts.map((a) => String(a.provider || '').replace('oauth_', '')),
          creada: u.createdAt,
          descuento: u.publicMetadata?.descuento_cliente || null,
        };
      } catch {
        // cuenta borrada: se sigue con el correo guardado
      }
    }

    const r = await buscarComprasCliente({
      userId: t.user_id,
      emails,
      telefonos,
      nombre: t.cliente_nombre,
      conCoincidenciasPorNombre: true,
    });

    return NextResponse.json({
      cuenta,
      emails: [...new Set(emails.filter(Boolean).map((e) => e.toLowerCase()))],
      resumen: r.resumen,
      pedidos: r.pedidos.map((p) => ({
        numero_orden: p.numero_orden,
        fecha: p.fecha_pago || p.created_at,
        total: p.total,
        pagado: PEDIDO_PAGADO(p),
        metodo_pago: p.metodo_pago,
      })),
      ventas: r.ventas.map((v) => ({
        numero_venta: v.numero_venta,
        fecha: v.fecha_venta,
        producto: v.producto_nombre,
        cantidad: v.cantidad,
        total: v.subtotal_venta,
      })),
      cliente: r.cliente,
      porNombre: r.porNombre.map((v) => ({
        numero_venta: v.numero_venta,
        fecha: v.fecha_venta,
        producto: v.producto_nombre,
        total: v.subtotal_venta,
        cliente_nombre: v.cliente_nombre,
        cliente_telefono: v.cliente_telefono,
      })),
    });
  } catch (error) {
    console.error('[verificar-compras]', error);
    return NextResponse.json({ error: 'No se pudo verificar' }, { status: 500 });
  }
}
