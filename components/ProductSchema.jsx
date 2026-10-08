import { generateProductSlug } from "@/utils/slugify";
import { htmlToPlainText } from "@/utils/htmlToText";

const R2_URL = "https://pub-c0883d14d3e84a69bf84546fa108aa0b.r2.dev";

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

  // Todas las imágenes (principal + galería), manejando objetos o strings
  const imagenes = [
    producto.imagen_principal || producto.imagenPrincipal,
    ...(Array.isArray(producto.imagenes) ? producto.imagenes : []).map(
      (img) => (typeof img === "object" ? img?.url : img),
    ),
  ]
    .filter((url) => typeof url === "string" && url.startsWith("http"))
    .map((url) => url.replace(R2_URL, "https://images.neurai.dev"));

  const url = `https://neurai.dev/accesorios/${producto.categoria}/${generateProductSlug(producto)}`;
  const usado =
    producto.condicion === "usado" ||
    producto.estado === "usado" ||
    producto.categoria === "libros-usados";
  const agotado =
    !producto.disponible ||
    (producto.stock !== undefined && producto.stock !== null && Number(producto.stock) <= 0);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: htmlToPlainText(producto.descripcion || "", 5000) || producto.nombre,
    sku: producto.sku || producto.id?.toString(),
    ...(producto.codigo_barras && /^\d{8,14}$/.test(producto.codigo_barras)
      ? { gtin: producto.codigo_barras }
      : {}),
    ...(producto.marca && {
      brand: { "@type": "Brand", name: producto.marca },
    }),
    image: imagenes.length > 0 ? imagenes : ["https://neurai.dev/og-image.png"],
    url,
    category: producto.categoria,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "COP",
      price: precio.toFixed(0),
      itemCondition: usado
        ? "https://schema.org/UsedCondition"
        : "https://schema.org/NewCondition",
      availability: agotado
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "neurai.dev",
        url: "https://neurai.dev",
      },
    },
    // Solo calificaciones reales: Google sanciona reseñas inventadas
    ...(Number(producto.calificacion_promedio) > 0 &&
      Number(producto.total_resenas) > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(producto.calificacion_promedio).toFixed(1),
          reviewCount: Number(producto.total_resenas),
          bestRating: "5",
          worstRating: "1",
        },
      }),
    ...(producto.caracteristicas &&
      typeof producto.caracteristicas === "object" &&
      !Array.isArray(producto.caracteristicas) && {
        additionalProperty: Object.entries(producto.caracteristicas).map(
          ([key, value]) => ({
            "@type": "PropertyValue",
            name: key,
            value: String(value),
          }),
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
