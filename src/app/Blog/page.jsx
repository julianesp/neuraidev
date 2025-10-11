"use client";

import Link from "next/link";
import Head from "next/head";
import BackToTop from "../../components/backTop/BackToTop";

// Forzar renderizado dinámico para evitar errores de prerenderizado
export const dynamic = 'force-dynamic';

// Array de publicaciones - aquí puedes ir añadiendo tus nuevas publicaciones
const posts = [
  {
    id: 1,
    title: "No seas cavernícola 😁",
    date: "28 de mayo, 2025",
    excerpt:
      "No te quedes con lo que miras en la televisión 📺. Usa internet para investigar y aprender 🧠",
    content: `[Aquí va el contenido HTML convertido]`,
    slug: "no-seas-cavernicola",
  },
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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3332683017412148"
          crossorigin="anonymous"
        ></script>
      </Head>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="mt-10 text-3xl font-bold mb-6 text-center">Mi Blog</h1>

        <p className="text-xl text-black dark:text-white">
          Bienvenidos a mi blog. Aquí comparto mis pensamientos y experiencias
          sobre desarrollo web y tecnología en general.
        </p>
        <p className="mb-8 text-xl text-black dark:text-white">
          ¡Disfruta la lectura! 😉
        </p>

        <section className="grid gap-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article
                key={post.id}
                className="border border-gray-950 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow  dark:bg-gray-800 dark:border-white flex flex-col justify-center "
              >
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  {post.date}
                </p>
                <p className="mb-4">{post.excerpt}</p>

                <Link
                  href={`/Blog/${post.slug}`}
                  className="text-white dark:text-black hover:underline bg-black  dark:bg-white w-64 py-2 px-4 rounded-lg text-center block mx-auto transition-colors"
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

        <BackToTop />
      </main>
    </>
  );
}
