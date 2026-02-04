import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfglwidanlpqsmbnound.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x3aWRhbmxwcXNtYm5vdW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcxMDE5NywiZXhwIjoyMDc2Mjg2MTk3fQ.stUAh3VbrRS-blMI-hoxzKnTciuACIvIy3EpbOjIRjE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getProductoSchema() {
  console.log('Obteniendo estructura de la tabla "Producto"...\n');

  try {
    // Obtener un registro para inferir la estructura
    const { data: sampleData, error: sampleError } = await supabase
      .from('Producto')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error al conectar:', sampleError.message);
      return;
    }

    if (!sampleData || sampleData.length === 0) {
      console.log('La tabla "Producto" está vacía. Intentando obtener información del esquema...');
      return;
    }

    // Inferir estructura desde el primer registro
    console.log('Estructura de la tabla "Producto":');
    console.log('==================================\n');

    const firstRow = sampleData[0];
    const columns = Object.keys(firstRow).sort();

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
    console.log('\nNota: Los tipos se han inferido del primer registro.');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

getProductoSchema();
