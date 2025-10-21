import { Pool } from '@neondatabase/serverless';

let pool;

export function getNeonClient() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }
  return pool;
}

export async function queryNeon(text, params) {
  const client = getNeonClient();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Error ejecutando query en Neon:', error);
    throw error;
  }
}
