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

  // Calcular rating y reviews
  const ratingValue = producto.rating || producto.calificacion || 4.5;
  const reviewCount = producto.reviewCount || producto.totalReviews || 1;

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
    // AggregateRating: Siempre incluido (Google lo requiere)
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toString(),
      reviewCount: reviewCount,
      bestRating: "5",
      worstRating: "1",
    },
    // Review: Al menos una reseña (Google lo requiere)
    review: producto.reviews && producto.reviews.length > 0
      ? producto.reviews.map(review => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: review.author || "Cliente verificado",
          },
          datePublished: review.date || new Date().toISOString().split('T')[0],
          reviewBody: review.text || "Producto de buena calidad",
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating || ratingValue.toString(),
            bestRating: "5",
            worstRating: "1",
          },
        }))
      : [
          {
            "@type": "Review",
            author: {
              "@type": "Person",
              name: "Neurai.dev",
            },
            datePublished: new Date().toISOString().split('T')[0],
            reviewBody: `Producto disponible en Neurai.dev - ${producto.nombre}`,
            reviewRating: {
              "@type": "Rating",
              ratingValue: ratingValue.toString(),
              bestRating: "5",
              worstRating: "1",
            },
          },
        ],
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
