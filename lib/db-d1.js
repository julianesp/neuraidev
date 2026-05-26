/**
 * Cliente para Cloudflare D1
 * Reemplaza lib/db.js (Supabase service role)
 *
 * En Next.js con Cloudflare, el binding DB viene del runtime de Cloudflare.
 * Para API routes se accede via process.env o el contexto de la request.
 */

function getD1Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_TOKEN;
  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`;
  return { base, token };
}

/**
 * Ejecuta una query en D1 via REST API
 * Compatible con server-side (API routes, Server Components)
 */
export async function d1Query(sql, params = []) {
  const { base, token } = getD1Config();
  const response = await fetch(`${base}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`D1 Error: ${JSON.stringify(data.errors)}`);
  }

  return data.result[0];
}

/**
 * Helper para SELECT — devuelve array de filas
 */
export async function d1Select(sql, params = []) {
  const result = await d1Query(sql, params);
  return result?.results ?? [];
}

/**
 * Helper para INSERT/UPDATE/DELETE — devuelve metadata
 */
export async function d1Execute(sql, params = []) {
  const result = await d1Query(sql, params);
  return result?.meta ?? {};
}

/**
 * Helper para SELECT con una sola fila
 */
export async function d1SelectOne(sql, params = []) {
  const rows = await d1Select(sql, params);
  return rows[0] ?? null;
}
