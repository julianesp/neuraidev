"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

export default function SafeHtmlRenderer({ html, className = "" }) {
  const sanitizedHtml = useMemo(() => {
    if (!html) return "";

    // Configuración de DOMPurify para permitir estilos y formatos comunes
    const config = {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "a",
        "span",
        "div",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "style", "class"],
      ALLOWED_STYLES: {
        "*": {
          color: [/^#[0-9A-Fa-f]{3,6}$/, /^rgb\(/, /^rgba\(/],
          "background-color": [/^#[0-9A-Fa-f]{3,6}$/, /^rgb\(/, /^rgba\(/],
          "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
          "font-weight": [/^bold$/, /^normal$/, /^\d{3}$/],
          "font-style": [/^italic$/, /^normal$/],
          "text-decoration": [/^underline$/, /^line-through$/, /^none$/],
        },
      },
    };

    return DOMPurify.sanitize(html, config);
  }, [html]);

  if (!sanitizedHtml) {
    return <p className={className}>Sin descripción disponible</p>;
  }

  return (
    <div
      className={`prose dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
