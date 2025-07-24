// Test database connection
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('🔗 Probando conexión a PostgreSQL...\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    // Test connection
    console.log('📡 Conectando a:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));
    
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!\n');
    
    // List tables
    console.log('📋 Tablas existentes:');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('  No hay tablas en la base de datos');
    }
    
    // Check if productos table exists
    const productosCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'productos'
      );
    `);
    
    console.log('\n🛍️ Tabla productos:', productosCheck.rows[0].exists ? 'Existe' : 'No existe');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Sugerencias:');
      console.log('1. Verifica el usuario y contraseña en .env.local');
      console.log('2. Asegúrate que el usuario "neuraidev" existe en PostgreSQL');
      console.log('3. Verifica los permisos del usuario');
    }
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 La base de datos "anuncios_db" no existe o no tienes acceso');
    }
  } finally {
    await pool.end();
  }
}

testConnection();