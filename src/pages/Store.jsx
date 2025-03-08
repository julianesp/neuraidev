import RootLayout from "@/app/layout";
import ProductoDetalle from "@/components/ProductoDetalle";
import React, { useState, useEffect } from "react";

const Store = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return (
    <RootLayout>
      <ProductoDetalle />
    </RootLayout>
  );
};

export default Store;
