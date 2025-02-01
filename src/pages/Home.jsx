"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link.js";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import ImageSlider from "../containers/ImageSlider.js";
import ProductList from "@/containers/ProductList.jsx";
import ProductItem from "@/components/ProductItem_original";
import FullViewportSlider from "@/components/FullViewSlider";

const API = "/accesories.json";
const API_CELULARES = "/celulares.json";
const API_COMPUTADORES = "/computers.json";

const Inicio = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  const accesorios = [
    {
      d1: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation/books.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb24vYm9va3MuanBnIiwiaWF0IjoxNzM4NDUwMjE5LCJleHAiOjE3Njk5ODYyMTl9.vZ5Vgxn90xQQmFP0-bF7mHL_avaTgCtH3WPl3QEBeDc",
    },
    {
      d2: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation/studio.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb24vc3R1ZGlvLnBuZyIsImlhdCI6MTczODQ1MDI0OSwiZXhwIjoxNzY5OTg2MjQ5fQ.Z9bCl5d21bFBn8zih4u7zX3qkFyuCT3_iQlgCBk-DR4",
    },
  ];

  const imagePath = [accesorios[0].d1, accesorios[1].d2];

  return (
    <>
      <Head>
        <title>Inicio</title>
        <link rel="icon" href="/favicon.ico" />
        <meta content="Página de inicio" />
      </Head>
      <main className={styles.container}>
        <section className={` ${styles.presentation}`}>
          {/* <ImageSlider imagePaths={imagePath} enableTransition={true} /> */}
          <FullViewportSlider slides={API}/>
        </section>

        {/* <section
          className={styles.aleatorio}
          class="glass"
          data-theme="cupcake"
        >
          <h1 className="text-2xl font-bold mb-6">Accesorios en aleatorio</h1>
          <ProductList API={API} maxImages={1} />
        </section> */}

        {/* <section className={styles.aleatorio}>
          <h1 className="text-2xl font-bold mb-6">
            Nuestros Productos Destacados
          </h1>

          <ProductList API={API} maxImages={1} />
        </section>

        <section className={styles.aleatorio}>
          <h1 className="text-2xl font-bold mb-6">
            Nuestros Productos Destacados
          </h1>

          <ProductList API={API_CELULARES} maxImages={1} />
        </section> */}

        <section className={`${styles.accesorios}`}>
          <section className={styles.varios}>
            <article className={styles.tipo}>
              <h2>Accesorios celulares</h2>
              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              <Link href="#">Ver más</Link>

              {/* <ProductList API={API_CELULARES} maxImages={1}/> */}
            </article>
            <article className={styles.tipo}>
              <h2>Accesorios celulares</h2>
              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              <Link href="#">Ver más</Link>

              {/* <ProductList API={API_CELULARES} maxImages={1}/> */}
            </article>
            <article className={styles.tipo}>
              <h2>Accesorios celulares</h2>
              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              <Link href="#">Ver más</Link>

              {/* <ProductList API={API_CELULARES} maxImages={1}/> */}
            </article>
            <article className={styles.tipo}>
              <h2>Accesorios celulares</h2>
              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              <Link href="#">Ver más</Link>

              {/* <ProductList API={API_CELULARES} maxImages={1}/> */}
            </article>
          </section>

          <section className={styles.several}>
            <ProductList API={API_CELULARES} maxImages={1} />
          </section>
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

        {/* <section className={styles.aleatorio}>
          <article>
            <ProductList API={API} maxImages={1} />
          </article>
        </section>

        <section className={styles.aleatorio}>
          <article>
            <ProductList API={API_COMPUTADORES} maxImages={1} />
          </article>
        </section> */}
      </main>
    </>
  );
};

export default Inicio;
