import React, { useState, useEffect } from "react";
import ProductItem from "@/components/ProductItem";
import styles from "../styles/components/ProductList.module.scss";
import axios from "axios";

const API = "/accesoriosDestacados.json";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get(API);
      setProducts(response.data);
    };
    
    fetchProducts();
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
