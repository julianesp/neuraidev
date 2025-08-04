import { query } from '../lib/db.js';
import { AdminModel } from './AdminModel.js';

export class ProductModel {
  static async findAll() {
    const result = await query('SELECT * FROM productos ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM productos WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(productData, adminId = null) {
    const { 
      nombre, 
      descripcion, 
      precio, 
      categoria, 
      imagen_principal, 
      imagenes,
      disponible = true,
      cantidad = 0,
      caracteristicas = [],
      peso,
      dimensiones,
      vendido = false
    } = productData;
    
    const result = await query(
      `INSERT INTO productos 
       (nombre, descripcion, precio, categoria, imagen_principal, imagenes, disponible, cantidad, caracteristicas, peso, dimensiones, vendido) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        nombre, 
        descripcion, 
        precio, 
        categoria, 
        imagen_principal, 
        JSON.stringify(imagenes || []),
        disponible,
        cantidad,
        JSON.stringify(caracteristicas || []),
        peso,
        dimensiones,
        vendido
      ]
    );

    const newProduct = result.rows[0];
    
    // Registrar en audit log si hay admin
    if (adminId) {
      await AdminModel.logAction(adminId, 'CREATE', newProduct.id, null, newProduct);
    }
    
    return newProduct;
  }

  static async update(id, productData, adminId = null) {
    // Obtener datos anteriores para auditoría
    const oldProduct = await this.findById(id);
    if (!oldProduct) {
      throw new Error('Producto no encontrado');
    }

    const { 
      nombre, 
      descripcion, 
      precio, 
      categoria, 
      imagen_principal, 
      imagenes,
      disponible,
      cantidad,
      caracteristicas,
      peso,
      dimensiones,
      vendido
    } = productData;
    
    const result = await query(
      `UPDATE productos SET 
       nombre = $1, descripcion = $2, precio = $3, categoria = $4, 
       imagen_principal = $5, imagenes = $6, disponible = $7, cantidad = $8,
       caracteristicas = $9, peso = $10, dimensiones = $11, vendido = $12,
       updated_at = CURRENT_TIMESTAMP 
       WHERE id = $13 RETURNING *`,
      [
        nombre, 
        descripcion, 
        precio, 
        categoria, 
        imagen_principal, 
        JSON.stringify(imagenes || []),
        disponible,
        cantidad,
        JSON.stringify(caracteristicas || []),
        peso,
        dimensiones,
        vendido,
        id
      ]
    );

    const updatedProduct = result.rows[0];
    
    // Registrar en audit log si hay admin
    if (adminId) {
      await AdminModel.logAction(adminId, 'UPDATE', id, oldProduct, updatedProduct);
    }
    
    return updatedProduct;
  }

  static async delete(id, adminId = null) {
    // Obtener datos antes de eliminar para auditoría
    const productToDelete = await this.findById(id);
    if (!productToDelete) {
      throw new Error('Producto no encontrado');
    }

    const result = await query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    
    // Registrar en audit log si hay admin
    if (adminId) {
      await AdminModel.logAction(adminId, 'DELETE', id, productToDelete, null);
    }
    
    return result.rows[0];
  }

  static async findByCategory(categoria) {
    const result = await query('SELECT * FROM productos WHERE categoria = $1 ORDER BY created_at DESC', [categoria]);
    return result.rows;
  }

  // Buscar productos por texto
  static async search(searchTerm) {
    const result = await query(
      'SELECT * FROM productos WHERE nombre ILIKE $1 OR descripcion ILIKE $1 ORDER BY created_at DESC',
      [`%${searchTerm}%`]
    );
    return result.rows;
  }

  // Filtrar por rango de precios
  static async findByPriceRange(minPrice, maxPrice) {
    const result = await query(
      'SELECT * FROM productos WHERE precio BETWEEN $1 AND $2 ORDER BY precio ASC',
      [minPrice, maxPrice]
    );
    return result.rows;
  }

  // Obtener productos con paginación
  static async findWithPagination(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await query(
      'SELECT * FROM productos ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    const countResult = await query('SELECT COUNT(*) FROM productos');
    const total = parseInt(countResult.rows[0].count);
    
    return {
      products: result.rows,
      pagination: {
        current_page: page,
        per_page: limit,
        total_items: total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Obtener estadísticas de productos
  static async getStats() {
    const totalResult = await query('SELECT COUNT(*) as total FROM productos');
    const categoriesResult = await query('SELECT categoria, COUNT(*) as count FROM productos GROUP BY categoria ORDER BY count DESC');
    const avgPriceResult = await query('SELECT AVG(precio) as avg_price FROM productos');
    const disponiblesResult = await query('SELECT COUNT(*) as disponibles FROM productos WHERE disponible = TRUE');
    const vendidosResult = await query('SELECT COUNT(*) as vendidos FROM productos WHERE vendido = TRUE');
    
    return {
      total_products: parseInt(totalResult.rows[0].total),
      categories: categoriesResult.rows,
      average_price: parseFloat(avgPriceResult.rows[0].avg_price || 0),
      available_products: parseInt(disponiblesResult.rows[0].disponibles),
      sold_products: parseInt(vendidosResult.rows[0].vendidos)
    };
  }
}
