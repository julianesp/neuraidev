// import Link from "next/link";
// import Head from "next/head";
// import { useParams, notFound } from "next/navigation";
// import { useEffect, useState } from "react";
// import styles from "@/styles/BlogPost.module.scss"; // Necesitarás crear este archivo

// // Este array debe ser idéntico al que usas en la página principal del blog
// const posts = [
//   {
//     id: 1,
//     title: "Mi primera publicación",
//     date: "7 de marzo, 2025",
//     excerpt:
//       "Esta es mi primera publicación en el blog donde comparto mis opiniones sobre desarrollo web.",
//     content: `
//       <p>Bienvenidos a mi blog. En este espacio compartiré mis opiniones sobre diversos temas de desarrollo web y tecnología.</p>
//       <p>He decidido comenzar este blog porque considero importante compartir conocimiento y experiencias con la comunidad.</p>
//       <p>En próximas publicaciones hablaré sobre Next.js y sus ventajas para el desarrollo web moderno.</p>
//     `,
//     slug: "mi-primera-publicacion",
//   },
//   // Añade aquí las mismas publicaciones que en el archivo principal
// ];

// export default function PostPage() {
//   const params = useParams();
//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (params.slug) {
//       const foundPost = posts.find((post) => post.slug === params.slug);
//       setPost(foundPost || null);
//       setLoading(false);
//     }
//   }, [params.slug]);

//   if (loading) {
//     return (
//       <div className="container mx-auto p-4 text-center">
//         <p>Cargando...</p>
//       </div>
//     );
//   }

//   if (!post) {
//     return (
//       <div className="container mx-auto p-4 text-center">
//         <h1 className="text-2xl font-bold mb-4">Publicación no encontrada</h1>
//         <p>La publicación que buscas no existe o ha sido eliminada.</p>
//         <Link
//           href="/Blog"
//           className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block"
//         >
//           ← Volver al blog
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Head>
//         <title>{post.title} | Mi Blog</title>
//         <meta content={post.excerpt} name="description" />
//       </Head>
//       <main className="mt-10 container mx-auto px-4 py-8 max-w-3xl">
//         <Link
//           href="/Blog"
//           className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
//         >
//           ← Volver al blog
//         </Link>

//         <article>
//           <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
//           <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
//             {post.date}
//           </p>

//           <div
//             className="prose dark:prose-invert max-w-none"
//             dangerouslySetInnerHTML={{ __html: post.content }}
//           />
//         </article>
//       </main>
//     </>
//   );
// }

// export async function generateStaticParams() {
//   // Obtén todos tus posts/slugs
//   // Por ejemplo, si tienes tus posts en algún lugar:
//   const posts = await getAllPosts(); // implementa esta función según tu fuente de datos

//   // Devuelve un array de objetos con los parámetros para cada ruta
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }

import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/styles/BlogPost.module.scss";

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
