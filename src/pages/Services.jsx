"use client";

import { React, useState, useEffect } from "react";
import RootLayout from "@/app/layout";
import styles from "@/styles/Services.module.scss";

const Services = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return (
    <RootLayout>
      <div className={`${styles.services} mt-16`}>
        <h1>Servicios</h1>
        <p>Contenido de servicios</p>
      </div>
    </RootLayout>
  );
};

export default Services;
