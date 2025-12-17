import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';
import { createInvoiceRecord } from '@/lib/invoiceGenerator';

const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.warn('[DEV]', ...args);
const logError = (...args) => console.error(...args);

/**
 * API Route para generar una factura electrónica
 * POST /api/invoices/generate
 *
 * Body: { orderReference: string }
 *
 * Este endpoint:
 * 1. Busca la orden por su referencia
 * 2. Verifica que la orden esté pagada
 * 3. Crea o retorna la factura existente
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderReference } = body;

    if (!orderReference) {
      return NextResponse.json(
        { error: 'Se requiere la referencia de la orden' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Buscar la orden
    log('🔍 Buscando orden:', orderReference);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('numero_orden', orderReference)
      .single();

    if (orderError || !order) {
      logError('❌ Orden no encontrada:', orderReference);
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // 2. Verificar que la orden esté pagada
    if (order.estado_pago !== 'completado' && order.estado !== 'completado' && order.estado !== 'pagado') {
      log('⚠️ La orden no está pagada aún. Estado:', order.estado, '| Estado de pago:', order.estado_pago);
      return NextResponse.json(
        { error: 'La orden aún no ha sido pagada' },
        { status: 400 }
      );
    }

    // 3. Verificar si ya existe una factura para esta orden
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_reference', orderReference)
      .single();

    if (existingInvoice) {
      log('✅ Factura ya existe:', existingInvoice.invoice_number);
      return NextResponse.json({
        success: true,
        invoice: existingInvoice,
        message: 'Factura ya existente',
      });
    }

    // 4. Crear la factura
    log('📄 Creando nueva factura...');

    const invoice = await createInvoiceRecord(
      supabase,
      order,
      order.payment_response
    );

    log('✅ Factura creada:', invoice.invoice_number);

    return NextResponse.json({
      success: true,
      invoice,
      message: 'Factura generada exitosamente',
    });
  } catch (error) {
    logError('❌ Error generando factura:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET para verificar el estado del endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/invoices/generate',
    methods: ['POST'],
    description: 'Genera una factura electrónica para una orden pagada',
  });
}
