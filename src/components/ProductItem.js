import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/components/ProductItem.module.scss";

const ProductItem = ({ product }) => {
  const [imageError, setImageError] = useState({});
  const [imageId, setImageId] = useState({});

  return (
    <div className={styles.productItem}>
      <Image
        src={
          (product.images &&
            (Array.isArray(product.images)
              ? product.images[0]
              : product.images)) ||
          "/placeholder.svg"
        }
        alt={product.title || "Accesorio"}
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

      <p className={styles.productTitle}>{product.title}</p>
      <p className={styles.productPrice}>${product.price}</p>

      <Link
        href={`/products/${product.id}`}
        className={`btn glass ${styles.productAction}`}
      >
        Ver
      </Link>
    </div>
  );
};

export default ProductItem;
