'use client';

import Image from "next/image";
import { useState } from "react";
import { PLACEHOLDER_IMAGE, getProductImage } from "@/lib/constants";

/**
 * Componente de imagen optimizado con configuración SEO y performance
 * Wrapper sobre Next.js Image con mejores defaults y manejo de errores
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  fill = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onError,
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_IMAGE);
  const [hasError, setHasError] = useState(false);

  // Validar que alt siempre esté presente y sea descriptivo
  if (!alt || alt.trim() === "") {
    console.warn(`OptimizedImage: Imagen sin alt descriptivo - ${src}`);
  }

  // BlurDataURL por defecto para placeholder
  const defaultBlurDataURL =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg=";

  const handleError = () => {
    console.warn(`Error cargando imagen: ${src}`);
    setHasError(true);
    setImgSrc(PLACEHOLDER_IMAGE);
    if (onError) {
      onError();
    }
  };

  // Si la imagen está vacía, usar placeholder directamente
  if (!src) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <span className="text-gray-500 text-sm">Sin imagen</span>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
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
      onError={handleError}
      unoptimized={hasError || imgSrc === PLACEHOLDER_IMAGE}
      {...props}
    />
  );
}

/**
 * Componente de imagen para productos con configuración específica
 */
export function ProductImage({ producto, alt, className = "", ...props }) {
  const imageSrc = getProductImage(producto);

  const altText =
    alt || `${producto.nombre} - ${producto.categoria} en Neurai.dev`;

  return (
    <OptimizedImage
      src={imageSrc}
      alt={altText}
      width={800}
      height={600}
      className={className}
      unoptimized={imageSrc.startsWith('data:')}
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
      src={PLACEHOLDER_IMAGE}
      alt={altText}
      width={300}
      height={200}
      className={className}
      unoptimized
      {...props}
    />
  );
}
