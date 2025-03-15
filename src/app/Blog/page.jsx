"use client";

import Link from "next/link";
import Head from "next/head";
import styles from "@/styles/Blog.module.scss"; // Necesitarás crear este archivo de estilos
import BackToTop from "@/components/backTop/BackToTop";

// Array de publicaciones - aquí puedes ir añadiendo tus nuevas publicaciones
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
  // Puedes añadir más publicaciones siguiendo esta estructura
  // {
  //   id: 2,
  //   title: "Título de tu segunda publicación",
  //   date: "Fecha",
  //   excerpt: "Breve descripción",
  //   content: "Contenido completo en HTML",
  //   slug: "url-amigable"
  // }
];

export default function BlogPage() {
  return (
    <>
      <Head>
        <title>Mi Blog</title>
        <meta
          content="Publicaciones y artículos de opinión"
          name="description"
        />
      </Head>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="mt-10 text-3xl font-bold mb-6">Mi Blog</h1>

        <section className="grid gap-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article
                key={post.id}
                className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800"
              >
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  {post.date}
                </p>
                <p className="mb-4">{post.excerpt}</p>
                <Link
                  href={`/Blog/${post.slug}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Leer más
                </Link>
              </article>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p>Aún no hay publicaciones disponibles.</p>
            </div>
          )}
        </section>

        <BackToTop/>
      </main>
    </>
  );
}
