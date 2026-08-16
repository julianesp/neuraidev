import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseClient, d1Select } from "@/lib/db";

// Solo loguear en desarrollo
const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.warn("[DEV ePayco]", ...args);
const logError = (...args) => console.error(...args);

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

// Configuración de CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Manejo de preflight requests (OPTIONS)
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Obtener IP del cliente
 */
function getClientIp(request) {
  // Intentar obtener IP desde headers de proxies comunes
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (real) {
    return real;
  }

  // IP de fallback (puede ser la IP del servidor en desarrollo)
  return "186.97.212.162";
}

/**
 * Recalcula el total de la compra en el servidor usando los precios reales
 * de la tabla `products` en D1. No se confía en `amount` ni en `items[].price`
 * enviados por el cliente (cualquiera puede manipularlos desde el navegador o
 * la app). Si algún producto no existe en el catálogo, la sesión se rechaza.
 *
 * @returns {{ ok: true, total: number, items: Array } | { ok: false, error: string }}
 */
async function recalcularTotalServidor(items) {
  const normalizados = [];

  for (const item of items) {
    const id = item.id || item.productId;
    if (!id) {
      return { ok: false, error: "Hay productos sin identificador en el carrito" };
    }
    const cantidad = Math.min(Math.max(parseInt(item.quantity || item.cantidad, 10) || 1, 1), 999);
    normalizados.push({ id, name: item.name || item.nombre, cantidad });
  }

  const ids = [...new Set(normalizados.map((i) => i.id))];
  const placeholders = ids.map(() => "?").join(", ");
  const rows = await d1Select(
    `SELECT id, nombre, precio FROM products WHERE id IN (${placeholders})`,
    ids,
  );
  const porId = new Map((rows || []).map((p) => [String(p.id), p]));

  let total = 0;
  const itemsVerificados = [];

  for (const item of normalizados) {
    const producto = porId.get(String(item.id));
    const precio = producto ? Number(producto.precio) : NaN;

    if (!producto || !Number.isFinite(precio) || precio <= 0) {
      return {
        ok: false,
        error: `Producto no válido o sin precio en el catálogo: ${item.name || item.id}`,
      };
    }

    total += precio * item.cantidad;
    itemsVerificados.push({
      id: item.id,
      name: producto.nombre || item.name,
      quantity: item.cantidad,
      price: precio,
    });
  }

  return { ok: true, total: Math.round(total), items: itemsVerificados };
}

