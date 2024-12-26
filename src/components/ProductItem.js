import React, { useState } from "react";
import Image from "next/image";
import styles from "../styles/ProductItem.module.scss";

const ProductItem = ({ product }) => {
  const [cart, setCart] = useState([]);
  const handleClick = (e) => {
    setCart("useState funcionando");
  };

  return (
    <div className={styles.productItem}>
      <Image
        src={product.image}
        alt={product.title}
        width={300}
        height={300}
      />

        <div className={styles.productInfo}>
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <p>${product.price}</p>

        <figure onClick={handleClick}>
          <Image
            alt="Add to cart"
            // src="/images/6.jpg"
            width={300}
            height={300}
          />
        </figure>
        {cart}
      </div>
    </div>
  );
};

export default ProductItem;
