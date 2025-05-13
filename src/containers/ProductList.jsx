import React, { useState, useEffect } from "react";
import ProductItem from "@/components/ProductItem";
import useGetProducts from "@/hooks/useGetProducts";
import styles from "../styles/components/ProductList.module.scss";
import axios from "axios";

const API = "/accesories.json";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const { getProducts } = useGetProducts();

  useEffect(async () => {
    const response = await axios.get(API);
    setProducts(response.data);
  }, []);

  return (
    <div className={styles.productList}>
      {products.map((product) => (
        <ProductItem key={product.id} product={product} maxImages={3} />
      ))}
    </div>
  );
};

export default ProductList;
