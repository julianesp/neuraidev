/**
 * lib/db.js - Capa de compatibilidad para migración Supabase → Cloudflare D1
 *
 * Provee las mismas funciones de interfaz que antes pero usando D1 REST API.
 * Las rutas de API que usaban getSupabaseServerClient() ahora usan D1.
 */

import { d1Query, d1Select, d1Execute, d1SelectOne } from './db-d1';

// Re-exportar funciones D1 para uso directo
export { d1Query, d1Select, d1Execute, d1SelectOne };

/**
 * Objeto compatible con la API de Supabase para tablas comunes.
 * Permite que el código existente funcione sin cambios mayores.
 *
 * Soporta: .from(table).select().eq().order().limit().single()
 */
class D1QueryBuilder {
  constructor(table) {
    this.table = table;
    this._select = '*';
    this._conditions = [];
    this._params = [];
    this._order = null;
    this._limit = null;
    this._single = false;
  }

  select(cols = '*') {
    this._select = cols === '*' ? '*' : cols;
    return this;
  }

  eq(col, val) {
    this._conditions.push(`${col} = ?`);
    this._params.push(val);
    return this;
  }

  neq(col, val) {
    this._conditions.push(`${col} != ?`);
    this._params.push(val);
    return this;
  }

  gt(col, val) {
    this._conditions.push(`${col} > ?`);
    this._params.push(val);
    return this;
  }

  gte(col, val) {
    this._conditions.push(`${col} >= ?`);
    this._params.push(val);
    return this;
  }

  lt(col, val) {
    this._conditions.push(`${col} < ?`);
    this._params.push(val);
    return this;
  }

  lte(col, val) {
    this._conditions.push(`${col} <= ?`);
    this._params.push(val);
    return this;
  }

  like(col, val) {
    this._conditions.push(`${col} LIKE ?`);
    this._params.push(val);
    return this;
  }

  ilike(col, val) {
    this._conditions.push(`LOWER(${col}) LIKE LOWER(?)`);
    this._params.push(val);
    return this;
  }

  in(col, vals) {
    const placeholders = vals.map(() => '?').join(', ');
    this._conditions.push(`${col} IN (${placeholders})`);
    this._params.push(...vals);
    return this;
  }

  contains(col, val) {
    if (Array.isArray(val)) {
      val.forEach(v => {
        this._conditions.push(`${col} LIKE ?`);
        this._params.push(`%${v}%`);
      });
    } else {
      this._conditions.push(`${col} LIKE ?`);
      this._params.push(`%${val}%`);
    }
    return this;
  }

  order(col, opts = {}) {
    const dir = opts.ascending === false ? 'DESC' : 'ASC';
    this._order = `${col} ${dir}`;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  single() {
    this._single = true;
    this._limit = 1;
    return this;
  }

  _buildSQL() {
    let sql = `SELECT ${this._select} FROM ${this.table}`;
    if (this._conditions.length > 0) {
      sql += ' WHERE ' + this._conditions.join(' AND ');
    }
    if (this._order) sql += ` ORDER BY ${this._order}`;
    if (this._limit) sql += ` LIMIT ${this._limit}`;
    return sql;
  }

  async _execute() {
    const sql = this._buildSQL();
    try {
      const rows = await d1Select(sql, this._params);
      if (this._single) {
        const row = rows[0] ?? null;
        return { data: row, error: null };
      }
      return { data: rows, error: null };
    } catch (err) {
      console.error(`[D1] Error en ${this.table}:`, err.message);
      return { data: null, error: { message: err.message } };
    }
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }
}

class D1InsertBuilder {
  constructor(table, rows) {
    this.table = table;
    this.rows = Array.isArray(rows) ? rows : [rows];
    this._select = false;
    this._single = false;
  }

