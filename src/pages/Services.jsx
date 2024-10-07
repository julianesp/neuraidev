"use client";

import { React, useState, useEffect } from "react";
import RootLayout from "@/app/layout";
import Link from "next/link";
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
      <section className={styles.services}>
        <p>Crear carrusel para presentar los siguientes servicios</p>
        <ul>
          <li>Formateo PC</li>
          <li>Mantenimiento PC</li>
          <li>Instalación programas</li>
          <li>Desarrollo páginas web</li>
        </ul>

        <p>Space for presentation my websites</p>
        <p>Space for presentation formateo service</p>
        <p>Space for presentation Mantenimiento service</p>
      </section>
    </RootLayout>
  );
};

export default Services;
