import { NextResponse } from "next/server";
import { sendTestNotification } from "@/lib/notificationService";

/**
 * Endpoint de prueba para verificar notificaciones de Telegram
 * GET /api/test-notification
 */
export async function GET() {
  try {
    const result = await sendTestNotification();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "✅ Notificación de prueba enviada exitosamente. Revisa tu Telegram.",
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: result.details,
        help: "Revisa el archivo CONFIGURAR-NOTIFICACIONES-TELEGRAM.md para instrucciones de configuración",
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
