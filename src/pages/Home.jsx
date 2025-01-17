"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link.js";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import ImageSlider from "../containers/ImageSlider.js";
import ProductList from "@/containers/ProductList.jsx";
import ProductItem from "@/components/ProductItem";

const Inicio = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  const accesorios = [
    {
      d1: "/images/1.jpg",
    },
    {
      d2: "/images/2.jpg",
    },
    {
      d3: "/images/3.jpg",
    },
  ];

  const imagePath = [accesorios[0].d1, accesorios[1].d2, accesorios[2].d3];

  return (
    <>
      <Head>
        <title>Inicio</title>
        <link rel="icon" href="/favicon.ico" />
        <meta content="Página de inicio" />
      </Head>
      <main className={styles.container}>
        <section className={`mt-6 ${styles.presentation}`}>
          <ImageSlider imagePaths={imagePath} enableTransition={true} />
        </section>

        <section className={styles.tratamientos}>
          <section className={styles.area}>
            <h3>Servicios</h3>

            <ul>
              <li>Formateo PC</li>
              <li>Mantenimiento PC</li>
              <li>Instalación programas</li>
              <li>Desarrollo páginas web</li>
            </ul>

            <Link href="/Services">Ver más</Link>
          </section>
          {/* <Services /> */}
        </section>

        <section className={`${styles.accesorios}`}>
          <article className={styles.tipo}>
            <h2>Accesorios celulares</h2>
            <ImageSlider
              className={styles.slider}
              imagePaths={imagePath}
              enableTransition={false}
            />

            <Link href="#">Ver más</Link>
          </article>

          <article className={styles.tipo}>
            <h2>Accesorios computador</h2>
            <ImageSlider imagePaths={imagePath} enableTransition={false} />

            <Link href="#">Ver más</Link>
          </article>

          <article className={styles.tipo}>
            <h2>Accesorios damas</h2>
            <ImageSlider imagePaths={imagePath} enableTransition={false} />

            <Link href="#">Ver más</Link>
          </article>

          <article className={styles.tipo}>
            <h2>Accesorios varios</h2>
            <ImageSlider imagePaths={imagePath} enableTransition={false} />

            <Link href="#">Ver más</Link>
          </article>
        </section>

        <section className={styles.aleatorio}>
          <article>
            <ProductList />
          </article>
        </section>
      </main>
    </>
  );
};

export default Inicio;
