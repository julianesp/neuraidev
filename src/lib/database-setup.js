// lib/database-setup.js - Script para configurar la base de datos
import fs from "fs";
import path from "path";
import { getPool } from "./database.js";

export async function setupDatabase() {
  const pool = getPool();

  try {
    console.log("Iniciando configuración de la base de datos...");

    // Leer el archivo SQL del esquema
    const schemaPath = path.join(process.cwd(), "database", "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    // Ejecutar el esquema
    await pool.query(schemaSQL);
    console.log("✅ Esquema de base de datos creado exitosamente");

    // Verificar que las tablas se crearon
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    console.log(
      "Tablas creadas:",
      tablesResult.rows.map((row) => row.table_name),
    );

    // Insertar datos de ejemplo si no existen
    const anunciosCount = await pool.query("SELECT COUNT(*) FROM anuncios");
    if (parseInt(anunciosCount.rows[0].count) === 0) {
      await pool.query("SELECT insert_sample_data()");
      console.log("✅ Datos de ejemplo insertados");
    }

    console.log("🎉 Base de datos configurada correctamente");
  } catch (error) {
    console.error("❌ Error configurando la base de datos:", error);
    throw error;
  }
}

export async function closePool() {
  const pool = getPool();
  await pool.end();
}
