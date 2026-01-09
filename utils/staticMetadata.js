// Función helper para generar metadatos estáticos con Open Graph
export function generateStaticProductMetadata(categoria, slug) {
  const logoUrl = 'https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png';

  const categoryNames = {
    'celulares': 'Celulares',
    'computadoras': 'Computadoras',
    'libros-usados': 'Libros Usados',
    'libros-nuevos': 'Libros Nuevos',
    'belleza': 'Belleza',
    'damas': 'Damas',
    'generales': 'Generales',
  };

  const categoryName = categoryNames[categoria] || categoria;

  return {
    title: `Producto - ${categoryName} | neurai.dev`,
    description: `Descubre nuestros productos de ${categoryName.toLowerCase()} en neurai.dev`,
    metadataBase: new URL("https://neurai.dev"),
    openGraph: {
      title: `${categoryName} | neurai.dev`,
      description: `Descubre nuestros productos de ${categoryName.toLowerCase()} en neurai.dev`,
      type: "website",
      siteName: "neurai.dev",
      locale: "es_CO",
      url: `https://neurai.dev/accesorios/${categoria}/${slug}`,
      images: [
        {
          url: logoUrl,
          secureUrl: logoUrl,
          width: 1200,
          height: 630,
          alt: "neurai.dev - Tienda Online",
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} | neurai.dev`,
      description: `Descubre nuestros productos de ${categoryName.toLowerCase()} en neurai.dev`,
      images: [logoUrl],
      creator: "@neuraidev",
      site: "@neuraidev",
    },
  };
}
