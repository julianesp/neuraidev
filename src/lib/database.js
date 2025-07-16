// lib/database.js
import { Pool } from "pg";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

let pool;

// Configuración de la base de datos
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  // Configuraciones de pool para optimizar rendimiento
  max: 20, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo de espera para obtener conexión
};

// Crear pool de conexiones singleton
export function getPool() {
  if (!pool) {
    console.log("Creando pool con configuración:", {
      user: dbConfig.user,
      host: dbConfig.host,
      database: dbConfig.database,
      password: typeof dbConfig.password,
      port: dbConfig.port
    });
    pool = new Pool(dbConfig);

    // Manejo de errores del pool
    pool.on("error", (err) => {
      console.error("Error inesperado en el pool de la base de datos:", err);
    });

    // Log de conexión en desarrollo
    if (process.env.NODE_ENV === "development") {
      pool.on("connect", () => {
        console.log("Nueva conexión establecida con la base de datos");
      });
    }
  }

  return pool;
}

// Función para ejecutar consultas con manejo de errores
export async function query(text, params) {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("Query ejecutada:", {
        text,
        duration,
        rows: result.rowCount,
      });
    }

    return result;
  } catch (error) {
    console.error("Error en query de base de datos:", error);
    throw error;
  }
}

// Función para verificar conexión a la base de datos
export async function checkConnection() {
  try {
    const result = await query("SELECT NOW()");
    console.log("Conexión a base de datos exitosa:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    return false;
  }
}

// Función para cerrar el pool (útil para testing)
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