/**
 * API Route para crear sesión de pago con ePayco
 * POST /api/payments/epayco/create-session
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      amount,
      description,
      reference,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerRegion,
      customerTypeDoc,
      customerNumberDoc,
      items = [],
      // Opcional: solo lo envía la app móvil (usuario Clerk). La web no lo manda,
      // así la orden queda con clerk_user_id = null igual que antes.
      clerkUserId = null,
    } = body;

    // Validar datos requeridos
    if (!amount || !reference || !customerEmail || !customerName) {
      return NextResponse.json(
        {
          error:
            "Faltan datos requeridos: amount, reference, customerEmail, customerName",
        },
        { status: 400 },
      );
    }

    // Obtener credenciales de ePayco desde variables de entorno
    const epaycoPublicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
    const epaycoPrivateKey = process.env.EPAYCO_PRIVATE_KEY;

    if (!epaycoPublicKey || !epaycoPrivateKey) {
      logError("❌ Faltan credenciales de ePayco");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 },
      );
    }

    log("🔐 Creando sesión de pago ePayco...");
    log("📦 Datos recibidos:", {
      amount,
      reference,
      customerEmail,
      customerName,
    });

    // Validar que todos los datos de cliente sean strings válidos
    const sanitizeString = (value, defaultValue = "") => {
      if (!value) return defaultValue.toString();
      return String(value).trim();
    };

    const sanitizeEmail = (email) => {
      return String(email || "")
        .toLowerCase()
        .trim();
    };

    // Recalcular el monto en el servidor. Si vienen items, el total sale de los
    // precios reales en D1 y el `amount` del cliente solo se usa para detectar
    // manipulación. Sin items (flujos legacy) se mantiene el amount recibido.
    let finalAmount = Math.round(Number(amount));
    let verifiedItems = null;

    if (Array.isArray(items) && items.length > 0) {
      const recalculo = await recalcularTotalServidor(items);
      if (!recalculo.ok) {
        logError("🚫 Sesión ePayco rechazada:", recalculo.error);
        return NextResponse.json(
          { error: recalculo.error },
          { status: 400, headers: corsHeaders },
        );
      }

      if (Math.abs(recalculo.total - Number(amount)) > 1) {
        logError(
          `⚠️ Monto del cliente (${amount}) difiere del calculado en servidor (${recalculo.total}) para ref ${reference}. Se usa el del servidor.`,
        );
      }

      finalAmount = recalculo.total;
      verifiedItems = recalculo.items;
    } else {
      logError(
        `⚠️ Sesión ePayco sin items (ref ${reference}); no se puede verificar el monto ${amount} contra el catálogo.`,
      );
    }

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      return NextResponse.json(
        { error: "Monto de la compra inválido" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Calcular impuestos (IVA 19% en Colombia)
    const taxRate = 0.19;
    const taxBase = finalAmount / (1 + taxRate);
    const tax = finalAmount - taxBase;

    // Obtener IP del cliente
    const clientIp = getClientIp(request);

    log("💰 Impuestos calculados:", { finalAmount, taxBase, tax });

    // Guardar la orden en Supabase ANTES de procesar el pago
    try {
      const supabase = getSupabaseClient();

      // Items con precios verificados contra D1 (o normalización legacy si no hubo items)
      const normalizedItems =
        verifiedItems ||
        items.map((item) => ({
          id: item.id || item.productId,
          name: item.name || item.nombre,
          quantity: item.quantity || item.cantidad || 1,
          price: item.price || item.precio || 0,
        }));

      const { error: orderError } = await supabase.from("orders").insert({
        // orders.id es TEXT NOT NULL sin default en D1: hay que generarlo aquí
        id: crypto.randomUUID(),
        clerk_user_id: clerkUserId,
        numero_orden: reference,
        estado: "pendiente",
        customer_name: customerName || "Cliente",
        customer_email: customerEmail,
        customer_phone: customerPhone || "",
        direccion_envio: customerAddress || "Pendiente de confirmar",
        metodo_pago: "epayco",
        referencia_pago: reference,
        total: finalAmount,
        subtotal: taxBase,
        impuestos: tax,
        costo_envio: 0,
        descuentos: 0,
        estado_pago: "pendiente",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          productos: normalizedItems,
          source: "epayco_checkout",
          customer_city: customerCity,
          customer_region: customerRegion,
          customer_type_doc: customerTypeDoc,
          customer_number_doc: customerNumberDoc,
        },
      });

      if (orderError) {
        logError("⚠️ Error guardando orden:", orderError);
      } else {
        log("✅ Orden guardada exitosamente con referencia:", reference);
      }
    } catch (dbError) {
      logError("⚠️ Error de BD", dbError);
    }

    // Configuración para ePayco Checkout
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev";

    // IMPORTANTE: Sanitizar TODOS los valores para evitar errores de toLowerCase
    const sanitizedConfig = {
      // ========== CAMPOS OBLIGATORIOS ==========
      key: sanitizeString(epaycoPublicKey),
      test: process.env.EPAYCO_TEST_MODE === "true",

      // ========== INFORMACIÓN DE LA TRANSACCIÓN ==========
      name: sanitizeString(description, "Compra en neurai.dev"),
      description: sanitizeString(
        description,
        `Compra de ${items.length} producto(s)`,
      ),
      invoice: sanitizeString(reference),
      currency: "cop", // Debe estar en minúsculas según documentación oficial
      amount: finalAmount.toString(),
      tax_base: Number(taxBase).toFixed(2),
      tax: Number(tax).toFixed(2),
      country: "co", // Debe estar en minúsculas según documentación oficial
      lang: "es",

      // ========== INFORMACIÓN DEL CLIENTE (FACTURACIÓN) ==========
      name_billing: sanitizeString(customerName, "Cliente"),
      email_billing: sanitizeEmail(customerEmail),
      mobilephone_billing: sanitizeString(customerPhone),
      address_billing: sanitizeString(customerAddress, "Calle sin especificar"),
      city_billing: sanitizeString(customerCity, "Bogotá"),
      type_doc_billing: sanitizeString(customerTypeDoc, "CC"),
      number_doc_billing: sanitizeString(customerNumberDoc),

      // ========== INFORMACIÓN DE ENVÍO ==========
      name_shipping: sanitizeString(customerName, "Cliente"),
      address_shipping: sanitizeString(
        customerAddress,
        "Calle sin especificar",
      ),
      city_shipping: sanitizeString(customerCity, "Bogotá"),
      type_doc_shipping: sanitizeString(customerTypeDoc, "CC"),
      mobilephone_shipping: sanitizeString(customerPhone),

      // ========== TRACKING Y REFERENCIA ==========
      extra1: sanitizeString(reference),
      extra2: sanitizeString(customerCity),
      extra3: sanitizeString(customerRegion),

      // ========== URLs DE RESPUESTA ==========
      response: sanitizeString(`${baseUrl}/respuesta-pago`),
      confirmation: sanitizeString(
        `${baseUrl}/api/payments/epayco/confirmation`,
      ),

      // ========== IP DEL CLIENTE ==========
      ip: sanitizeString(clientIp),

      // ========== CONFIGURACIÓN AVANZADA ==========
      external: "false", // "false" = lightbox modal, "true" = ventana externa
      autoclick: false,
      method_confirmation: "POST",
      methodsDisable: [],
    };

    log("✅ Configuración de ePayco creada:");
    log("  - key:", sanitizedConfig.key.substring(0, 8) + "...");
    log("  - invoice:", sanitizedConfig.invoice);
    log("  - amount:", sanitizedConfig.amount);
    log("  - name_billing:", sanitizedConfig.name_billing);
    log("  - email_billing:", sanitizedConfig.email_billing);
    log("  - Todos los campos sanitizados para evitar errores");

    // Retornar configuración para el frontend
    return NextResponse.json(
      {
        success: true,
        config: sanitizedConfig,
        reference: reference,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    logError("❌ Error en create-session ePayco:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500, headers: corsHeaders },
    );
  }
}

/**
 * GET para verificar que la API está funcionando
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "API de pagos ePayco activa",
      endpoint: "/api/payments/epayco/create-session",
      methods: ["GET", "POST", "OPTIONS"],
      timestamp: new Date().toISOString(),
    },
    { headers: corsHeaders },
  );
}
