"use client";

/**
 * Componente para generar Schema.org de tipo Article/BlogPosting
 * Mejora el SEO y permite rich snippets en resultados de búsqueda
 */
export default function ArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author = "Neurai.dev",
  category,
  url,
  readTime,
}) {
  if (!title || !url) return null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description || title,
    "image": image || "https://www.neurai.dev/images/logo.png",
    "datePublished": datePublished || new Date().toISOString(),
    "dateModified": dateModified || datePublished || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": author,
      "url": "https://www.neurai.dev/sobre-nosotros",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Neurai.dev",
      "logo": {
        "@type": "ImageObject",
        "url": "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png",
        "width": 512,
        "height": 512,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.neurai.dev${url}`,
    },
    ...(category && { "articleSection": category }),
    ...(readTime && { "timeRequired": `PT${readTime}M` }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  );
}
