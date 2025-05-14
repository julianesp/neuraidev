import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/components/ProductItem.module.scss";

const ProductItem = ({ product }) => {

  return (
    <div className={styles.productItem}>
      <Image
        src={product.images && (Array.isArray(product.images) ? product.images[0] : product.images) || "/placeholder.svg"}
        alt={product.title || "Accesorio"}
        width={300}
        height={300}
        className={styles.productImage}
      />

      <p className={styles.productTitle}>{product.title}</p>
      <p className={styles.productPrice}>${product.price}</p>

      <Link href={`/products/${product.id}`} className={`btn glass ${styles.productAction}`}>
        Ver
      </Link>
    </div>
  );
};

export default ProductItem;
