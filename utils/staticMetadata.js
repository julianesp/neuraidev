/**
 * Metadata estática para productos
 *
 * NOTE: Supabase removed — pending migration to Cloudflare D1.
 */

// Función helper para generar metadata de fallback
function generateFallbackMetadata(categoria, categoryName, slug) {
  const logoUrl = 'https://media.neurai.dev/logo.png';

  return {
    title: `Producto - ${categoryName} | neurai.dev`,
    description: `Descubre nuestros productos de ${categoryName.toLowerCase()} en neurai.dev. Compra en línea con envío a toda Colombia.`,
    metadataBase: new URL("https://neurai.dev"),
    keywords: [
      categoryName,
      'comprar online Colombia',
      'envío Colombia',
      'neurai.dev',
    ],
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

export async function generateStaticProductMetadata(categoria, slug) {
  throw new Error('Not implemented: migrating to Cloudflare D1');
}
