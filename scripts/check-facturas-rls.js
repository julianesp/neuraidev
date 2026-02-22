import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Probando acceso con diferentes claves...\n');

// Test 1: Con SERVICE_ROLE_KEY (bypasses RLS)
console.log('Test 1: Con SERVICE_ROLE_KEY (usado en API)');
const supabaseService = createClient(supabaseUrl, serviceKey);
const { data: dataService, error: errorService } = await supabaseService
  .from('facturas')
  .select('*')
  .order('fecha', { ascending: false });

if (errorService) {
  console.log('❌ Error:', errorService.message);
} else {
  console.log(`✅ Facturas encontradas: ${dataService.length}\n`);
}

// Test 2: Con ANON_KEY (respeta RLS)
console.log('Test 2: Con ANON_KEY (como browser client)');
const supabaseAnon = createClient(supabaseUrl, anonKey);
const { data: dataAnon, error: errorAnon } = await supabaseAnon
  .from('facturas')
  .select('*')
  .order('fecha', { ascending: false });

if (errorAnon) {
  console.log('❌ Error:', errorAnon.message);
  console.log('Details:', errorAnon);
} else {
  console.log(`✅ Facturas encontradas: ${dataAnon.length}\n`);
}

// Test 3: Verificar políticas RLS
console.log('\nTest 3: Verificando políticas RLS de la tabla facturas');
const { data: policies, error: errorPolicies } = await supabaseService
  .from('pg_policies')
  .select('*')
  .eq('tablename', 'facturas');

if (errorPolicies) {
  console.log('❌ Error obteniendo políticas:', errorPolicies.message);
} else if (policies && policies.length > 0) {
  console.log(`\n📋 Políticas RLS encontradas (${policies.length}):`);
  policies.forEach(p => {
    console.log(`  - ${p.policyname}: ${p.cmd} (${p.permissive})`);
  });
} else {
  console.log('⚠️  No se encontraron políticas RLS');
}

// Test 4: Verificar si RLS está habilitado
console.log('\nTest 4: Verificando si RLS está habilitado en la tabla facturas');
const { data: tableInfo } = await supabaseService.rpc('exec_sql', {
  query: "SELECT relrowsecurity FROM pg_class WHERE relname = 'facturas';"
});
console.log('RLS habilitado:', tableInfo);
