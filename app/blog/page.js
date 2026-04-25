import React from "react";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/supabase/blog";
import styles from "./blog.module.css";

// Forzar revalidación para evitar caché de posts
export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog de Tecnología | Neurai.dev",
  description:
    "Artículos, guías y consejos sobre tecnología, computadores, celulares, desarrollo web y más. Mantente actualizado con las últimas tendencias tecnológicas.",
  keywords:
    "blog tecnología, guías tecnológicas, consejos computadores, tutoriales web, Colombia",
  openGraph: {
    title: "Blog de Tecnología - Neurai.dev",
    description:
      "Artículos y guías sobre tecnología, computadores y desarrollo web",
    type: "website",
    siteName: "neurai.dev",
    url: "https://neurai.dev/blog",
    locale: "es_CO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Neurai.dev - Blog de Tecnología",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog de Tecnología - Neurai.dev",
    description:
      "Artículos y guías sobre tecnología, computadores y desarrollo web",
    images: ["/og-image.png"],
    creator: "@neuraidev",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Blog() {
  const articles = await getPublishedPosts();

  // Obtener la fecha actual
  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.newspaperContainer}>
      <div className={styles.newspaper}>
        {/* Masthead - Cabecera del periódico */}
        <header className={styles.masthead}>
          <div className={styles.mastheadTop}>
            <span>Neurai.dev</span>
            <span>Tecnología & Desarrollo</span>
            <span>Colombia</span>
          </div>
          <div className={styles.decorativeLine}></div>
          <h1 className={styles.mastheadTitle}>El Diario Tecnológico</h1>
          <p className={styles.mastheadSubtitle}>
            "La verdad sobre tecnología, sin compromisos"
          </p>
          <div className={styles.decorativeLine}></div>
          <div className={styles.mastheadDate}>{today}</div>
        </header>

        {/* Contenido principal */}
        {articles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📰</div>
            <h2 className={styles.emptyStateTitle}>Próxima Edición</h2>
            <p className={styles.emptyStateText}>
              Estamos preparando contenido extraordinario para nuestros
              lectores. Pronto encontrarás aquí artículos, investigaciones y
              análisis profundos sobre tecnología, computadores, desarrollo web
              y las últimas innovaciones del sector.
            </p>
            <Link href="/" className={styles.emptyStateButton}>
              Regresar al Inicio
            </Link>
          </div>
        ) : (
          <>
            {/* Grid de artículos estilo periódico */}
            <div className={styles.articlesGrid}>
              {/* Artículo principal destacado (grande) */}
              {articles[0] && (
                <article className={styles.featuredMain}>
                  <div className={styles.articleHeader}>
                    <span className={styles.category}>
                      {articles[0].category}
                    </span>
                    <Link href={`/blog/${articles[0].slug}`} className={styles.readButton}>
                      Leer
                    </Link>
                  </div>
                  <Link
                    href={`/blog/${articles[0].slug}`}
                    className={styles.articleLink}
                  >
                    <h2
                      className={`${styles.headline} ${styles.headlineLarge}`}
                    >
                      {articles[0].title}
                    </h2>
                    <p className={styles.subheadline}>{articles[0].excerpt}</p>
                    <div className={styles.articleMeta}>
                      <span>
                        {new Date(
                          articles[0].published_at || articles[0].created_at,
                        ).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      {articles[0].read_time && (
                        <span>{articles[0].read_time} min de lectura</span>
                      )}
                    </div>
                    <div className={styles.articleBody}>
                      {articles[0].excerpt}
                    </div>
                  </Link>
                </article>
              )}

              {/* Artículos secundarios (columna derecha) */}
              {articles[1] && (
                <article className={styles.featuredSecondary}>
                  <div className={styles.articleHeader}>
                    <span className={styles.category}>{articles[1].category}</span>
                    <Link href={`/blog/${articles[1].slug}`} className={styles.readButton}>Leer</Link>
                  </div>
                  <Link href={`/blog/${articles[1].slug}`} className={styles.articleLink}>
                    <h3 className={`${styles.headline} ${styles.headlineMedium}`}>
                      {articles[1].title}
                    </h3>
                    <div className={styles.articleMeta}>
                      <span>
                        {new Date(articles[1].published_at || articles[1].created_at)
                          .toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className={styles.articleExcerpt}>
                      {articles[1].excerpt?.substring(0, 150)}...
                    </p>
                  </Link>
                </article>
              )}

              {articles[2] && (
                <article className={styles.featuredSecondary}>
                  <div className={styles.articleHeader}>
                    <span className={styles.category}>{articles[2].category}</span>
                    <Link href={`/blog/${articles[2].slug}`} className={styles.readButton}>Leer</Link>
                  </div>
                  <Link href={`/blog/${articles[2].slug}`} className={styles.articleLink}>
                    <h3 className={`${styles.headline} ${styles.headlineMedium}`}>
                      {articles[2].title}
                    </h3>
                    <div className={styles.articleMeta}>
                      <span>
                        {new Date(articles[2].published_at || articles[2].created_at)
                          .toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className={styles.articleExcerpt}>
                      {articles[2].excerpt?.substring(0, 150)}...
                    </p>
                  </Link>
                </article>
              )}
            </div>

            {/* Ornamento decorativo */}
            <div className={styles.ornament}>❖ ❖ ❖</div>

            {/* Segunda sección: 3 columnas */}
            <div className={styles.articlesGrid}>
              {articles.slice(3, 6).map((article) => (
                <article key={article.slug} className={styles.articleColumn}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className={styles.articleLink}
                  >
                    <span className={styles.category}>{article.category}</span>
                    <h3
                      className={`${styles.headline} ${styles.headlineSmall}`}
                    >
                      {article.title}
                    </h3>
                    <div className={styles.articleMeta}>
                      <span>
                        {new Date(
                          article.published_at || article.created_at,
                        ).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {article.read_time && (
                        <span>{article.read_time} min</span>
                      )}
                    </div>
                    <p className={styles.articleExcerpt}>
                      {article.excerpt?.substring(0, 200)}...
                    </p>
                  </Link>
                </article>
              ))}
            </div>

            {/* Ornamento decorativo */}
            <div className={styles.ornament}>❖ ❖ ❖</div>

            {/* Tercera sección: artículos pequeños */}
            <div className={styles.articlesGrid}>
              {articles.slice(6).map((article) => (
                <article key={article.slug} className={styles.articleSmall}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className={styles.articleLink}
                  >
                    <span className={styles.category}>{article.category}</span>
                    <h4
                      className={`${styles.headline} ${styles.headlineSmall}`}
                    >
                      {article.title}
                    </h4>
                    <p className={styles.articleExcerpt}>
                      {article.excerpt?.substring(0, 150)}...
                    </p>
                  </Link>
                </article>
              ))}
            </div>

            {/* Newsletter Section - estilo periódico */}
            <div className={styles.newsletterBox}>
              <h2 className={styles.newsletterHeadline}>
                Suscríbase a Nuestra Edición Digital
              </h2>
              <p className={styles.subheadline}>
                Reciba las últimas noticias tecnológicas directamente en su
                correo
              </p>
              <form className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="Su dirección de correo electrónico"
                  className={styles.newsletterInput}
                />
                <button type="submit" className={styles.newsletterButton}>
                  Suscribirse
                </button>
              </form>
            </div>
          </>
        )}

        {/* Footer del periódico */}
        <footer
          style={{
            borderTop: "4px double #000",
            marginTop: "2rem",
            paddingTop: "1rem",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#666",
          }}
        >
          <p>
            © {new Date().getFullYear()} El Diario Tecnológico - Neurai.dev
          </p>
          <p style={{ fontStyle: "italic", marginTop: "0.5rem" }}>
            "Todas las noticias que merecen ser impresas"
          </p>
        </footer>
      </div>
    </div>
  );
}
