const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  try {
    // Usar service role key para tener permisos completos
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create_facturas_clientes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📋 Ejecutando migración de facturas y clientes...\n');

    // Dividir en statements individuales para ejecutarlos uno por uno
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log(`Ejecutando statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

          if (error) {
            // Ignorar errores de "already exists"
            if (error.message && (
              error.message.includes('already exists') ||
              error.message.includes('ya existe')
            )) {
              console.log(`⚠️  Statement ${i + 1} ya existía, continuando...`);
            } else {
              console.error(`❌ Error en statement ${i + 1}:`, error.message);
            }
          } else {
            console.log(`✅ Statement ${i + 1} ejecutado`);
          }
        } catch (err) {
          console.error(`Error ejecutando statement ${i + 1}:`, err.message);
        }
      }
    }

    // Verificar que las tablas existen
    console.log('\n🔍 Verificando tablas creadas...');

    const { data: facturas, error: errorFacturas } = await supabase
      .from('facturas')
      .select('count')
      .limit(1);

    const { data: clientes, error: errorClientes } = await supabase
      .from('clientes')
      .select('count')
      .limit(1);

    if (!errorFacturas) {
      console.log('✅ Tabla "facturas" existe y está accesible');
    } else {
      console.error('❌ Error accediendo a tabla "facturas":', errorFacturas.message);
    }

    if (!errorClientes) {
      console.log('✅ Tabla "clientes" existe y está accesible');
    } else {
      console.error('❌ Error accediendo a tabla "clientes":', errorClientes.message);
    }

    console.log('\n✅ Proceso completado');

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

runMigration();
