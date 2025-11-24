"use client";

/**
 * Componente para generar Schema.org de tipo Product
 * Mejora el SEO y permite rich snippets en resultados de búsqueda
 */
export default function ProductSchema({ producto }) {
  if (!producto) return null;

  const precio =
    typeof producto.precio === "object"
      ? parseFloat(producto.precio.toString())
      : parseFloat(producto.precio) || 0;

  const imagenPrincipal =
    producto.imagen_principal ||
    producto.imagenPrincipal ||
    (producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes[0]
      : null);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description:
      producto.descripcion?.replace(/[^\w\s\-.,áéíóúñü]/gi, "").slice(0, 200) ||
      producto.nombre,
    sku: producto.sku || producto.id?.toString() || "N/A",
    brand: {
      "@type": "Brand",
      name: producto.marca || "Neurai.dev",
    },
    image: imagenPrincipal || "https://neurai.dev/images/logo.png",
    offers: {
      "@type": "Offer",
      url: `https://neurai.dev/accesorios/${producto.categoria}/${generateSlug(producto.nombre)}`,
      priceCurrency: "COP",
      price: precio.toFixed(2),
      availability: producto.disponible
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
      seller: {
        "@type": "Organization",
        name: "Neurai.dev",
        url: "https://neurai.dev",
      },
    },
    ...(producto.caracteristicas && {
      additionalProperty: Object.entries(producto.caracteristicas).map(
        ([key, value]) => ({
          "@type": "PropertyValue",
          name: key,
          value: value,
        })
      ),
    }),
  };

  // Si tiene rating, agregarlo
  if (producto.rating || producto.calificacion) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: producto.rating || producto.calificacion || 4.5,
      reviewCount: producto.reviewCount || 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}

/**
 * Genera un slug amigable para URLs desde un texto
 */
function generateSlug(text) {
  if (!text) return "producto";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
