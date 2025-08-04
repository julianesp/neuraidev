import { query } from '../lib/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class AdminModel {
  // Crear nuevo administrador
  static async create(adminData) {
    const { username, email, password, role = 'admin' } = adminData;
    
    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 12);
    
    const result = await query(
      `INSERT INTO admin_users (username, email, password_hash, role, active) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, active, created_at`,
      [username, email, password_hash, role, true]
    );
    
    return result.rows[0];
  }

  // Buscar admin por username o email
  static async findByUsernameOrEmail(identifier) {
    const result = await query(
      'SELECT * FROM admin_users WHERE (username = $1 OR email = $1) AND active = TRUE',
      [identifier]
    );
    return result.rows[0];
  }

  // Buscar admin por ID
  static async findById(id) {
    const result = await query(
      'SELECT id, username, email, role, active, last_login, created_at FROM admin_users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Crear sesión
  static async createSession(adminId) {
    // Generar token seguro
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Limpiar sesiones expiradas del usuario
    await query(
      'DELETE FROM admin_sessions WHERE admin_id = $1 OR expires_at < NOW()',
      [adminId]
    );

    // Crear nueva sesión
    const result = await query(
      'INSERT INTO admin_sessions (admin_id, session_token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [adminId, sessionToken, expiresAt]
    );

    // Actualizar last_login
    await query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [adminId]
    );

    return result.rows[0];
  }

  // Validar sesión
  static async validateSession(sessionToken) {
    const result = await query(
      `SELECT s.*, a.id as admin_id, a.username, a.email, a.role 
       FROM admin_sessions s 
       JOIN admin_users a ON s.admin_id = a.id 
       WHERE s.session_token = $1 AND s.expires_at > NOW() AND a.active = TRUE`,
      [sessionToken]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Extender la sesión si es válida
    await query(
      'UPDATE admin_sessions SET expires_at = $1 WHERE session_token = $2',
      [new Date(Date.now() + 24 * 60 * 60 * 1000), sessionToken]
    );

    return result.rows[0];
  }

  // Cerrar sesión
  static async destroySession(sessionToken) {
    await query('DELETE FROM admin_sessions WHERE session_token = $1', [sessionToken]);
  }

  // Limpiar sesiones expiradas
  static async cleanExpiredSessions() {
    await query('DELETE FROM admin_sessions WHERE expires_at < NOW()');
  }

  // Registrar acción en audit log
  static async logAction(adminId, action, productId = null, oldData = null, newData = null) {
    await query(
      'INSERT INTO product_audit_log (admin_id, action, product_id, old_data, new_data) VALUES ($1, $2, $3, $4, $5)',
      [adminId, action, productId, JSON.stringify(oldData), JSON.stringify(newData)]
    );
  }

  // Obtener logs de auditoría
  static async getAuditLogs(limit = 50, offset = 0) {
    const result = await query(
      `SELECT pal.*, au.username, au.full_name 
       FROM product_audit_log pal 
       JOIN admin_users au ON pal.admin_id = au.id 
       ORDER BY pal.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }
}