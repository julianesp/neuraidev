const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkAndCreateTables() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  console.log('🔍 Verificando estado de las tablas...\n');

  // Verificar si existe la tabla facturas
  const { data: facturas, error: errorFacturas } = await supabase
    .from('facturas')
    .select('count')
    .limit(1);

  // Verificar si existe la tabla clientes
  const { data: clientes, error: errorClientes } = await supabase
    .from('clientes')
    .select('count')
    .limit(1);

  console.log('Estado de tabla "facturas":', errorFacturas ? `❌ ${errorFacturas.message}` : '✅ Existe');
  console.log('Estado de tabla "clientes":', errorClientes ? `❌ ${errorClientes.message}` : '✅ Existe');

  if (errorFacturas || errorClientes) {
    console.log('\n⚠️  Las tablas no existen o no son accesibles.');
    console.log('\n📋 Para crear las tablas, necesitas:');
    console.log('\n1. Ir al Dashboard de Supabase: https://supabase.com/dashboard/project/yfglwidanlpqsmbnound');
    console.log('2. Ir a "SQL Editor"');
    console.log('3. Copiar y pegar el contenido del archivo: supabase/migrations/create_facturas_clientes.sql');
    console.log('4. Ejecutar el SQL');
    console.log('\nO bien, puedes ejecutar este comando si tienes acceso:');
    console.log('\nnpx supabase db push --db-url "postgresql://postgres.yfglwidanlpqsmbnound:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"\n');
  } else {
    console.log('\n✅ Ambas tablas existen y están configuradas correctamente\n');
  }
}

checkAndCreateTables().catch(console.error);
