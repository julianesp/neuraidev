// Script para verificar si la tabla radio_listeners existe en Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfglwidanlpqsmbnound.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x3aWRhbmxwcXNtYm5vdW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTAxOTcsImV4cCI6MjA3NjI4NjE5N30.MFp2YovprfXz3X0fT-RrlaWVbzMfwfccRH_doJmB-9M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRadioListenersTable() {
  console.log('🔍 Verificando tabla radio_listeners...\n');

  // Test 1: Intentar leer la tabla
  console.log('Test 1: Intentar leer de la tabla');
  const { data: readData, error: readError } = await supabase
    .from('radio_listeners')
    .select('*')
    .limit(1);

  if (readError) {
    console.error('❌ Error al leer:', readError.message);
    console.log('\n🚨 LA TABLA NO EXISTE O NO TIENE PERMISOS\n');
    console.log('📝 Solución: Ejecuta el script SQL en Supabase:');
    console.log('   1. Ve a https://app.supabase.com/project/yfglwidanlpqsmbnound/sql');
    console.log('   2. Copia el contenido de: scripts/setup-radio-listeners-table.sql');
    console.log('   3. Pégalo en el editor SQL');
    console.log('   4. Haz clic en "Run"\n');
  } else {
    console.log('✅ Tabla existe y es accesible');
    console.log(`📊 Registros actuales: ${readData.length}`);
    if (readData.length > 0) {
      console.log('Datos:', readData);
    }
  }

  // Test 2: Intentar insertar un registro de prueba
  console.log('\nTest 2: Intentar insertar registro de prueba');
  const testSession = `test_${Date.now()}`;
  const { data: insertData, error: insertError } = await supabase
    .from('radio_listeners')
    .insert({
      session_id: testSession,
      station: 'selecta_fm',
      connected_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString(),
    })
    .select();

  if (insertError) {
    console.error('❌ Error al insertar:', insertError.message);
  } else {
    console.log('✅ Inserción exitosa:', insertData);

    // Limpiar el registro de prueba
    await supabase
      .from('radio_listeners')
      .delete()
      .eq('session_id', testSession);
    console.log('🧹 Registro de prueba eliminado');
  }

  // Test 3: Verificar conteo
  console.log('\nTest 3: Contar oyentes activos');
  const { count, error: countError } = await supabase
    .from('radio_listeners')
    .select('*', { count: 'exact', head: true })
    .eq('station', 'selecta_fm')
    .gte('last_heartbeat', new Date(Date.now() - 120000).toISOString());

  if (countError) {
    console.error('❌ Error al contar:', countError.message);
  } else {
    console.log(`✅ Oyentes activos (últimos 2 min): ${count}`);
  }
}

testRadioListenersTable();
