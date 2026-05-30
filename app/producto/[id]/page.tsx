import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AccesoriosContainer from '@/containers/AccesoriosContainer/page';
import ViewTracker from '@/components/ViewTracker/ViewTracker';
import { d1SelectOne, d1Select } from '@/lib/db';

async function getProductoById(id: string) {
  return d1SelectOne('SELECT * FROM products WHERE id = ?', [id]);
}

async function getProductosByCategoria(categoria: string, excludeId: string, limit = 4) {
  return d1Select(
    'SELECT * FROM products WHERE categoria = ? AND disponible = 1 AND id != ? LIMIT ?',
    [categoria, excludeId, limit]
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const producto = await getProductoById(id);

    if (!producto) {
      return {
        title: 'Producto no encontrado | Neurai.dev',
      };
    }

  // Limpiar descripción para meta tags
  const descripcionLimpia = producto.descripcion
    ?.replace(/[^\w\s\-.,áéíóúñü]/gi, '')
    .slice(0, 160) || '';

  const precio = typeof producto.precio === 'object' ?
    parseFloat(producto.precio.toString()) :
    parseFloat(producto.precio) || 0;

  const imagenPrincipal = producto.imagen_principal ||
    (producto.imagenes && producto.imagenes[0]) || '';

  const baseUrl = 'https://neurai.dev';
  const ogImageUrl = imagenPrincipal
    ? (imagenPrincipal.startsWith('http') ? imagenPrincipal : `${baseUrl}${imagenPrincipal}`)
    : `${baseUrl}/android-chrome-512x512.png`;

  // Generar keywords estratégicos para SEO
  const categoriaNombre = producto.categoria?.replace(/-/g, ' ') || '';
  const seoKeywords = [
    producto.nombre,
    `comprar ${producto.nombre.toLowerCase()}`,
    `${producto.nombre} en Colombia`,
    `${producto.nombre} Putumayo`,
    categoriaNombre,
    `${categoriaNombre} en venta`,
    producto.marca || 'Neurai.dev',
    producto.condicion || producto.estado || 'nuevo',
    'tienda online Colombia',
    'envío Putumayo',
    'Valle de Sibundoy'
  ].filter(Boolean).join(', ');

  // Meta description optimizada con CTA
  const metaDescription = descripcionLimpia
    ? `${descripcionLimpia.slice(0, 140)} | Compra en neurai.dev ✓ Envíos a todo Colombia ✓ Precios bajos ✓ Calidad garantizada`
    : `Compra ${producto.nombre} en neurai.dev. Envíos a todo Colombia. Precios competitivos y calidad garantizada. ¡Visítanos ahora!`;

  return {
    title: `${producto.nombre} | Comprar Online en Neurai.dev`,
    description: metaDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: `https://neurai.dev/producto/${id}`,
    },
    openGraph: {
      title: `${producto.nombre} | Neurai.dev`,
      description: metaDescription,
      type: 'website',
      siteName: 'Neurai.dev',
      locale: 'es_CO',
      url: `https://neurai.dev/producto/${id}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${producto.nombre} - Neurai.dev`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${producto.nombre} | Neurai.dev`,
      description: metaDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
      creator: '@neuraidev',
    },
    other: {
      'product:price:amount': precio.toString(),
      'product:price:currency': 'COP',
      'product:availability': producto.disponible ? 'in stock' : 'out of stock',
      'product:condition': producto.condicion || producto.estado || 'nuevo',
      'product:brand': producto.marca || 'Neurai.dev',
      'product:category': producto.categoria,
    },
  };
  } catch (err) {
    console.error('Error generating metadata:', err);
    return {
      title: 'Producto | Neurai.dev',
      description: 'Explora nuestro catálogo de productos.',
    };
  }
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;

  try {
    // Obtener el producto por ID desde D1
    const producto = await getProductoById(id);

    if (!producto) {
      console.error('Product not found:', id);
      notFound();
    }

    // Normalizar estructura de datos para compatibilidad con AccesoriosContainer
    const productoNormalizado = {
      ...producto,
      imagenPrincipal: producto.imagen_principal,
      precioAnterior: producto.precio_oferta ? parseFloat(producto.precio_oferta) : null,
      precio: parseFloat(producto.precio),
      cantidad: producto.stock || 0,
      disponible: producto.disponible && producto.stock > 0,
    };

    // Normalizar imágenes: convertir array de strings a array de objetos con url y alt
    if (!productoNormalizado.imagenes || productoNormalizado.imagenes.length === 0) {
      productoNormalizado.imagenes = producto.imagen_principal
        ? [{ url: producto.imagen_principal, alt: producto.nombre }]
        : [];
    } else {
      productoNormalizado.imagenes = productoNormalizado.imagenes
        .map((imagen: any, index: number) => {
          if (typeof imagen === 'object' && imagen !== null && imagen.url) {
            return { ...imagen, alt: imagen.alt || producto.nombre };
          }
          if (typeof imagen === 'string') {
            return { url: imagen, alt: producto.nombre, orden: index };
          }
          return null;
        })
        .filter(Boolean);
    }

    // Obtener otros productos de la misma categoría
    const otrosProductos = await getProductosByCategoria(producto.categoria, id);

    // Normalizar otros productos también
    const otrosProductosNormalizados = (otrosProductos || []).map((p: any) => ({
      ...p,
      imagenPrincipal: p.imagen_principal,
      precioAnterior: p.precio_oferta ? parseFloat(p.precio_oferta) : null,
      precio: parseFloat(p.precio),
      cantidad: p.stock || 0,
      disponible: p.disponible && p.stock > 0,
    }));

    // Schema.org Product structured data para Google Rich Snippets
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: producto.nombre,
      description: producto.descripcion || '',
      image: productoNormalizado.imagenes?.map((img: any) => img.url) || [],
      sku: producto.sku || producto.id,
      brand: {
        "@type": "Brand",
        name: producto.marca || "Neurai.dev"
      },
      offers: {
        "@type": "Offer",
        url: `https://neurai.dev/producto/${id}`,
        priceCurrency: "COP",
        price: parseFloat(producto.precio),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        itemCondition: producto.condicion === 'usado' ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
        availability: producto.disponible && producto.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "Neurai.dev"
        }
      },
      aggregateRating: producto.calificacion_promedio ? {
        "@type": "AggregateRating",
        ratingValue: producto.calificacion_promedio,
        reviewCount: producto.total_resenas || 1
      } : undefined,
      category: producto.categoria
    };

    return (
      <>
        {/* Schema.org JSON-LD para el producto */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />

        <main className="py-14">
          {/* Registra la visita silenciosamente al cargar la página */}
          <ViewTracker productId={id} />
          <div className="max-w-6xl mx-auto px-4">
            <AccesoriosContainer
              apiUrl=""
              accesorio={productoNormalizado as any}
              otrosAccesorios={otrosProductosNormalizados as any}
            />
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error('Error in ProductoPage:', error);
    notFound();
  }
}