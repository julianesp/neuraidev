"use client";

import { useEffect, useMemo, useState } from "react";
import { htmlToPlainText } from "@/utils/htmlToText";
// dompurify solo corre en el cliente; no usar isomorphic-dompurify porque
// jsdom (su dependencia de servidor) tiene un módulo ESM incompatible en Vercel
let DOMPurify = null;
if (typeof window !== "undefined") {
  DOMPurify = require("dompurify");
}

// Texto plano por párrafos para el render del servidor: así el HTML inicial
// (lo que leen Google y las vistas previas) trae la descripción real.
function htmlToParagraphs(html) {
  return html
    .replace(/<\/(p|li|h[1-6]|div|blockquote)>|<br\s*\/?>/gi, "\n")
    .split("\n")
    .map((linea) => htmlToPlainText(linea))
    .filter(Boolean);
}

export default function SafeHtmlRenderer({ html, className = "" }) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const sanitizedHtml = useMemo(() => {
    if (!html || !DOMPurify || !montado) return "";

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
  }, [html, montado]);

  if (!sanitizedHtml) {
    const parrafos = html ? htmlToParagraphs(html) : [];
    if (parrafos.length === 0) {
      return <p className={className}>Sin descripción disponible</p>;
    }
    return (
      <div className={`safe-html-content ${className}`}>
        {parrafos.map((parrafo, index) => (
          <p key={index}>{parrafo}</p>
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .safe-html-content ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .safe-html-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .safe-html-content li { margin: 0.25rem 0; }
        .safe-html-content p { margin: 0.5rem 0; }
        .safe-html-content h1, .safe-html-content h2, .safe-html-content h3,
        .safe-html-content h4, .safe-html-content h5, .safe-html-content h6 {
          font-weight: 600; margin: 0.75rem 0 0.25rem;
        }
        .safe-html-content blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; color: #6b7280; margin: 0.5rem 0; }
        .safe-html-content code { background: #f3f4f6; border-radius: 3px; padding: 0.1rem 0.3rem; font-size: 0.875em; }
        .safe-html-content strong { font-weight: 700; }
        .safe-html-content em { font-style: italic; }
      `}</style>
      <div
        className={`safe-html-content ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </>
  );
}
