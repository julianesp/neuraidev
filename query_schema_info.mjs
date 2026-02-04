import https from 'https';

const supabaseUrl = 'yfglwidanlpqsmbnound.supabase.co';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x3aWRhbmxwcXNtYm5vdW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcxMDE5NywiZXhwIjoyMDc2Mjg2MTk3fQ.stUAh3VbrRS-blMI-hoxzKnTciuACIvIy3EpbOjIRjE';

async function querySupabase(tableName) {
  return new Promise((resolve, reject) => {
    const url = `https://${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1&apikey=${apiKey}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getProductsSchema() {
  console.log('Consultando estructura de la tabla "products" desde Supabase...\n');

  try {
    // Obtener un registro para obtener las columnas y sus valores
    const data = await querySupabase('products');

    if (Array.isArray(data) && data.length > 0) {
      const firstRow = data[0];
      const columns = Object.keys(firstRow).sort();

      console.log('Estructura de la tabla "products" (en Supabase):');
      console.log('================================================\n');
      console.log('Columnas encontradas:\n');

      columns.forEach((colName, index) => {
        const value = firstRow[colName];
        let inferredType = 'unknown';

        if (value === null || value === undefined) {
          inferredType = 'NULL/unknown';
        } else if (typeof value === 'boolean') {
          inferredType = 'boolean';
        } else if (typeof value === 'number') {
          inferredType = Number.isInteger(value) ? 'integer' : 'numeric';
        } else if (typeof value === 'string') {
          // Inferir si es timestamp
          if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            inferredType = 'timestamp';
          } else if (!isNaN(Number(value))) {
            inferredType = 'numeric (string)';
          } else {
            inferredType = 'text';
          }
        } else if (Array.isArray(value)) {
          inferredType = 'array/json';
        } else if (typeof value === 'object') {
          inferredType = 'jsonb/object';
        }

        const sampleValue = value === null ? '(null)' :
                           typeof value === 'string' && value.length > 40 ?
                           value.substring(0, 40) + '...' :
                           JSON.stringify(value);

        console.log(`${(index + 1).toString().padStart(2, ' ')}. ${colName.padEnd(25)} | ${inferredType.padEnd(20)} | ${sampleValue}`);
      });

      console.log(`\n\nTotal de columnas: ${columns.length}`);
      console.log('\nNota: Los tipos han sido inferidos del primer registro.');
      console.log('Para obtener tipos exactos de PostgreSQL, consulta el panel de Supabase.');
    } else {
      console.log('No se encontraron datos en la tabla products.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

getProductsSchema();
