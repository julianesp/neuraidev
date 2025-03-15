import RootLayout from "@/app/layout";
import BackToTop from "@/components/backTop/BackToTop";
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

      <BackToTop/>
    </RootLayout>
  );
};

export default Store;
