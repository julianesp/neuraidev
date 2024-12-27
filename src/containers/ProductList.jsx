import React, { useEffect, useState } from "react";
import ProductItem from "@/components/ProductItem";
import useGetProducts from "@/hooks/useGetProducts";
import styles from "@/styles/ProductList.module.scss";

const API = "/accesories.json";

const ProductList = () => {
  const products = useGetProducts(API);

  return (
    <section className={styles.productList}>
      <div className={styles.container}>
        {products.map((product) => (
          <ProductItem product={product} key={product.id} />
        ))}
      </div>
    </section>
  );
};

export default ProductList;
