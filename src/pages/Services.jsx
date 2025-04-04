"use client";

import { React, useState, useEffect } from "react";
import RootLayout from "@/app/layout";
import Link from "next/link";
import ImageSlider from "@/containers/ImageSlider";
import styles from "@/styles/Services.module.scss";
import Image from "next/image";
import CarouselDemo from "@/components/CarouselDemo";

const WORKING = "/tecnico_sistemas.json";

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

  const imageFormat = [
    {
      formateo_1: "/images/formateo/mainboard_1.jpg",
    },
    {
      formateo_2: "/images/formateo/mainboard_2.jpg",
    },
    {
      formateo_3: "/images/formateo/teclado_1.jpg",
    },
  ];

  const format = [
    imageFormat[0].formateo_1,
    imageFormat[1].formateo_2,
    imageFormat[2].formateo_3,
  ];

  const imageSoft = [
    {
      soft_1: "/images/software/software.jpg",
    },
    {
      soft_2: "/images/software/hdd.jpg",
    },
    {
      soft_3: "/images/software/code.jpg",
    },
  ];

  const soft = [imageSoft[0].soft_1, imageSoft[1].soft_2, imageSoft[2].soft_3];

  return (
    <RootLayout>
      <section className={styles.services}>
        <CarouselDemo apiUrl={WORKING} showArrows={true} />
      </section>

      <section className={styles.tecnico}>
        <h2>Técnico en sistemas</h2>

        <div className={styles.image}>
          <div className={styles.enfoque}>
            <p>Formateo</p>
            <CarouselDemo apiUrl={WORKING} showArrows={false} />
          </div>

          <div className={styles.enfoque}>
            <p>Mantenimiento</p>
            <CarouselDemo apiUrl={WORKING} showArrows={false} />
          </div>
        </div>
      </section>

      <section className={styles.projects}>
        <h2>Desarrollo web</h2>

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
