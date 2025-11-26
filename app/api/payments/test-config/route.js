import { NextResponse } from "next/server";

/**
 * Endpoint para verificar configuración de variables de entorno
 * GET /api/payments/test-config
 */
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
  const privateKey = process.env.EPAYCO_PRIVATE_KEY;
  const custId = process.env.EPAYCO_CUST_ID;
  const testMode = process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return NextResponse.json({
    status: "config-check",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: {
      NEXT_PUBLIC_EPAYCO_PUBLIC_KEY: publicKey
        ? `✅ Configurada (${publicKey.substring(0, 10)}...)`
        : "❌ NO configurada",
      EPAYCO_PRIVATE_KEY: privateKey
        ? `✅ Configurada (${privateKey.substring(0, 10)}...)`
        : "❌ NO configurada",
      EPAYCO_CUST_ID: custId ? `✅ Configurada (${custId})` : "❌ NO configurada",
      NEXT_PUBLIC_EPAYCO_TEST_MODE: testMode || "❌ NO configurada",
      NEXT_PUBLIC_SITE_URL: siteUrl || "❌ NO configurada",
    },
    allConfigured:
      !!publicKey && !!privateKey && !!custId && !!testMode && !!siteUrl,
    message: !!publicKey && !!privateKey
      ? "✅ Credenciales básicas configuradas"
      : "❌ FALTA configurar credenciales de ePayco en Vercel",
    nextSteps: !publicKey || !privateKey
      ? [
          "1. Ve a https://vercel.com/dashboard",
          "2. Selecciona tu proyecto",
          "3. Settings → Environment Variables",
          "4. Agrega NEXT_PUBLIC_EPAYCO_PUBLIC_KEY",
          "5. Agrega EPAYCO_PRIVATE_KEY",
          "6. Agrega EPAYCO_CUST_ID",
          "7. Redeploy el proyecto",
        ]
      : [
          "✅ Variables configuradas correctamente",
          "Si el error persiste, verifica que las credenciales sean correctas",
        ],
  });
}
