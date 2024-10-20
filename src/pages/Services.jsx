"use client";

import { React, useState, useEffect } from "react";
import RootLayout from "@/app/layout";
import Link from "next/link";
import ImageSlider from "@/containers/ImageSlider";
import styles from "@/styles/Services.module.scss";
import Image from "next/image";

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

  const imagesSites = [
    {
      contab: "/images/budget.png",
    },
    {
      ase: "/images/logo_ase.jpg",
    },
  ];

  const sitesWeb = [imagesSites[0].contab, imagesSites[1].ase];

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

        <p>Space for presentation formateo service</p>
        <p>Space for presentation Mantenimiento service</p>
      </section>

      <section className={styles.projects}>
        <h2>Mis proyectos</h2>

        <article>
          <div>
            <Link href="https://julianesp.github.io/contavsib/" target="_blank">
              <Image
                alt="Logo contavsib"
                src={sitesWeb[0]}
                width={50}
                height={50}
              />
            </Link>
          </div>

          <div>
            <Link href="https://julianesp.github.io/ase/" target="_blank">
              <Image alt="Logo ase" src={sitesWeb[1]} width={50} height={50} />
            </Link>
          </div>
        </article>
      </section>
    </RootLayout>
  );
};

export default Services;
