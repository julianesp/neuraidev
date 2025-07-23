import { NextResponse } from "next/server";
import { query } from "../../../../lib/db.js";
import crypto from "crypto";

function verifyUserToken(token) {
  try {
    const secret = process.env.USER_SECRET || "neuraidev-user-secret-2024";
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, username, timestamp, hash] = decoded.split(":");
    
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    
    if (tokenAge > maxAge) {
      return { valid: false, error: "Token expirado" };
    }
    
    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(`${userId}:${username}:${timestamp}`)
      .digest("hex");
    
    if (hash === expectedHash) {
      return { valid: true, userId: parseInt(userId), username };
    } else {
      return { valid: false, error: "Token inválido" };
    }
  } catch (error) {
    return { valid: false, error: "Token malformado" };
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 401 }
      );
    }

    const verification = verifyUserToken(token);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error },
        { status: 401 }
      );
    }

    const { businessId, planId, amount, currency } = await request.json();

    // Validaciones
    if (!businessId || !planId || !amount) {
      return NextResponse.json(
        { error: "businessId, planId y amount son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el negocio pertenece al usuario
    const businessCheck = await query(
      'SELECT * FROM business_accounts WHERE id = $1 AND user_id = $2',
      [businessId, verification.userId]
    );

    if (businessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Negocio no encontrado o no tienes permisos" },
        { status: 404 }
      );
    }

    // Verificar que el plan existe
    const planCheck = await query(
      'SELECT * FROM subscription_plans WHERE id = $1 AND active = true',
      [planId]
    );

    if (planCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Plan no encontrado" },
        { status: 404 }
      );
    }

    // Generar un ID único para la factura
    const invoiceId = `NRD-${businessId}-${Date.now()}`;

    // Crear el registro de pago
    const paymentResult = await query(
      `INSERT INTO business_payments 
       (business_id, amount, currency, status, payment_method) 
       VALUES ($1, $2, $3, 'pending', 'epayco') 
       RETURNING *`,
      [businessId, amount, currency || 'COP']
    );

    const payment = paymentResult.rows[0];

    // Actualizar con el invoice ID
    await query(
      'UPDATE business_payments SET stripe_payment_intent_id = $1 WHERE id = $2',
      [invoiceId, payment.id]
    );

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      invoiceId: invoiceId,
      amount: amount,
      currency: currency || 'COP'
    });

  } catch (error) {
    console.error("Error creando pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}