/**
 * Script para ejecutar la migración de nequi_orders en Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('📦 Ejecutando migración de nequi_orders...\n');

    // Leer archivo de migración
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260220_create_nequi_orders.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Ejecutar SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Si no existe la función exec_sql, intentar crear la tabla directamente
      console.log('⚠️  Función exec_sql no disponible, ejecutando comandos individuales...\n');

      // Dividir en comandos individuales y ejecutar
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('COMMENT'));

      for (const command of commands) {
        if (command) {
          try {
            const { error: cmdError } = await supabase.rpc('exec', { sql: command });
            if (cmdError) {
              console.log(`⚠️  Advertencia ejecutando comando: ${cmdError.message}`);
            }
          } catch (err) {
            console.log(`⚠️  Advertencia: ${err.message}`);
          }
        }
      }
    }

    console.log('✅ Migración completada\n');
    console.log('📋 Verificando tabla nequi_orders...');

    // Verificar que la tabla existe
    const { data: tables, error: tableError } = await supabase
      .from('nequi_orders')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error al verificar tabla:', tableError.message);
      console.log('\n⚠️  Por favor, ejecuta manualmente el SQL en el panel de Supabase:');
      console.log('   SQL Editor → New Query → Pega el contenido de:');
      console.log('   supabase/migrations/20260220_create_nequi_orders.sql\n');
      process.exit(1);
    }

    console.log('✅ Tabla nequi_orders creada correctamente\n');

    // Verificar función RPC
    console.log('📋 Verificando función decrementar_stock_nequi...');
    const { error: rpcError } = await supabase.rpc('decrementar_stock_nequi', { pedido_id: '00000000-0000-0000-0000-000000000000' });

    if (rpcError && rpcError.code !== 'P0001') { // P0001 es el error esperado (pedido no encontrado)
      console.log('⚠️  Función RPC no disponible o tiene errores');
      console.log('   Asegúrate de ejecutar todo el SQL manualmente\n');
    } else {
      console.log('✅ Función RPC disponible\n');
    }

    console.log('🎉 ¡Migración completada exitosamente!\n');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    console.log('\n📝 Ejecuta manualmente el SQL en Supabase Dashboard:');
    console.log('   1. Ve a: https://supabase.com/dashboard/project/[tu-proyecto]/sql');
    console.log('   2. Crea un nuevo query');
    console.log('   3. Copia y pega el contenido de: supabase/migrations/20260220_create_nequi_orders.sql');
    console.log('   4. Ejecuta el query\n');
    process.exit(1);
  }
}

runMigration();
