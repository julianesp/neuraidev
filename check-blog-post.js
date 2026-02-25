const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfglwidanlpqsmbnound.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2x3aWRhbmxwcXNtYm5vdW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE3NjA0MiwiZXhwIjoyMDg1NTM2MDQyfQ.5kYKDDzG1jE-hwPY3o-co8-5_0jSH9rL9YUH0xFgeQI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPost() {
  const postId = '708b24f3-4335-478b-8a31-cbd0e67ddf08';

  console.log('Buscando artículo con ID:', postId);

  // Buscar el artículo
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Error:', error);
    console.log('\n=== El artículo NO EXISTE en la base de datos ===\n');

    // Listar todos los artículos
    const { data: allPosts, error: listError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, created_at')
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('Error al listar posts:', listError);
    } else {
      console.log('Artículos disponibles en la base de datos:');
      console.log('========================================\n');
      allPosts.forEach(post => {
        console.log(`ID: ${post.id}`);
        console.log(`Título: ${post.title}`);
        console.log(`Slug: ${post.slug}`);
        console.log(`Creado: ${post.created_at}`);
        console.log('---\n');
      });
    }
  } else {
    console.log('✅ Artículo encontrado:');
    console.log('Título:', data.title);
    console.log('Slug:', data.slug);
    console.log('Publicado:', data.published);
  }
}

checkPost();
