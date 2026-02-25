const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfglwidanlpqsmbnound.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x3aWRhbmxwcXNtYm5vdW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE3NjA0MiwiZXhwIjoyMDg1NTM2MDQyfQ.5kYKDDzG1jE-hwPY3o-co8-5_0jSH9rL9YUH0xFgeQI';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkPolicies() {
  console.log('Consultando políticas RLS en la tabla blog_posts...\n');

  // Query para obtener políticas
  const { data, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename = 'blog_posts';
      `
    });

  if (error) {
    console.log('No se pudo consultar con RPC. Intentando método alternativo...');

    // Método alternativo: consultar directamente la metadata
    const { data: tableData, error: tableError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(0);

    if (tableError) {
      console.error('Error:', tableError);
    } else {
      console.log('✅ Tabla blog_posts existe');
      console.log('\nPara ver las políticas RLS, necesitas acceder a:');
      console.log('https://supabase.com/dashboard/project/yfglwidanlpqsmbnound/auth/policies');
    }
    return;
  }

  if (data && data.length > 0) {
    console.log('Políticas encontradas:\n');
    data.forEach(policy => {
      console.log(`Nombre: ${policy.policyname}`);
      console.log(`Comando: ${policy.cmd}`);
      console.log(`Roles: ${policy.roles.join(', ')}`);
      console.log('---');
    });
  } else {
    console.log('❌ No se encontraron políticas RLS en la tabla blog_posts');
    console.log('Esto podría significar que RLS está deshabilitado o no hay políticas configuradas.');
  }
}

checkPolicies();
