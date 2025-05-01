import Link from "next/link";
import { notFound } from "next/navigation";

// Array de posts (considera moverlo a un servicio o API)
const posts = [
  {
    id: 1,
    title: "Mi primera publicación",
    date: "7 de marzo, 2025",
    excerpt:
      "Esta es mi primera publicación en el blog donde comparto mis opiniones sobre desarrollo web.",
    content: `
      <p>Bienvenidos a mi blog. En este espacio compartiré mis opiniones sobre diversos temas de desarrollo web y tecnología.</p>
      <p>He decidido comenzar este blog porque considero importante compartir conocimiento y experiencias con la comunidad.</p>
      <p>En próximas publicaciones hablaré sobre Next.js y sus ventajas para el desarrollo web moderno.</p>
    `,
    slug: "mi-primera-publicacion",
  },
  // Otros posts...
];

// Función para obtener todos los posts (esto reemplazaría tu función getAllPosts)
async function getAllPosts() {
  return posts;
}

// Componente de página
export default async function PostPage({ params }) {
  // Encontrar el post por slug
  const post = posts.find((p) => p.slug === params.slug);

  // Si no se encuentra el post, mostrar página 404
  if (!post) {
    notFound();
  }

  return (
    <main className="mt-10 container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/Blog"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
      >
        ← Volver al blog
      </Link>

      <article>
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          {post.date}
        </p>

        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}

// Generación de rutas estáticas
export async function generateStaticParams() {
  const allPosts = await getAllPosts();

  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Esto añade metadatos para SEO (reemplaza el uso de Head)
export function generateMetadata({ params }) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    return {
      title: "Post no encontrado",
    };
  }

  return {
    title: `${post.title} | Mi Blog`,
    description: post.excerpt,
  };
}
