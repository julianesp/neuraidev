// utils/database-helpers.js - Funciones de ayuda para la base de datos
export function buildWhereClause(filters) {
  const conditions = [];
  const params = [];
  let paramCount = 0;

  if (filters.active !== undefined) {
    paramCount++;
    conditions.push(`active = $${paramCount}`);
    params.push(filters.active);
  }

  if (filters.category && filters.category !== "all") {
    paramCount++;
    conditions.push(`category = $${paramCount}`);
    params.push(filters.category);
  }

  if (filters.featured === true) {
    paramCount++;
    conditions.push(`featured = $${paramCount}`);
    params.push(true);
  }

  if (filters.search) {
    paramCount++;
    conditions.push(
      `(business_name ILIKE $${paramCount} OR description ILIKE $${paramCount})`,
    );
    params.push(`%${filters.search}%`);
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
    paramCount,
  };
}

export function buildOrderClause(orderBy = "featured DESC, created_at DESC") {
  return `ORDER BY ${orderBy}`;
}

export function buildPaginationClause(limit, offset, paramCount) {
  const clauses = [];
  const params = [];
  let currentParamCount = paramCount;

  if (limit) {
    currentParamCount++;
    clauses.push(`LIMIT $${currentParamCount}`);
    params.push(limit);
  }

  if (offset > 0) {
    currentParamCount++;
    clauses.push(`OFFSET $${currentParamCount}`);
    params.push(offset);
  }

  return {
    paginationClause: clauses.join(" "),
    params,
    paramCount: currentParamCount,
  };
}
