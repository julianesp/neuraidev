"use client";

import React from "react";
import Link from "next/link";
import ArticleSchema from "./ArticleSchema";
import { formatDate } from "@/lib/blogUtils";

/**
 * Componente wrapper para artículos de blog
 * Genera automáticamente fecha y tiempo de lectura
 *
 * @example
 * <BlogArticle
 *   title="Mi Artículo"
 *   category="Guías"
 *   url="/blog/mi-articulo"
 *   readTime={10} // Se calcula automáticamente si no se proporciona
 *   datePublished="2025-01-15T00:00:00Z" // Se genera automáticamente si no se proporciona
 * >
 *   <p>Contenido del artículo...</p>
 * </BlogArticle>
 */
export default function BlogArticle({
  title,
  description,
  category = "Blog",
  url,
  readTime,
  datePublished,
  author = "Equipo Neurai.dev",
  children,
}) {
  // Usar fecha actual si no se proporciona
  const articleDate = datePublished || new Date().toISOString();
  const formattedDate = formatDate(articleDate);

  return (
    <>
      <ArticleSchema
        title={title}
        description={description}
        datePublished={articleDate}
        dateModified={articleDate}
        author={author}
        category={category}
        url={url}
        readTime={readTime}
      />
      <article className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-sm" aria-label="Breadcrumb">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Inicio
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Blog
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-600 dark:text-gray-400">
              {title}
            </span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                {category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {title}
            </h1>
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm space-x-4">
              <time dateTime={articleDate}>{formattedDate}</time>
              {readTime && (
                <>
                  <span>•</span>
                  <span>{readTime} min de lectura</span>
                </>
              )}
              <span>•</span>
              <span>Por {author}</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </article>
    </>
  );
}
