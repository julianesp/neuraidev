import { NextResponse } from "next/server";
import { sendTestNotification } from "@/lib/notificationService";
import { notifyNewSale } from "@/lib/notificationService";

/**
 * Endpoint de prueba para verificar notificaciones de Telegram y Email
 * GET /api/test-notification
 * GET /api/test-notification?mode=full - Prueba completa con datos de venta
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    // Modo de prueba completo con datos reales de venta
    if (mode === 'full') {
      console.log("🧪 Modo de prueba COMPLETO - Simulando venta real");

      const mockOrder = {
        numero_orden: "TEST-" + Date.now(),
        customer_name: "Cliente de Prueba",
        customer_email: "test@example.com",
        metadata: {
          productos: [
            { nombre: "Producto 1", cantidad: 2 },
            { nombre: "Producto 2", cantidad: 1 }
          ]
        }
      };

      const mockTransaction = {
        id: "test_transaction_" + Date.now(),
        status: "APPROVED",
        amount_in_cents: 150000, // $1,500 COP
        payment_method: { type: "CARD" },
        customer_email: "test@example.com"
      };

      const result = await notifyNewSale(mockOrder, mockTransaction);

      if (result) {
        return NextResponse.json({
          success: true,
          message: "✅ Notificación de venta de prueba enviada exitosamente. Revisa tu Telegram y/o Email.",
          mode: "full",
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "No se pudo enviar ninguna notificación. Verifica la configuración.",
          help: "Revisa el archivo CONFIGURAR-NOTIFICACIONES.md para instrucciones",
        }, { status: 400 });
      }
    }

    // Modo de prueba simple (por defecto)
    const result = await sendTestNotification();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "✅ Notificación de prueba enviada exitosamente. Revisa tu Telegram.",
        mode: "simple",
        tip: "Usa /api/test-notification?mode=full para probar con datos de venta completos"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: result.details,
        help: "Revisa el archivo CONFIGURAR-NOTIFICACIONES.md para instrucciones de configuración",
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Error al enviar notificación de prueba",
      details: error.message,
    }, { status: 500 });
  }
}
