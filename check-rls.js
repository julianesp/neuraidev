const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfglwidanlpqsmbnound.supabase.co';

// Primero con service role key (bypass RLS)
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x3aWRhbmxwcXNtYm5vdW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE3NjA0MiwiZXhwIjoyMDg1NTM2MDQyfQ.5kYKDDzG1jE-hwPY3o-co8-5_0jSH9rL9YUH0xFgeQI';

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x3aWRhbmxwcXNtYm5vdW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzYwNDIsImV4cCI6MjA4NTUzNjA0Mn0.woeIGG4gfpcPiftIRE8Md3d6rVPiRxojboymhxZ0B-c';

async function checkRLS() {
  const postId = '708b24f3-4335-478b-8a31-cbd0e67ddf08';

  console.log('==========================================');
  console.log('Test 1: Con SERVICE_ROLE_KEY (debería funcionar)');
  console.log('==========================================\n');

  const supabaseService = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: serviceData, error: serviceError } = await supabaseService
    .from('blog_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (serviceError) {
    console.error('❌ Error con SERVICE_ROLE_KEY:', serviceError);
  } else {
    console.log('✅ Éxito con SERVICE_ROLE_KEY');
    console.log('Título:', serviceData.title);
  }

  console.log('\n==========================================');
  console.log('Test 2: Con ANON_KEY (sin autenticación)');
  console.log('==========================================\n');

  const supabaseAnon = createClient(supabaseUrl, anonKey);

  const { data: anonData, error: anonError } = await supabaseAnon
    .from('blog_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (anonError) {
    console.error('❌ Error con ANON_KEY:', anonError);
    console.log('\n⚠️  PROBLEMA: Las políticas RLS están bloqueando el acceso público');
    console.log('Esto significa que la API de Next.js no puede acceder a los datos.');
  } else {
    console.log('✅ Éxito con ANON_KEY');
    console.log('Título:', anonData.title);
  }

  console.log('\n==========================================');
  console.log('Test 3: Verificar tabla existe y tiene RLS');
  console.log('==========================================\n');

  const { data: tableInfo } = await supabaseService
    .from('blog_posts')
    .select('*')
    .limit(1);

  if (tableInfo && tableInfo.length > 0) {
    console.log('✅ La tabla blog_posts existe y tiene datos');
  } else {
    console.log('⚠️  La tabla blog_posts está vacía o no existe');
  }
}

checkRLS();
