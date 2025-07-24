import { validateData, schemas, sanitizeObject, isValidObjectId } from '../../../utils/validation.js';
import { adminAuthMiddleware, checkRateLimit } from '../../../utils/auth.js';
import { query } from '../../../lib/db.js';

// GET - Obtener productos (público con rate limiting)
export async function GET(request) {
  try {
    // Rate limiting para consultas
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const rateLimit = checkRateLimit(`products:${clientIp}`, 30, 60 * 1000); // 30 requests por minuto
    
    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Demasiadas consultas. Intenta de nuevo más tarde.' },
        { status: 429 }
      );
    }

    const url = new URL(request.url);
    const categoria = url.searchParams.get('categoria');
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    // Validar parámetros
    if (limit > 100) {
      return Response.json(
        { error: 'El límite máximo es 100 productos' },
        { status: 400 }
      );
    }

    let productsQuery = `
      SELECT id, nombre, descripcion, precio, categoria, imagen_principal, imagenes, created_at, updated_at
      FROM productos
    `;
    
    let queryParams = [];
    
    if (categoria) {
      // Validar categoría
      const validCategories = ['technology', 'health', 'shop', 'general', 'restaurant'];
      if (!validCategories.includes(categoria)) {
        return Response.json(
          { error: 'Categoría no válida' },
          { status: 400 }
        );
      }
      
      productsQuery += ' WHERE categoria = $1';
      queryParams.push(categoria);
    }

    productsQuery += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const result = await query(productsQuery, queryParams);

    return Response.json(result.rows, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
        'X-Total-Count': result.rows.length.toString()
      }
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear producto (solo admin)
async function createProductHandler(request) {
  try {
    const rawData = await request.json();
    const sanitizedData = sanitizeObject(rawData);
    
    // Validar datos de entrada
    const validation = validateData(sanitizedData, schemas.product.create);
    
    if (!validation.isValid) {
      return Response.json(
        { 
          error: 'Datos de entrada inválidos',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const { nombre, descripcion, precio, categoria, imagen_principal, imagenes } = validation.data;

    // Insertar producto
    const insertQuery = `
      INSERT INTO productos (nombre, descripcion, precio, categoria, imagen_principal, imagenes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, nombre, descripcion, precio, categoria, imagen_principal, imagenes, created_at, updated_at
    `;

    const result = await query(insertQuery, [
      nombre,
      descripcion || null,
      precio,
      categoria,
      imagen_principal || null,
      JSON.stringify(imagenes || [])
    ]);

    const newProduct = result.rows[0];

    // Registrar creación del producto
    console.log(`Producto creado: ${newProduct.id} - ${newProduct.nombre}`);

    return Response.json({
      success: true,
      message: 'Producto creado exitosamente',
      product: newProduct
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear producto:', error);
    
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Aplicar middleware de admin para POST
export const POST = adminAuthMiddleware(createProductHandler);

// Método OPTIONS para CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Secret',
      'Access-Control-Max-Age': '86400'
    }
  });
}
