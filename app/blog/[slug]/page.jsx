import React from "react";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/BlogArticle";
import { getPostBySlug, incrementPostViews } from "@/lib/supabase/blog";
import styles from "../blog.module.css";
import Link from "next/link";
import EncuestaWidget from "@/components/EncuestaWidget";

// Forzar revalidación para evitar caché de posts
export const revalidate = 0;
export const dynamic = 'force-dynamic';

/**
 * Generar metadata dinámica para SEO
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado",
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords || "",
    authors: [{ name: post.author }],
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: "article",
      url: `https://neurai.dev/blog/${post.slug}`,
      siteName: "Neurai.dev",
      locale: "es_CO",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: post.image_url
        ? [
            {
              url: post.image_url,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.image_url ? [post.image_url] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `https://neurai.dev/blog/${post.slug}`,
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Incrementar vistas (se ejecuta en el servidor)
  await incrementPostViews(slug);

  // El contenido viene de Supabase (fuente confiable), se usa directamente
  const sanitizedContent = post.content || "";

  // Parsear imágenes (puede ser JSON array o URL simple)
  let postImages = [];
  if (post.image_url) {
    try {
      const parsed = JSON.parse(post.image_url);
      if (Array.isArray(parsed)) {
        postImages = parsed.filter((img) => img.url);
      } else {
        postImages = [{ url: post.image_url, source: "" }];
      }
    } catch {
      postImages = [{ url: post.image_url, source: "" }];
    }
  }

  const today = new Date(post.published_at || post.created_at).toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className={styles.newspaperContainer}>
      <div className={styles.newspaper}>
        {/* Masthead */}
        <header className={styles.masthead}>
          <div className={styles.mastheadTop}>
            <span>Neurai.dev</span>
            <span>Tecnología & Desarrollo</span>
            <span>Colombia</span>
          </div>
          <div className={styles.decorativeLine}></div>
          <h1 className={styles.mastheadTitle}>El Diario Tecnológico</h1>
          <p className={styles.mastheadSubtitle}>"La verdad sobre tecnología, sin compromisos"</p>
          <div className={styles.decorativeLine}></div>
          <div className={styles.mastheadDate}>{today}</div>
        </header>

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Inicio</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span>{post.title}</span>
        </nav>

        {/* Artículo */}
        <article className={styles.articleFull}>
          <div className={styles.articleHeader}>
            <span className={styles.category}>{post.category}</span>
          </div>
          {post.excerpt && <p className={styles.subheadline}>{post.excerpt}</p>}
          <div className={styles.articleMeta}>
            <span>{today}</span>
            {post.read_time && <span>{post.read_time} min de lectura</span>}
            <span>Por {post.author || 'Equipo Neurai.dev'}</span>
          </div>
          {postImages.length > 0 && (
            <div className={styles.articleImages}>
              {postImages.map((img, index) => (
                <figure key={index} className={styles.articleFigure}>
                  <img
                    src={img.url}
                    alt={`Imagen ${index + 1} del artículo`}
                    className={styles.articleImage}
                  />
                  {img.source && (
                    <figcaption className={styles.articleCaption}>
                      Tomada de:{" "}
                      <a
                        href={img.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.articleCaptionLink}
                      >
                        {img.source}
                      </a>
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
          <div
            className={styles.articleFullContent}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </article>

        {/* Encuesta vinculada */}
        {post.encuesta_slug && (
          <div className="my-8">
            <EncuestaWidget slug={post.encuesta_slug} />
          </div>
        )}

        {/* Footer */}
        <div className={styles.ornament}>❖ ❖ ❖</div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link href="/blog" className={styles.readButton}>← Volver al Blog</Link>
        </div>

        <footer style={{ borderTop: '4px double #000', marginTop: '2rem', paddingTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#666' }}>
          <p>© {new Date().getFullYear()} El Diario Tecnológico - Neurai.dev</p>
          <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"Todas las noticias que merecen ser impresas"</p>
        </footer>
      </div>
    </div>
  );
}
