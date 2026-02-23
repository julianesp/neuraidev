import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth/roles';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

/**
 * POST /api/nequi/verify-order-ai
 * Usa AI para verificar y asociar un pedido Nequi con productos
 * basándose en el monto pagado y los productos disponibles
 */
export async function POST(request) {
  try {
    // Verificar autenticación y permisos de admin
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden usar esta función.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, montoPagado, descripcionCliente } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Se requiere orderId' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Obtener el pedido
    const { data: order, error: fetchError } = await supabase
      .from('nequi_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los productos disponibles
    const { data: productos, error: productosError } = await supabase
      .from('products')
      .select('id, nombre, precio, categoria, stock')
      .gt('stock', 0)
      .order('nombre');

    if (productosError) {
      console.error('Error obteniendo productos:', productosError);
      return NextResponse.json(
        { error: 'Error al obtener productos' },
        { status: 500 }
      );
    }

    // Preparar contexto para la AI
    const montoPedido = montoPagado || order.total_con_descuento;
    const descuentoAplicado = order.descuento_porcentaje || 5;

    // Calcular el precio original a partir del monto con descuento
    const precioOriginalEstimado = Math.round(montoPedido / (1 - descuentoAplicado / 100));

    const productosInfo = productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      precioConDescuento: Math.round(p.precio * (1 - descuentoAplicado / 100)),
      categoria: p.categoria,
      stock: p.stock
    }));

    const prompt = `Eres un asistente experto en identificar productos basándote en montos de pago.

**INFORMACIÓN DEL PEDIDO:**
- Monto pagado con Nequi: $${montoPedido.toLocaleString('es-CO')}
- Descuento aplicado: ${descuentoAplicado}%
- Precio original estimado: $${precioOriginalEstimado.toLocaleString('es-CO')}
${descripcionCliente ? `- Descripción del cliente: "${descripcionCliente}"` : ''}

**PRODUCTOS DEL PEDIDO ORIGINAL:**
${order.productos.map((p, i) => `${i + 1}. ${p.nombre} - Precio: $${p.precio.toLocaleString('es-CO')} - Cantidad: ${p.cantidad}`).join('\n')}

**PRODUCTOS DISPONIBLES EN INVENTARIO:**
${productosInfo.slice(0, 50).map((p, i) =>
  `${i + 1}. ${p.nombre} (ID: ${p.id})
   - Precio: $${p.precio.toLocaleString('es-CO')}
   - Con descuento ${descuentoAplicado}%: $${p.precioConDescuento.toLocaleString('es-CO')}
   - Stock: ${p.stock}
   - Categoría: ${p.categoria}`
).join('\n\n')}

**TU TAREA:**
Analiza el monto pagado ($${montoPedido.toLocaleString('es-CO')}) y determina:

1. ¿Los productos del pedido original coinciden con el monto pagado?
2. Si NO coinciden, ¿qué producto(s) del inventario podrían corresponder a ese monto?
3. ¿Hay múltiples opciones posibles?

**RESPONDE EN FORMATO JSON:**
{
  "coincide": boolean, // true si los productos del pedido coinciden con el monto
  "confianza": number, // 0-100, qué tan seguro estás
  "productosIdentificados": [
    {
      "id": "ID del producto",
      "nombre": "Nombre del producto",
      "cantidad": number,
      "precio": number,
      "razon": "Por qué crees que es este producto"
    }
  ],
  "alternativas": [ // Productos alternativos posibles
    {
      "id": "ID del producto",
      "nombre": "Nombre del producto",
      "cantidad": number,
      "precio": number,
      "probabilidad": number // 0-100
    }
  ],
  "analisis": "Explicación detallada de tu análisis",
  "recomendacion": "Qué acción recomiendas (confirmar, revisar manualmente, contactar cliente, etc.)"
}`;

    // Llamar a la AI
    let aiResponse;
    try {
      const result = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: prompt,
        temperature: 0.3, // Baja temperatura para respuestas más precisas
        maxTokens: 1000,
      });

      // Extraer el JSON de la respuesta
      const responseText = result.text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No se pudo extraer JSON de la respuesta de AI');
      }

    } catch (aiError) {
      console.error('Error llamando a OpenAI:', aiError);
      return NextResponse.json(
        {
          error: 'Error al analizar con AI',
          fallback: true,
          message: 'No se pudo procesar con AI. Revisa manualmente el pedido.',
          order: order
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      order: order,
      aiAnalysis: aiResponse,
      montoPagado: montoPedido,
      precioOriginalEstimado: precioOriginalEstimado,
      descuentoAplicado: descuentoAplicado
    });

  } catch (error) {
    console.error('[API] Error in verify-order-ai:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
