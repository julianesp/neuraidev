import { prisma } from "../lib/prisma";
import { findProductBySlug } from "./slugify";

export async function generateProductMetadataForCategory(slug, categoria) {
  try {
    // Obtener productos de la categoría desde la base de datos
    const productos = await prisma.producto.findMany({
      where: {
        categoria: categoria,
        disponible: true,
      },
      include: {
        imagenes: {
          orderBy: { orden: 'asc' },
        },
      },
    });

    // Buscar el producto por slug
    const producto = findProductBySlug(productos, slug);

    if (!producto) {
      return {
        title: 'Producto no encontrado | Neurai.dev',
        description: 'El producto que buscas no existe o ha sido eliminado.',
      };
    }

    const descripcionLimpia = producto.descripcion
      ?.replace(/[^\w\s\-.,áéíóúñü]/gi, '')
      .slice(0, 160) || `${producto.nombre} - ${producto.categoria}`;

    const imagenProducto = producto.imagenPrincipal ||
      (producto.imagenes && producto.imagenes[0]?.url) ||
      'https://neurai.dev/favicon-96x96.png';

    return {
      title: `${producto.nombre} | Neurai.dev`,
      description: descripcionLimpia,
      openGraph: {
        title: `${producto.nombre} | Neurai.dev`,
        description: descripcionLimpia,
        type: 'website',
        siteName: 'Neurai.dev',
        url: `https://neurai.dev/accesorios/${categoria}/${slug}`,
        images: [
          {
            url: imagenProducto,
            width: 800,
            height: 600,
            alt: producto.nombre,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${producto.nombre} | Neurai.dev`,
        description: descripcionLimpia,
        images: [imagenProducto],
      },
    };
  } catch (error) {
    console.error('Error generando metadatos:', error);
    const categoriaNombre = categoria.replace('-', ' ');
    return {
      title: `Accesorios ${categoriaNombre} | Neurai.dev`,
      description: `Encuentra los mejores accesorios de ${categoriaNombre} en Neurai.dev`,
    };
  }
}
