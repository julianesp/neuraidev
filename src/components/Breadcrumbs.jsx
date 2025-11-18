"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Componente de Breadcrumbs con Schema.org para SEO
 * @param {Array} items - Array de objetos {name, url}
 * Ejemplo: [{name: "Inicio", url: "/"}, {name: "Accesorios", url: "/accesorios"}]
 */
export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  // Siempre incluir "Inicio" al principio si no está
  const breadcrumbItems = items[0]?.url === "/" ? items : [
    { name: "Inicio", url: "/" },
    ...items
  ];

  // Schema.org BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://neurai.dev${item.url}`
    }))
  };

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-sm"
      >
        <ol className="flex items-center space-x-2 flex-wrap">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isHome = index === 0;

            return (
              <li key={item.url} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    className="w-4 h-4 mx-2 text-gray-400"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span
                    className="text-gray-600 dark:text-gray-400 font-medium"
                    aria-current="page"
                  >
                    {isHome && <Home className="w-4 h-4 inline mr-1" />}
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                  >
                    {isHome && <Home className="w-4 h-4 inline mr-1" />}
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/**
 * Utilidad para generar breadcrumbs desde una ruta
 * @param {string} pathname - Ruta actual (ej: "/accesorios/celulares/cable-usb")
 * @param {Object} customNames - Nombres personalizados para segmentos
 * @returns {Array} Array de items para breadcrumbs
 */
export function generateBreadcrumbsFromPath(pathname, customNames = {}) {
  if (!pathname || pathname === "/") {
    return [{ name: "Inicio", url: "/" }];
  }

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ name: "Inicio", url: "/" }];

  let currentPath = "";
  segments.forEach((segment) => {
    currentPath += `/${segment}`;

    // Usar nombre personalizado o capitalizar el segmento
    const name = customNames[segment] ||
                 segment
                   .replace(/-/g, " ")
                   .replace(/\b\w/g, (l) => l.toUpperCase());

    breadcrumbs.push({
      name,
      url: currentPath
    });
  });

  return breadcrumbs;
}

/**
 * Mapa de nombres personalizados para categorías
 */
export const CATEGORY_NAMES = {
  "accesorios": "Accesorios",
  "celulares": "Celulares",
  "computadoras": "Computadoras",
  "damas": "Damas",
  "belleza": "Belleza",
  "libros-nuevos": "Libros Nuevos",
  "libros-usados": "Libros Usados",
  "generales": "Generales",
  "destacados": "Destacados",
  "nuevos": "Nuevos",
  "servicios": "Servicios",
  "blog": "Blog",
  "sobre-nosotros": "Sobre Nosotros",
  "politicas": "Políticas",
  "politica-devoluciones": "Política de Devoluciones",
  "politica-privacidad": "Política de Privacidad",
  "terminos-condiciones": "Términos y Condiciones",
  "preguntas-frecuentes": "Preguntas Frecuentes",
};