  select() {
    this._select = true;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  async _execute() {
    try {
      const results = [];
      for (const row of this.rows) {
        const processedRow = {};
        for (const [k, v] of Object.entries(row)) {
          if (v !== null && v !== undefined && typeof v === 'object') {
            processedRow[k] = JSON.stringify(v);
          } else if (typeof v === 'boolean') {
            processedRow[k] = v ? 1 : 0;
          } else {
            processedRow[k] = v;
          }
        }

        const cols = Object.keys(processedRow);
        const vals = Object.values(processedRow);
        const placeholders = cols.map(() => '?').join(', ');

        try {
          const sql = `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
          const inserted = await d1Select(sql, vals);
          if (inserted[0]) results.push(inserted[0]);
        } catch {
          const insertSql = `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${placeholders})`;
          await d1Execute(insertSql, vals);
          if (row.id) {
            const found = await d1Select(`SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`, [row.id]);
            if (found[0]) results.push(found[0]);
          }
        }
      }

      if (this._single) {
        return { data: results[0] ?? null, error: null };
      }
      return { data: results, error: null };
    } catch (err) {
      console.error(`[D1] Error insertando en ${this.table}:`, err.message);
      return { data: null, error: { message: err.message } };
    }
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }
}

class D1UpdateBuilder {
  constructor(table, changes) {
    this.table = table;
    this.changes = changes;
    this._conditions = [];
    this._params = [];
    this._select = false;
    this._single = false;
  }

  eq(col, val) {
    this._conditions.push(`${col} = ?`);
    this._params.push(val);
    return this;
  }

  select() {
    this._select = true;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  async _execute() {
    try {
      const processedChanges = {};
      for (const [k, v] of Object.entries(this.changes)) {
        if (v !== null && v !== undefined && typeof v === 'object') {
          processedChanges[k] = JSON.stringify(v);
        } else if (typeof v === 'boolean') {
          processedChanges[k] = v ? 1 : 0;
        } else {
          processedChanges[k] = v;
        }
      }

      const setClauses = Object.keys(processedChanges).map(k => `${k} = ?`).join(', ');
      const setVals = Object.values(processedChanges);
      const allParams = [...setVals, ...this._params];

      let sql = `UPDATE ${this.table} SET ${setClauses}`;
      if (this._conditions.length > 0) {
        sql += ' WHERE ' + this._conditions.join(' AND ');
      }
      await d1Execute(sql, allParams);

      if (this._select) {
        let selectSql = `SELECT * FROM ${this.table}`;
        if (this._conditions.length > 0) {
          selectSql += ' WHERE ' + this._conditions.join(' AND ');
        }
        const rows = await d1Select(selectSql, this._params);
        if (this._single) {
          return { data: rows[0] ?? null, error: null };
        }
        return { data: rows, error: null };
      }

      return { data: null, error: null };
    } catch (err) {
      console.error(`[D1] Error actualizando ${this.table}:`, err.message);
      return { data: null, error: { message: err.message } };
    }
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }
}

class D1DeleteBuilder {
  constructor(table) {
    this.table = table;
    this._conditions = [];
    this._params = [];
  }

  eq(col, val) {
    this._conditions.push(`${col} = ?`);
    this._params.push(val);
    return this;
  }

  async _execute() {
    try {
      let sql = `DELETE FROM ${this.table}`;
      if (this._conditions.length > 0) {
        sql += ' WHERE ' + this._conditions.join(' AND ');
      }
      await d1Execute(sql, this._params);
      return { error: null };
    } catch (err) {
      console.error(`[D1] Error eliminando de ${this.table}:`, err.message);
      return { error: { message: err.message } };
    }
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }
}

class D1Client {
  from(table) {
    return {
      select: (cols) => new D1QueryBuilder(table).select(cols),
      insert: (rows) => new D1InsertBuilder(table, rows),
      update: (changes) => new D1UpdateBuilder(table, changes),
      delete: () => new D1DeleteBuilder(table),
      upsert: (rows) => new D1InsertBuilder(table, Array.isArray(rows) ? rows : [rows]),
    };
  }
}

const d1Client = new D1Client();

export function getSupabaseServerClient() {
  return d1Client;
}

export function getSupabaseClient() {
  return d1Client;
}

export function getSupabaseBrowserClient() {
  return d1Client;
}

export async function query() {
  throw new Error('query() legacy no soportado - usa d1Select/d1Execute directamente');
}
