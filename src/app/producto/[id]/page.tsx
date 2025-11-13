import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductoDetalle from '../../../components/ProductoDetalle';
import { findProductById } from '../../../utils/productMetadata';

interface Props {
  params: Promise<{ id: string }>;
}

// Función para obtener producto desde archivos JSON
async function getProducto(id: string) {
  try {
    const producto = await findProductById(id);
    return producto;
  } catch (error) {
    console.error('Error fetching producto:', error);
    return null;
  }
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const producto = await getProducto(id);

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

  const imagenPrincipal = producto.imagenPrincipal ||
    (producto.imagenes && producto.imagenes[0]?.url) || '';

  const ogImageUrl = `/api/og?title=${encodeURIComponent(producto.nombre)}&price=${encodeURIComponent(precio.toString())}&description=${encodeURIComponent(descripcionLimpia)}&image=${encodeURIComponent(imagenPrincipal)}&category=${encodeURIComponent(producto.categoria)}`;

  return {
    title: `${producto.nombre} | Neurai.dev`,
    description: descripcionLimpia,
    keywords: `${producto.nombre}, ${producto.categoria}, ${producto.marca || 'Neurai.dev'}, comprar, ${producto.condicion || producto.estado || 'nuevo'}`,
    openGraph: {
      title: `${producto.nombre} | Neurai.dev`,
      description: descripcionLimpia,
      type: 'website',
      siteName: 'Neurai.dev',
      locale: 'es_ES',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${producto.nombre} - Neurai.dev`,
        },
        // Imagen principal como fallback
        ...(imagenPrincipal ? [{
          url: imagenPrincipal,
          width: 800,
          height: 600,
          alt: producto.nombre,
        }] : []),
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${producto.nombre} | Neurai.dev`,
      description: descripcionLimpia,
      images: [ogImageUrl],
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
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const producto = await getProducto(id);

  if (!producto) {
    notFound();
  }

  return (
    <main className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <ProductoDetalle producto={producto} />
      </div>
    </main>
  );
}