import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PriceWithDiscount from "./PriceWithDiscount";
import styles from "../styles/components/ProductItem.module.scss";

const ProductItem = ({ product }) => {
  const [imageError, setImageError] = useState({});
  const [imageId, setImageId] = useState({});

  // Get image source, prioritizing imagenPrincipal and then images/imagenes arrays
  const getImageSrc = () => {
    if (product.imagenPrincipal) return product.imagenPrincipal;
    if (product.images && Array.isArray(product.images)) {
      const firstImage = product.images[0];
      return typeof firstImage === 'object' && firstImage.url ? firstImage.url : firstImage;
    }
    if (product.imagenes && Array.isArray(product.imagenes)) {
      const firstImage = product.imagenes[0];
      return typeof firstImage === 'object' && firstImage.url ? firstImage.url : firstImage;
    }
    if (product.images && !Array.isArray(product.images)) return product.images;
    return "/placeholder.svg";
  };

  return (
    <div 
      className={`${styles.productItem} ${product.vendido ? styles.soldProduct : ''}`}
      style={{
        opacity: product.vendido ? (product.estilos?.opacidad || 0.6) : 1,
        filter: product.vendido ? (product.estilos?.filtro || 'grayscale(100%)') : 'none'
      }}
    >
      {/* Sold label */}
      {product.vendido && (
        <div
          className={styles.soldLabel}
          style={{
            backgroundColor: product.estilos?.fondoTextoVendido || '#000000',
            color: product.estilos?.colorTextoVendido || '#ff4444'
          }}
        >
          {product.estilos?.textoVendido || 'VENDIDO'}
        </div>
      )}

      <Image
        src={getImageSrc()}
        alt={product.title || product.nombre || "Accesorio"}
        width={300}
        height={300}
        className={styles.productImage}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false} // Solo true para imágenes above-the-fold
        loading="lazy"
        quality={85} // Reduce de 100 a 85
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
        onError={() => setImageError((prev) => ({ ...prev, [imageId]: true }))}
      />

      <p className={styles.productTitle}>{product.title || product.nombre}</p>
      <PriceWithDiscount 
        precio={product.price || product.precio}
        className={styles.productPrice}
      />

      <Link
        href={`/products/${product.id}`}
        className={`btn glass ${styles.productAction} ${product.vendido ? styles.soldButton : ''}`}
        style={{
          pointerEvents: product.vendido ? 'none' : 'auto',
          opacity: product.vendido ? 0.6 : 1
        }}
      >
        {product.vendido ? 'No disponible' : 'Ver'}
      </Link>
    </div>
  );
};

export default ProductItem;
