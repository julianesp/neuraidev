import { NextResponse } from "next/server";
import { query } from "../../../../lib/db.js";
import crypto from "crypto";

function verifyUserToken(token) {
  try {
    const secret = process.env.USER_SECRET || "neuraidev-user-secret-2024";
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, username, timestamp, hash] = decoded.split(":");
    
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    
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

    const {
      businessName,
      businessType,
      description,
      email,
      phone,
      address,
      website,
      categoryId,
      planId
    } = await request.json();

    // Validaciones
    if (!businessName || !businessType || !email || !categoryId) {
      return NextResponse.json(
        { error: "Campos requeridos: businessName, businessType, email, categoryId" },
        { status: 400 }
      );
    }

    // Verificar que el usuario no tenga ya un negocio
    const existingBusiness = await query(
      'SELECT id FROM business_accounts WHERE user_id = $1',
      [verification.userId]
    );

    if (existingBusiness.rows.length > 0) {
      return NextResponse.json(
        { error: "Ya tienes un negocio registrado" },
        { status: 409 }
      );
    }

    // Obtener el ID de la categoría
    const categoryResult = await query(
      'SELECT id FROM categorias WHERE name = $1',
      [categoryId]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Categoría no válida" },
        { status: 400 }
      );
    }

    const categoryDbId = categoryResult.rows[0].id;

    // Calcular fecha de fin del trial (14 días)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Crear el negocio
    const businessResult = await query(
      `INSERT INTO business_accounts 
       (user_id, business_name, business_type, description, email, phone, address, website, category_id, trial_ends_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        verification.userId,
        businessName,
        businessType,
        description || null,
        email,
        phone || null,
        address || null,
        website || null,
        categoryDbId,
        trialEndsAt
      ]
    );

    const newBusiness = businessResult.rows[0];

    // Si se seleccionó un plan, crear la suscripción
    if (planId) {
      // Verificar que el plan existe
      const planResult = await query(
        'SELECT * FROM subscription_plans WHERE id = $1 AND active = true',
        [planId]
      );

      if (planResult.rows.length > 0) {
        const plan = planResult.rows[0];
        
        // Crear la suscripción (comenzará después del trial)
        const subscriptionStartsAt = new Date(trialEndsAt);
        const subscriptionEndsAt = new Date(subscriptionStartsAt);
        subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + plan.duration_days);

        await query(
          `INSERT INTO business_subscriptions 
           (business_id, plan_id, status, starts_at, ends_at) 
           VALUES ($1, $2, 'pending', $3, $4)`,
          [newBusiness.id, planId, subscriptionStartsAt, subscriptionEndsAt]
        );
      }
    }

    return NextResponse.json({
      success: true,
      business: {
        id: newBusiness.id,
        businessName: newBusiness.business_name,
        status: newBusiness.status,
        trialEndsAt: newBusiness.trial_ends_at
      },
      message: "Negocio registrado exitosamente. Trial de 14 días iniciado."
    }, { status: 201 });

  } catch (error) {
    console.error("Error registrando negocio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}