import { query } from '../lib/db.js';

export class ProductModel {
  static async findAll() {
    const result = await query('SELECT * FROM productos ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM productos WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(productData) {
    const { nombre, descripcion, precio, categoria, imagen_principal, imagenes } = productData;
    const result = await query(
      'INSERT INTO productos (nombre, descripcion, precio, categoria, imagen_principal, imagenes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, descripcion, precio, categoria, imagen_principal, JSON.stringify(imagenes || [])]
    );
    return result.rows[0];
  }

  static async update(id, productData) {
    const { nombre, descripcion, precio, categoria, imagen_principal, imagenes } = productData;
    const result = await query(
      'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, categoria = $4, imagen_principal = $5, imagenes = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [nombre, descripcion, precio, categoria, imagen_principal, JSON.stringify(imagenes || []), id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByCategory(categoria) {
    const result = await query('SELECT * FROM productos WHERE categoria = $1 ORDER BY created_at DESC', [categoria]);
    return result.rows;
  }
}
