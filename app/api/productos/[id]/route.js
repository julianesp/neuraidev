import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserWithRole } from '@/lib/auth/server-roles';
import { authenticateRequest } from '@/lib/auth/api-auth';
import { d1Select, d1Execute } from '@/lib/db-d1';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { userId } = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const rows = await d1Select('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const producto = rows[0];
    if (producto.metadata && typeof producto.metadata === 'string') {
      try { producto.metadata = JSON.parse(producto.metadata); } catch {}
    }
    if (producto.imagenes && typeof producto.imagenes === 'string') {
      try { producto.imagenes = JSON.parse(producto.imagenes); } catch {}
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('❌ [API] Error inesperado GET producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId, isAdmin } = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Datos inválidos. Debe enviar JSON válido.' }, { status: 400 });
    }

    // Verificar que el producto existe (y pertenece al usuario si no es admin)
    let checkSql = 'SELECT id FROM products WHERE id = ?';
    const checkParams = [id];
    if (!isAdmin) {
      checkSql += ' AND clerk_user_id = ?';
      checkParams.push(userId);
    }
    const existing = await d1Select(checkSql, checkParams);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Preparar campos a actualizar
    const allowed = [
      'nombre', 'descripcion', 'precio', 'precio_oferta', 'categoria',
      'marca', 'stock', 'sku', 'disponible', 'destacado', 'vista_horizontal',
      'garantia', 'imagen_principal', 'imagenes', 'video_url', 'video_type', 'metadata',
    ];

    const setClauses = [];
    const setParams = [];

    for (const key of allowed) {
      if (key in body) {
        let val = body[key];
        if (val !== null && typeof val === 'object') val = JSON.stringify(val);
        else if (typeof val === 'boolean') val = val ? 1 : 0;
        setClauses.push(`${key} = ?`);
        setParams.push(val);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    setClauses.push('updated_at = ?');
    setParams.push(new Date().toISOString());
    setParams.push(id);

    await d1Execute(
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`,
      setParams
    );

    const updated = await d1Select('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    const producto = updated[0];
    if (producto?.metadata && typeof producto.metadata === 'string') {
      try { producto.metadata = JSON.parse(producto.metadata); } catch {}
    }
    if (producto?.imagenes && typeof producto.imagenes === 'string') {
      try { producto.imagenes = JSON.parse(producto.imagenes); } catch {}
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('❌ [API] Error inesperado PUT producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId, isAdmin } = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;

    let sql = 'DELETE FROM products WHERE id = ?';
    const sqlParams = [id];
    if (!isAdmin) {
      sql += ' AND clerk_user_id = ?';
      sqlParams.push(userId);
    }

    await d1Execute(sql, sqlParams);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [API] Error inesperado DELETE producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
