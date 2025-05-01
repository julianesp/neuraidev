"use client";

import { React, useState, useEffect } from "react";
import RootLayout from "../app/layout";
import Link from "next/link";
import styles from "../styles/components/Services.module.scss";
import Image from "next/image";
import { CarouselDemo } from "../components/CarouselDemo";

const WORKING = "/tecnico_sistemas.json";

const Services = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

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
