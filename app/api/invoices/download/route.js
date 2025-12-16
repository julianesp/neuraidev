import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';
import { generateInvoicePDF } from '@/lib/invoiceGenerator';

const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.warn('[DEV]', ...args);
const logError = (...args) => console.error(...args);

/**
 * API Route para descargar una factura en PDF
 * GET /api/invoices/download?reference=ORDER_REF
 *
 * Query params:
 * - reference: Referencia de la orden
 *
 * Retorna un PDF descargable
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderReference = searchParams.get('reference');

    if (!orderReference) {
      return NextResponse.json(
        { error: 'Se requiere la referencia de la orden' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Buscar la factura por referencia de orden
    log('🔍 Buscando factura para orden:', orderReference);

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_reference', orderReference)
      .single();

    if (invoiceError || !invoice) {
      logError('❌ Factura no encontrada para orden:', orderReference);
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    log('✅ Factura encontrada:', invoice.invoice_number);

    // 2. Generar el PDF
    log('📄 Generando PDF...');

    const pdfBuffer = await generateInvoicePDF(invoice);

    log('✅ PDF generado exitosamente');

    // 3. Retornar el PDF como descarga
    const filename = `Factura_${invoice.invoice_number}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    logError('❌ Error descargando factura:', error);
    return NextResponse.json(
      {
        error: 'Error generando el PDF',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
