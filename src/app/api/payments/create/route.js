import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API para crear una sesión de pago con ePayco Smart Checkout v2
 * POST /api/payments/create
 *
 * Documentación: https://docs.epayco.com/docs/checkout-implementacion
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { cart, customer } = body;

    // Validar datos requeridos
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 },
      );
    }

    if (!customer || !customer.email || !customer.name || !customer.phone) {
      return NextResponse.json(
        { error: "Información del cliente incompleta" },
        { status: 400 },
      );
    }

    // Calcular total del carrito
    const total = cart.reduce((sum, item) => {
      const precio = item.precio || item.price || 0;
      const cantidad = item.cantidad || item.quantity || 1;
      return sum + precio * cantidad;
    }, 0);

    // Validar que el monto sea mayor a 0
    if (total <= 0) {
      return NextResponse.json(
        { error: "El monto total debe ser mayor a 0" },
        { status: 400 },
      );
    }

    // Generar número de factura único
    const invoice = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Crear descripción del pedido
    const description = cart
      .map(
        (item) =>
          `${item.cantidad || 1}x ${item.nombre || item.name || "Producto"}`,
      )
      .join(", ")
      .substring(0, 200);

    // Guardar orden en Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        invoice,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_document: customer.document || null,
        items: cart,
        total,
        status: "pending",
        payment_method: "epayco",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("❌ Error creating order:", orderError);
      return NextResponse.json(
        { error: "Error al crear la orden" },
        { status: 500 },
      );
    }

    // Obtener la URL base
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_SITE_URL || "https://www.neurai.dev";

    // Obtener IP del cliente
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "186.84.0.0";

    // Crear sesión de pago con ePayco Smart Checkout v2
    const sessionData = {
      checkout_version: "2",
      name: "Neurai.dev",
      description: description,
      currency: "COP",
      amount: total.toString(),
      lang: "ES",
      country: "CO",
      taxBase: "0",
      tax: "0",
      taxIco: "0",
      external: "false",

      // URLs de callback
      response: `${baseUrl}/respuesta-pago`,
      confirmation: `${baseUrl}/api/payments/confirmation`,
      methodConfirmation: "GET",

      // Datos del comprador
      billing: {
        name: customer.name,
        email: customer.email,
        address: customer.address || "Calle 1 # 1-1",
        typeDoc: customer.docType || "CC",
        numberDoc: customer.document || "000000000",
        mobilePhone: customer.phone,
      },

      // Información adicional
      extra1: order.id.toString(),
      extra2: customer.email,
      extra3: invoice,
      invoice: invoice,

      // IP del cliente
      ip: ip,

      // Modo test
      test: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === "true",
    };

    // Primero obtener el token Bearer de ePayco
    const authResponse = await fetch("https://apify.epayco.co/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY}:${process.env.EPAYCO_PRIVATE_KEY}`,
        ).toString("base64")}`,
      },
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error("❌ ePayco Auth Error:", authError);
      throw new Error(
        `Error de autenticación con ePayco: ${authResponse.status}`,
      );
    }

    const authData = await authResponse.json();
    const bearerToken = authData.token;

    if (!bearerToken) {
      throw new Error("No se pudo obtener el token de autenticación de ePayco");
    }

    // Ahora crear la sesión de pago con el token Bearer
    const epaycoResponse = await fetch(
      "https://apify.epayco.co/payment/session/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(sessionData),
      },
    );

    if (!epaycoResponse.ok) {
      const errorText = await epaycoResponse.text();
      console.error("❌ ePayco API Error:", errorText);
      throw new Error(
        `ePayco API error: ${epaycoResponse.status} - ${errorText}`,
      );
    }

    const epaycoData = await epaycoResponse.json();

    // El sessionId viene dentro de data.sessionId
    const sessionId = epaycoData.data?.sessionId;

    // Verificar que se recibió el sessionId
    if (!epaycoData.success || !sessionId) {
      console.error(
        "❌ Invalid ePayco response:",
        JSON.stringify(epaycoData, null, 2),
      );
      // Si hay errores de validación, mostrarlos
      if (epaycoData.data && epaycoData.data.errors) {
        console.error(
          "❌ Validation errors:",
          JSON.stringify(epaycoData.data.errors, null, 2),
        );
      }
      const errorMsg =
        epaycoData.textResponse ||
        epaycoData.message ||
        "Error al crear la sesión de pago";
      throw new Error(errorMsg);
    }

    // Actualizar la orden con el sessionId
    await supabase
      .from("orders")
      .update({
        ref_payco: sessionId,
        payment_response: {
          sessionId: sessionId,
          method: "smart_checkout_v2",
          created_at: new Date().toISOString(),
        },
      })
      .eq("id", order.id);

    // Retornar sessionId para usar en el frontend
    return NextResponse.json({
      success: true,
      orderId: order.id,
      invoice,
      sessionId: sessionId,
      transactionId: invoice,
    });
  } catch (error) {
    console.error("❌ Error in payment creation:", error);
    return NextResponse.json(
      { error: "Error al procesar el pago", details: error.message },
      { status: 500 },
    );
  }
}
