"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link.js";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import ImageSlider from "../containers/ImageSlider.js";
import ProductList from "@/containers/ProductList.jsx";
import CarouselDemo from "@/components/CarouselDemo";
import ImageCarousel from "@/components/ImageCarousel";
import Advertisement from "@/components/Advertisement";

const API = "/accesories.json";
const API_CELULARES = "/celulares.json";
const API_COMPUTADORES = "/computers.json";
const API_PRESENTATION = "/presentation.json";

const ads = [
  {
    businessName: "Peluquería",
    description: "Mejorar presentacion de personas",
    imageUrl: "",
    linkUrl: "#",
  },
  {
    businessName: "Peluquería",
    description: "Mejorar presentacion de personas",
    imageUrl: "",
    linkUrl: "#",
  },
  {
    businessName: "Peluquería",
    description: "Mejorar presentacion de personas",
    imageUrl: "",
    linkUrl: "#",
  },
];

const Inicio = () => {
  const [presentationSlides, setPresentationSlides] = useState();
  const [isLoaded, setIsLoaded] = useState(false);

  const [data, setData] = useState([]);

  // Solution for hydratation errors
  useEffect(() => {
    setIsLoaded(true);
    fetch("/accesories.json")
      .then((response) => response.json())
      .then((products) => {
        const normalizedData = products.map((product) => ({
          ...product,
          images: Array.isArray(product.images)
            ? product.images
            : [product.images],
        }));
        setData(normalizedData);
      });
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
      <main
        className={`${styles.container} bg-white text-black dark:bg-gray-800 dark:text-white`}
      >
        <section className={` ${styles.presentation}`}>
          <CarouselDemo apiUrl={API_PRESENTATION} />
        </section>

        <section className={`${styles.accesories}`}>
          <section className={styles.varios}>
            <article className={styles.tipo}>
              <h2>Accesorios celulares</h2>

              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              {/* <CarouselDemo apiUrl={API} /> */}

              <Link href="#">Ver más</Link>
            </article>
            <article className={styles.tipo}>
              <h2>Accesorios computador</h2>
              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              <Link href="#">Ver más</Link>
            </article>
            <article className={styles.tipo}>
              <h2>Accesorios damas</h2>
              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              <Link href="#">Ver más</Link>
            </article>
            <article className={styles.tipo}>
              <h2>Libros nuevos</h2>
              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              <Link href="#">Ver más</Link>
            </article>

            <article className={styles.tipo}>
              <h2>Libros usados</h2>
              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              <Link href="#">Ver más</Link>
            </article>
          </section>

          {/* colocar display grid para repartir lugares 
            crear clases para cada una */}
          {/* <section className={styles.several}>
            <div className={styles.titulo}>
              <h2>Anuncios</h2>
            </div>

            <div className={styles.api}>
              <ProductList API={API_CELULARES} maxImages={1} />
            </div>
          </section> */}
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

          <section className={styles.area}>
            <p>Espacio para mostrar imagenes</p>
          </section>
        </section>

        <section className={styles.publicidad}>
          <Advertisement ads={ads} />
        </section>
      </main>
    </>
  );
};

export default Inicio;
