/**
 * Script de diagnóstico para verificar configuración de notificaciones
 *
 * Uso: node scripts/test-notifications.js
 */

console.log("🔍 Verificando configuración de notificaciones...\n");

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

// Verificar Telegram
console.log("📱 TELEGRAM:");
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

if (telegramToken && telegramChatId) {
  console.log("  ✅ TELEGRAM_BOT_TOKEN configurado:", telegramToken.substring(0, 20) + "...");
  console.log("  ✅ TELEGRAM_ADMIN_CHAT_ID configurado:", telegramChatId);

  // Probar conexión con Telegram
  (async () => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramToken}/getMe`);
      const data = await response.json();

      if (data.ok) {
        console.log(`  ✅ Bot conectado correctamente: @${data.result.username}`);

        // Intentar enviar un mensaje de prueba
        console.log("\n  📤 Enviando mensaje de prueba...");
        const sendResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: "🧪 Mensaje de prueba desde el script de diagnóstico\n\n✅ Tu configuración de Telegram está funcionando correctamente!"
          })
        });

        const sendData = await sendResponse.json();

        if (sendData.ok) {
          console.log("  ✅ ¡Mensaje de prueba enviado exitosamente!");
          console.log("  👀 Revisa tu Telegram ahora");
        } else {
          console.log("  ❌ Error al enviar mensaje:", sendData.description);
          if (sendData.error_code === 400) {
            console.log("  💡 Sugerencia: Verifica que el CHAT_ID sea correcto");
            console.log("  💡 Asegúrate de haber enviado al menos un mensaje al bot primero");
          }
        }
      } else {
        console.log("  ❌ Error: Bot token inválido");
      }
    } catch (error) {
      console.log("  ❌ Error de conexión:", error.message);
    }
  })();
} else {
  console.log("  ❌ Telegram NO configurado");
  console.log("  💡 Agrega TELEGRAM_BOT_TOKEN y TELEGRAM_ADMIN_CHAT_ID a .env.local");
  console.log("  📖 Lee CONFIGURAR-NOTIFICACIONES.md para instrucciones");
}

// Verificar Email (Resend)
console.log("\n📧 EMAIL (RESEND):");
const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@neurai.dev';

if (resendApiKey) {
  console.log("  ✅ RESEND_API_KEY configurado:", resendApiKey.substring(0, 10) + "...");
  console.log("  ✅ ADMIN_NOTIFICATION_EMAIL:", adminEmail);
  console.log("  💡 Para probar email, visita: http://localhost:3000/api/test-notification?mode=full");
} else {
  console.log("  ⚠️  Resend NO configurado (opcional)");
  console.log("  💡 Si quieres recibir emails además de Telegram:");
  console.log("     1. Crea una cuenta en https://resend.com (gratis)");
  console.log("     2. Obtén tu API key");
  console.log("     3. Agrégala a .env.local como RESEND_API_KEY=re_xxxxx");
  console.log("  📖 Lee CONFIGURAR-NOTIFICACIONES.md para más detalles");
}

console.log("\n" + "=".repeat(60));
console.log("📝 RESUMEN:");
console.log("=".repeat(60));

const telegramConfigured = telegramToken && telegramChatId;
const emailConfigured = resendApiKey;

if (telegramConfigured || emailConfigured) {
  console.log("✅ Al menos un método de notificación está configurado");
  if (telegramConfigured) console.log("  • Telegram: Configurado");
  if (emailConfigured) console.log("  • Email: Configurado");

  console.log("\n🧪 Para probar tus notificaciones:");
  console.log("  • Prueba simple: http://localhost:3000/api/test-notification");
  console.log("  • Prueba completa: http://localhost:3000/api/test-notification?mode=full");
} else {
  console.log("❌ Ningún método de notificación configurado");
  console.log("\n💡 Configura al menos uno:");
  console.log("  1. Telegram (Recomendado - Gratis e instantáneo)");
  console.log("  2. Email con Resend (Respaldo - 100 emails/día gratis)");
  console.log("\n📖 Lee CONFIGURAR-NOTIFICACIONES.md para instrucciones completas");
}

console.log("\n");
