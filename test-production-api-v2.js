require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Usar exactamente las mismas variables que en producción
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Variables de entorno:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Configurada' : '✗ NO configurada');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Faltan variables de entorno');
  console.log('\nAsegúrate de que .env.local tenga:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=...');
  console.log('SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

// Crear cliente exactamente como lo hace lib/db.js
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: (url, options = {}) => {
      const isStorageRequest = url.includes("/storage/v1/");
      const timeout = isStorageRequest ? 15000 : 30000;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});

async function testAPI() {
  const postId = '708b24f3-4335-478b-8a31-cbd0e67ddf08';

  console.log('Simulando API route GET /api/blog/posts/[id]');
  console.log('================================================\n');

  try {
    // Exactamente como lo hace la API route
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);

    console.log('Es UUID válido:', isUUID);

    let query = supabase.from("blog_posts").select("*");

    if (isUUID) {
      query = query.eq("id", postId);
    } else {
      query = query.eq("slug", postId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      console.error('❌ ERROR:', error);
      console.log('\nRespuesta que recibiría el cliente:');
      console.log('{ "error": "Artículo no encontrado" }');
      console.log('Status: 404');
    } else {
      console.log('✅ ÉXITO - Artículo encontrado:');
      console.log('ID:', data.id);
      console.log('Título:', data.title);
      console.log('Slug:', data.slug);
      console.log('Publicado:', data.published);
      console.log('\nRespuesta que recibiría el cliente:');
      console.log('{ "post": { ... } }');
      console.log('Status: 200');
    }
  } catch (error) {
    console.error('❌ EXCEPCIÓN:', error.message);
  }
}

testAPI();
