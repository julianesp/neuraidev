// scripts/setup-db.js - Script para ejecutar la configuración
import dotenv from "dotenv";
import { setupDatabase, closePool } from "../lib/database-setup.js";

// Cargar variables de entorno
dotenv.config();

// Test de conexión simple
import { Pool } from "pg";

const testPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

console.log("Probando conexión directa...");
try {
  const client = await testPool.connect();
  console.log("✅ Conexión exitosa");
  client.release();
  await testPool.end();
} catch (error) {
  console.error("❌ Error en conexión directa:", error.message);
  await testPool.end();
  process.exit(1);
}

async function main() {
  try {
    await setupDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
