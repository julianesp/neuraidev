import { getSupabaseBrowserClient } from '@/lib/db';

// Función helper para generar metadata de fallback cuando no se encuentra el producto
function generateFallbackMetadata(categoria, categoryName, slug) {
  const logoUrl = 'https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png';

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

// Función helper para generar metadatos dinámicos con Open Graph basados en el producto real
export async function generateStaticProductMetadata(categoria, slug) {
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

  try {
    // Extraer el ID del slug (última parte después del último guion)
    const slugParts = slug.split('-');
    const productId = slugParts[slugParts.length - 1];

    // Validar que tenemos un ID
    if (!productId || productId.length < 10) {
      console.warn(`[Metadata] ID de producto inválido en slug: ${slug}`);
      return generateFallbackMetadata(categoria, categoryName, slug);
    }

    // Obtener datos del producto desde Supabase
    const supabase = getSupabaseBrowserClient();
    const { data: producto, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !producto) {
      // No lanzar error, solo retornar metadata por defecto
      console.warn(`[Metadata] Producto no encontrado con ID: ${productId}, usando valores por defecto`);
      return generateFallbackMetadata(categoria, categoryName, slug);
    }

    // Extraer datos del producto
    const nombre = producto.nombre || `Producto de ${categoryName}`;
    const descripcion = producto.descripcion
      ? producto.descripcion.replace(/<[^>]*>/g, '').substring(0, 160)
      : `Descubre ${nombre} en neurai.dev. Compra en línea con envío a toda Colombia.`;
    const precio = producto.precio ? `$${parseFloat(producto.precio).toLocaleString('es-CO')} COP` : '';
    const imagenPrincipal = producto.imagen_principal || (producto.imagenes && producto.imagenes[0]) || logoUrl;
    const disponible = producto.disponible ? 'En Stock' : 'Agotado';

    // Construir título optimizado
    const tituloCompleto = `${nombre}${precio ? ` - ${precio}` : ''} | neurai.dev`;
    const descripcionCompleta = `${descripcion}${precio ? ` Precio: ${precio}.` : ''} ${disponible}. Envío a toda Colombia.`;

    return {
      title: tituloCompleto,
      description: descripcionCompleta,
      metadataBase: new URL("https://neurai.dev"),
      keywords: [
        nombre,
        categoryName,
        producto.marca,
        'comprar online Colombia',
        'envío Colombia',
        'neurai.dev',
      ].filter(Boolean),
      openGraph: {
        title: tituloCompleto,
        description: descripcionCompleta,
        type: "product",
        siteName: "neurai.dev",
        locale: "es_CO",
        url: `https://neurai.dev/accesorios/${categoria}/${slug}`,
        images: [
          {
            url: imagenPrincipal,
            secureUrl: imagenPrincipal,
            width: 1200,
            height: 630,
            alt: nombre,
            type: 'image/jpeg',
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: tituloCompleto,
        description: descripcionCompleta,
        images: [imagenPrincipal],
        creator: "@neuraidev",
        site: "@neuraidev",
      },
      // Metadata adicional para productos
      other: {
        'product:price:amount': producto.precio || '',
        'product:price:currency': 'COP',
        'product:availability': producto.disponible ? 'in stock' : 'out of stock',
        'product:condition': 'new',
      }
    };
  } catch (error) {
    // Loguear el error pero no lanzarlo, solo retornar fallback
    console.error(`[Metadata] Error generando metadata para ${categoria}/${slug}:`, error.message);

    // Retornar metadata genérica usando la función helper
    return generateFallbackMetadata(categoria, categoryName, slug);
  }
}
