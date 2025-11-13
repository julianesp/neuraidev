const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStoreStatus() {
  console.log('🚀 Configurando estado de la tienda en Supabase...\n');

  try {
    // Primero verificar si la tabla existe intentando leer
    const { data: existing, error: checkError } = await supabase
      .from('StoreStatus')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('⚠️ Error al verificar la tabla:', checkError.message);
      console.log('\n📋 Por favor, ejecuta el siguiente SQL en Supabase:');
      console.log('   Ve a: https://supabase.com/dashboard/project/_/sql/new');
      console.log('\n   Y pega el contenido del archivo:');
      console.log('   scripts/create-store-status-table.sql\n');
      return;
    }

    console.log('✅ Tabla StoreStatus encontrada');

    // Verificar si ya existe un registro
    const { data: check } = await supabase
      .from('StoreStatus')
      .select('*')
      .eq('id', 1)
      .single();

    if (check) {
      console.log('ℹ️ Estado de la tienda ya configurado:');
      console.log('   - Estado:', check.is_open ? 'Abierta' : 'Cerrada');
      console.log('   - Horario:', check.open_time, '-', check.close_time);
      console.log('   - Override manual:', check.manual_override ? 'Sí' : 'No');
    } else {
      // Insertar el estado inicial
      const { error: insertError } = await supabase
        .from('StoreStatus')
        .insert({
          id: 1,
          is_open: true,
          manual_override: false,
          open_time: '08:00:00',
          close_time: '18:00:00'
        });

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Estado inicial configurado exitosamente');
      console.log('   - Horario: 8:00 AM - 6:00 PM');
      console.log('   - Estado: Abierta');
    }

    console.log('\n✨ Configuración completada!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupStoreStatus();
