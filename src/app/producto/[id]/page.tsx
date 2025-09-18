import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductoDetalle from '../../../components/ProductoDetalle';

interface Props {
  params: Promise<{ id: string }>;
}

// Función para obtener producto del API
async function getProducto(id: string) {
  try {
    // Usar prisma directamente en el servidor
    const { prisma } = await import('../../../lib/prisma');

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        imagenes: {
          orderBy: { orden: "asc" }
        },
        tienda: true
      }
    });

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

  const ogImageUrl = `/api/og?title=${encodeURIComponent(producto.nombre)}&price=${encodeURIComponent(producto.precio)}&description=${encodeURIComponent(descripcionLimpia)}&image=${encodeURIComponent(producto.imagenPrincipal || '')}&category=${encodeURIComponent(producto.categoria)}`;

  return {
    title: `${producto.nombre} | Neurai.dev`,
    description: descripcionLimpia,
    keywords: `${producto.nombre}, ${producto.categoria}, ${producto.marca}, comprar, ${producto.condicion}`,
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
        ...(producto.imagenPrincipal ? [{
          url: producto.imagenPrincipal,
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
      'product:price:amount': producto.precio,
      'product:price:currency': 'COP',
      'product:availability': producto.disponible ? 'in stock' : 'out of stock',
      'product:condition': producto.condicion,
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