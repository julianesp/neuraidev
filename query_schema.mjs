import { createClient } from '@supabase/supabase-js';
import https from 'https';

const supabaseUrl = 'https://yfglwidanlpqsmbnound.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x3aWRhbmxwcXNtYm5vdW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcxMDE5NywiZXhwIjoyMDc2Mjg2MTk3fQ.stUAh3VbrRS-blMI-hoxzKnTciuACIvIy3EpbOjIRjE';

// Usar la API REST de Supabase directamente para ejecutar SQL
async function querySupabaseSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${supabaseUrl}/rest/v1/rpc/query`);

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else {
          resolve(data ? JSON.parse(data) : null);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

async function getProductoSchema() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Consultando estructura de tabla "Producto" desde Supabase...\n');

  try {
    // Intentar con RPC primero
    const { data, error } = await supabase.rpc('query', {
      sql: `SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Producto'
ORDER BY ordinal_position;`
    });

    if (error && error.message.includes('function')) {
      console.log('RPC "query" no está disponible, intentando otras opciones...\n');

      // Intentar obtener lista de funciones RPC
      const { data: functions, error: funcError } = await supabase.rpc('pg_list_all_domains');

      if (funcError) {
        console.log('No hay funciones RPC disponibles para queries SQL.\n');
        console.log('Intentando acceso directo a tablas...\n');

        // Intentar listar todas las tablas disponibles
        const { data: allTables, error: tableError } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');

        if (tableError) {
          console.log('Error al listar tablas:', tableError.message);
        } else if (allTables) {
          console.log('Tablas disponibles en el schema público:');
          allTables.forEach(t => console.log(`  - ${t.tablename}`));
        }
      }
    } else if (error) {
      console.log('Error en RPC:', error.message);
    } else if (data) {
      console.log('Estructura de la tabla "Producto":');
      console.log('==================================\n');

      data.forEach((col, index) => {
        const nullable = col.is_nullable === 'YES' ? 'nullable' : 'not null';
        console.log(`${index + 1}. ${col.column_name.padEnd(30)} | ${col.data_type.padEnd(15)} | ${nullable}`);
      });

      console.log(`\nTotal de columnas: ${data.length}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

getProductoSchema();
