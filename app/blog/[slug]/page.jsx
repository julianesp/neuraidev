import React from "react";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/BlogArticle";
import { getPostBySlug, incrementPostViews } from "@/lib/supabase/blog";
import DOMPurify from "isomorphic-dompurify";

/**
 * Generar metadata dinámica para SEO
 */
export async function generateMetadata({ params }) {
  const { slug } = params;
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
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Incrementar vistas (se ejecuta en el servidor)
  await incrementPostViews(slug);

  // Sanitizar el contenido HTML para prevenir XSS
  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <BlogArticle
      title={post.title}
      description={post.excerpt}
      category={post.category}
      url={`/blog/${post.slug}`}
      readTime={post.read_time}
      datePublished={post.published_at}
      author={post.author}
    >
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </BlogArticle>
  );
}
