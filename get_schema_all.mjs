import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfglwidanlpqsmbnound.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x3aWRhbmxwcXNtYm5vdW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcxMDE5NywiZXhwIjoyMDc2Mjg2MTk3fQ.stUAh3VbrRS-blMI-hoxzKnTciuACIvIy3EpbOjIRjE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAndDescribeTable() {
  console.log('Buscando tabla de productos...\n');

  // Intentar diferentes variaciones del nombre
  const tableNames = ['Producto', 'producto', 'PRODUCTO', 'productos', 'Productos'];

  for (const tableName of tableNames) {
    console.log(`Intentando con: "${tableName}"...`);

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`  Error: ${error.message}`);
      } else if (data) {
        console.log(`  Éxito! Tabla encontrada: "${tableName}"\n`);

        if (data.length > 0) {
          const firstRow = data[0];
          const columns = Object.keys(firstRow).sort();

          console.log(`Estructura de la tabla "${tableName}":`)
          console.log('==================================\n');

          columns.forEach((colName, index) => {
            const value = firstRow[colName];
            let inferredType = 'unknown';

            if (value === null || value === undefined) {
              inferredType = 'NULL';
            } else if (typeof value === 'boolean') {
              inferredType = 'boolean';
            } else if (typeof value === 'number') {
              inferredType = Number.isInteger(value) ? 'integer' : 'numeric';
            } else if (typeof value === 'string') {
              inferredType = 'text';
            } else if (Array.isArray(value)) {
              inferredType = 'array';
            } else if (typeof value === 'object') {
              inferredType = 'jsonb';
            }

            console.log(`${index + 1}. ${colName.padEnd(35)} | ${inferredType}`);
          });

          console.log(`\nTotal de columnas: ${columns.length}`);
          return;
        }
      }
    } catch (err) {
      console.log(`  Error de conexión: ${err.message}`);
    }
  }

  console.log('\nNo se encontró ninguna tabla de productos.');
  console.log('Listando todas las tablas disponibles...\n');

  // Intentar obtener todas las tablas
  try {
    const { tables, error } = await supabase.from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      console.log('No se puede listar tablas mediante información_schema');
      return;
    }

    if (tables) {
      console.log('Tablas disponibles:');
      tables.forEach(t => console.log(`  - ${t.table_name}`));
    }
  } catch (err) {
    console.log(`Error listando tablas: ${err.message}`);
  }
}

findAndDescribeTable();
