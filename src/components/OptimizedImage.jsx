import Image from "next/image";

/**
 * Componente de imagen optimizado con configuración SEO y performance
 * Wrapper sobre Next.js Image con mejores defaults
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 85,
  fill = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onError,
  ...props
}) {
  // Validar que alt siempre esté presente y sea descriptivo
  if (!alt || alt.trim() === "") {
    console.warn(`OptimizedImage: Imagen sin alt descriptivo - ${src}`);
  }

  // BlurDataURL por defecto para placeholder
  const defaultBlurDataURL =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg=";

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      quality={quality}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={defaultBlurDataURL}
      className={className}
      onError={onError}
      {...props}
    />
  );
}

/**
 * Componente de imagen para productos con configuración específica
 */
export function ProductImage({ producto, alt, className = "", ...props }) {
  const imageSrc =
    producto.imagen_principal ||
    producto.imagenPrincipal ||
    (producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes[0]
      : "/images/placeholder.png");

  const altText =
    alt || `${producto.nombre} - ${producto.categoria} en Neurai.dev`;

  return (
    <OptimizedImage
      src={imageSrc}
      alt={altText}
      width={800}
      height={600}
      className={className}
      {...props}
    />
  );
}

/**
 * Componente de imagen para categorías
 */
export function CategoryImage({
  category,
  alt,
  className = "",
  ...props
}) {
  const altText = alt || `Accesorios de ${category} - Neurai.dev`;

  return (
    <OptimizedImage
      src={`/images/${category}-placeholder.png`}
      alt={altText}
      width={300}
      height={200}
      className={className}
      {...props}
    />
  );
}
