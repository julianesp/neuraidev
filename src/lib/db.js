import { Pool } from "pg";

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
}

// Crear tabla de noticias si no existe
export async function initNoticiasTable() {
  const client = getPool();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS noticias (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        contenido TEXT,
        imagen TEXT NOT NULL,
        fecha DATE NOT NULL,
        municipio VARCHAR(50) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        autor VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return true;
  } catch (error) {
    console.error("❌ Error creando tabla de noticias:", error);
    throw error;
  }
}
