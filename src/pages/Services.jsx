"use client";

import { React, useState, useEffect } from "react";
import RootLayout from "@/app/layout";
import Link from "next/link";
import ImageSlider from "@/containers/ImageSlider";
import styles from "@/styles/Services.module.scss";

const Services = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  // images to show
  const services = [
    {
      d1: "/images/formateo.png",
    },
    {
      d2: "/images/ssd.png",
    },
    {
      d3: "/images/ssd.png",
    },
  ];

  const imagePaths = [services[0].d1, services[1].d2, services[2].d3];

  return (
    <RootLayout>
      <section className={styles.services}>
        <ImageSlider
          className={`h-max`}
          imagePaths={imagePaths}
          enableTransition={false}
        />
        <ul>
          <li>Formateo PC</li>
          <li>Mantenimiento PC</li>
          <li>Instalación programas</li>
          <li>Desarrollo páginas web</li>
          <li>Este texto indica las imagenes que van en el slider</li>
        </ul>

        <p>Space for presentation my websites</p>
        <p>Space for presentation formateo service</p>
        <p>Space for presentation Mantenimiento service</p>
      </section>
    </RootLayout>
  );
};

export default Services;
