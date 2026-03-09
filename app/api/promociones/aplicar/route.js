import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

/**
 * POST /api/promociones/aplicar
 * Aplica promociones a un carrito de compras
 * Body: { items: [{ producto_id, cantidad, precio }] }
 */
export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Carrito vacío o inválido' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Obtener promociones activas
    const now = new Date().toISOString();
    const { data: promociones, error } = await supabase
      .from('promociones')
      .select('*')
      .eq('activo', true)
      .or(`fecha_inicio.is.null,fecha_inicio.lte.${now}`)
      .or(`fecha_fin.is.null,fecha_fin.gte.${now}`)
      .order('posicion_orden', { ascending: true });

    if (error) {
      console.error('[POST /api/promociones/aplicar] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Extraer IDs de productos en el carrito
    const productosEnCarrito = items.map(item => item.producto_id);

    // Encontrar promociones aplicables
    const promocionesAplicables = [];

    for (const promo of promociones || []) {
      // Verificar si todos los productos de la promoción están en el carrito
      const todosLosProductosPresentes = promo.productos_ids.every(
        id => productosEnCarrito.includes(id)
      );

      if (todosLosProductosPresentes) {
        // Verificar cantidad mínima
        const cantidadTotal = items
          .filter(item => promo.productos_ids.includes(item.producto_id))
          .reduce((sum, item) => sum + item.cantidad, 0);

        if (cantidadTotal >= (promo.cantidad_minima || 1)) {
          promocionesAplicables.push(promo);
        }
      }
    }

    // Calcular descuentos
    let descuentoTotal = 0;
    const descuentosDetalle = [];

    for (const promo of promocionesAplicables) {
      let descuentoPromo = 0;

      // Calcular precio original de los productos de la promoción
      const itemsPromo = items.filter(item =>
        promo.productos_ids.includes(item.producto_id)
      );

      const precioOriginal = itemsPromo.reduce(
        (sum, item) => sum + (item.precio * item.cantidad),
        0
      );

      switch (promo.tipo) {
        case 'combo':
        case 'descuento_porcentaje':
          // Siempre es descuento por porcentaje
          descuentoPromo = precioOriginal * (promo.descuento_valor / 100);
          break;

        case '2x1':
          // En 2x1, se descuenta el precio del más barato
          if (itemsPromo.length >= 2) {
            const precioMasBarato = Math.min(...itemsPromo.map(i => i.precio));
            descuentoPromo = precioMasBarato;
          }
          break;

        case '3x2':
          // En 3x2, se descuenta el precio del más barato cada 3 productos
          if (itemsPromo.length >= 3) {
            const totalProductos = itemsPromo.reduce((sum, i) => sum + i.cantidad, 0);
            const gruposDe3 = Math.floor(totalProductos / 3);
            const precioMasBarato = Math.min(...itemsPromo.map(i => i.precio));
            descuentoPromo = precioMasBarato * gruposDe3;
          }
          break;
      }

      if (descuentoPromo > 0) {
        descuentoTotal += descuentoPromo;
        descuentosDetalle.push({
          promocion_id: promo.id,
          nombre: promo.nombre,
          tipo: promo.tipo,
          descuento: descuentoPromo,
          productos: promo.productos_ids,
        });
      }
    }

    return NextResponse.json({
      success: true,
      promociones_aplicables: promocionesAplicables,
      descuento_total: descuentoTotal,
      descuentos_detalle: descuentosDetalle,
    });

  } catch (error) {
    console.error('[POST /api/promociones/aplicar] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
