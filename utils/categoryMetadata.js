// Metadatos estándar para páginas de categorías
const CATEGORY_INFO = {
  celulares: {
    title: "Accesorios para Celulares",
    description: "Encuentra los mejores accesorios para tu celular: fundas, cargadores, cables USB-C, audífonos inalámbricos y más. Envíos a todo el Valle de Sibundoy.",
    keywords: "accesorios celulares, fundas celular, cargadores rápidos, cables USB-C, audífonos, Putumayo",
  },
  computadoras: {
    title: "Accesorios para Computadoras",
    description: "Accesorios y componentes para PC: discos SSD, memorias RAM, teclados, mouse, webcams y más. Mejora el rendimiento de tu computador.",
    keywords: "accesorios computadora, SSD, memoria RAM, teclados, mouse, webcam, componentes PC",
  },
  generales: {
    title: "Accesorios Generales",
    description: "Accesorios variados: gadgets tecnológicos, artículos deportivos, herramientas, productos para mascotas y más. Gran variedad de productos.",
    keywords: "accesorios generales, gadgets, herramientas, productos deportivos, mascotas",
  },
  "libros-nuevos": {
    title: "Libros Nuevos",
    description: "Libros nuevos de diferentes géneros: desarrollo personal, biografías, literatura clásica y más. Amplía tu biblioteca personal.",
    keywords: "libros nuevos, literatura, desarrollo personal, biografías, libros Valle de Sibundoy",
  },
  "libros-usados": {
    title: "Libros Usados",
    description: "Libros universitarios usados: programación, matemáticas, ingeniería, circuitos electrónicos y más. Ahorra en libros académicos.",
    keywords: "libros usados, libros universitarios, programación, matemáticas, ingeniería, textos académicos",
  },
};

/**
 * Genera metadatos optimizados para SEO para páginas de categorías
 * @param {string} categoria - Nombre de la categoría
 * @returns {object} Objeto de metadatos para Next.js
 */
export function generateCategoryMetadata(categoria) {
  const info = CATEGORY_INFO[categoria] || {
    title: `Accesorios ${categoria}`,
    description: `Explora nuestra colección de productos en la categoría ${categoria}. Envíos a todo el Valle de Sibundoy, Putumayo.`,
    keywords: `${categoria}, accesorios, Valle de Sibundoy, Putumayo`,
  };

  const canonicalUrl = `https://neurai.dev/accesorios/${categoria}`;

  return {
    title: `${info.title} | Neurai.dev`,
    description: info.description,
    keywords: info.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${info.title} | Neurai.dev`,
      description: info.description,
      type: "website",
      siteName: "Neurai.dev",
      locale: "es_CO",
      url: canonicalUrl,
      images: [
        {
          url: "https://neurai.dev/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${info.title} - Neurai.dev`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${info.title} | Neurai.dev`,
      description: info.description,
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
  };
}
