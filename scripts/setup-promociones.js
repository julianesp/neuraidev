require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPromocionesTable() {
  console.log('📦 Configurando tabla de promociones...\n');

  try {
    // Leer el archivo SQL
    const sql = fs.readFileSync('./scripts/create-promociones-table.sql', 'utf8');

    // Ejecutar el SQL mediante RPC (si está configurado) o directamente
    console.log('Ejecutando SQL...');

    // Como Supabase no permite ejecutar SQL directo desde el cliente,
    // vamos a crear la tabla usando la consola web o crear registros de ejemplo
    console.log('⚠️  NOTA: Debes ejecutar el SQL manualmente en Supabase Dashboard');
    console.log('📋 SQL guardado en: scripts/create-promociones-table.sql\n');

    console.log('Pasos para crear la tabla:');
    console.log('1. Ve a https://supabase.com/dashboard');
    console.log('2. Selecciona tu proyecto');
    console.log('3. Ve a SQL Editor');
    console.log('4. Copia y pega el contenido de scripts/create-promociones-table.sql');
    console.log('5. Ejecuta el SQL\n');

    // Verificar si la tabla ya existe intentando hacer una consulta
    console.log('Verificando si la tabla ya existe...');
    const { data, error } = await supabase
      .from('promociones')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ La tabla "promociones" no existe todavía');
        console.log('   Por favor, ejecuta el SQL manualmente en Supabase Dashboard\n');
      } else {
        console.error('Error al verificar tabla:', error);
      }
    } else {
      console.log('✅ La tabla "promociones" ya existe!\n');

      // Crear algunas promociones de ejemplo
      console.log('Creando promoción de ejemplo...');

      const { data: examplePromo, error: insertError } = await supabase
        .from('promociones')
        .insert([
          {
            nombre: 'Combo Productividad: Teclado + Mouse',
            descripcion: 'Lleva un teclado y un mouse juntos con 15% de descuento',
            tipo: 'combo',
            activo: true,
            productos_ids: [], // Agregar IDs reales después
            descuento_tipo: 'porcentaje',
            descuento_valor: 15,
            cantidad_minima: 2,
            icono: '⌨️🖱️',
            color_badge: '#4CAF50',
            posicion_orden: 1
          }
        ])
        .select();

      if (insertError) {
        console.error('Error al crear promoción de ejemplo:', insertError);
      } else {
        console.log('✅ Promoción de ejemplo creada:', examplePromo);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupPromocionesTable();
