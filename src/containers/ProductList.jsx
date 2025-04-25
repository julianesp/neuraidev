// import React, { useEffect, useState } from "react";
// import ProductItem from "@/components/ProductItem_original";
// import useGetProducts from "@/hooks/useGetProducts";
// import styles from "@/styles/ProductList.module.scss";

// const API = "/accesories.json";

// const ProductList = () => {
//   const products = useGetProducts(API);

//   return (
//     <section className={styles.productList}>
//       <div className={styles.container}>
//         {products.map((product) => (
//           <ProductItem product={product} key={product.id} />
//         ))}
//       </div>
//     </section>
//   );
// };

// export default ProductList;

// import React from "react";
// import ProductItem from "@/components/ProductItem";
// import useGetProducts from "@/hooks/useGetProducts";
// import styles from "@/styles/ProductList.module.scss";

// const ProductList = ({ API }) => {
//   const { products, loading, error } = useGetProducts(API);

//   if (loading) return <div>Cargando productos...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <section className={styles.productList}>
//       <div className={styles.container}>
//         {products.map((product) => (
//           <ProductItem product={product} key={product.id} />
//         ))}
//       </div>
//     </section>
//   );
// };

// export default ProductList;

import React from "react";
import ProductItem from "@/components/ProductItem";
import useGetProducts from "@/hooks/useGetProducts";
import styles from "@/styles/components/ProductList.module.scss";

const ProductList = ({ API, maxImages = Number.POSITIVE_INFINITY }) => {
  const { products, loading, error } = useGetProducts(API);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className={styles.productList}>
      <div className={styles.container}>
        {products.map((product) => (
          <ProductItem
            product={product}
            key={product.id}
            maxImages={maxImages}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductList;
