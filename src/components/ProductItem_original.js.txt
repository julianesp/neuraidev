import React, { useState } from "react";
import Image from "next/image";
import styles from "../styles/ProductItem.module.scss";
import Link from "next/link";

const ProductItem = ({ product }) => {
  // const [cart, setCart] = useState([]);
  // const handleClick = (e) => {
  //   setCart("useState funcionando");
  // };

  const [currentImage, setCurrentImage] = useState(
    Array.isArray(product.images) ? product.images[0] : product.images,
  );

  // const handleImageChange = (index) => {
  //   if (Array.isArray(product.images)) {
  //     setCurrentImage(product.images[index]);
  //   }
  // };

  return (
    <div className={styles.productItem}>
      <Image
        src={currentImage}
        alt="Accesorio"
        width={300}
        height={300}
        className={styles.images}
      />

      <p>{product.title}</p>
      {/* <p>{product.description}</p> */}
      <p>${product.price}</p>

      <Link href={`/products/${product.id}`}>Ver</Link>

      {/* <figure onClick={handleClick}>
          <Image
            alt="Add to cart"
            width={300}
            height={300}
          />
        </figure>
        {cart} */}
    </div>
  );
};

export default ProductItem;
