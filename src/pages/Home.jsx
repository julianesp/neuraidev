"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link.js";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import ImageSlider from "../containers/ImageSlider.js";
import ProductList from "@/containers/ProductList.jsx";
import ProductItem from "@/components/ProductItem_original";
import FullViewportSlider from "@/components/FullViewSlider";
import CarouselDemo from "@/components/CarouselDemo";

const API = "/accesories.json";
const API_CELULARES = "/celulares.json";
const API_COMPUTADORES = "/computers.json";
const API_PRESENTATION = "/presentation.json";
const images = "/celulares.json";

const Inicio = () => {
  const [presentationSlides, setPresentationSlides] = useState();
  const [isLoaded, setIsLoaded] = useState(false);

  // Carousel
  const [data, setData] = useState([]);

  // Solution for hydratation errors
  useEffect(() => {
    setIsLoaded(true);

    // Cargar los datos de presentación
    // fetch(API_PRESENTATION)
    //   .then((response) => response.json())
    //   .then((data) => setPresentationSlides(data))
    //   .catch((error) =>
    //     console.error("Error loading presentation data:", error),
    //   );
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

  // useEffect(() => {
  //   fetch("/path-to-your-json/data.json")
  //     .then((response) => response.json())
  //     .then((products) => {
  //       const normalizedData = products.map((product) => ({
  //         ...product,
  //         images: Array.isArray(product.images)
  //           ? product.images
  //           : [product.images],
  //       }));
  //       setData(normalizedData);
  //     });
  // }, []);

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
          {/* <Carousel enableTransition={true}/>
           */}
          <CarouselDemo apiUrl={API_CELULARES} />
          {/* <Carousel apiUrl={API_CELULARES}/> */}
        </section>

        <section className={`${styles.accesorios}`}>
          <section className={styles.varios}>
            <article className={styles.tipo}>
              <h2>Accesorios celulares</h2>
              <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              />
              <Link href="#">
                <p>Ver más</p>
              </Link>
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

          <section className={styles.several}>
            <div className={styles.titulo}>
              <h2>Varios</h2>
            </div>
            {/* colocar display grid para repartir lugares  */}
            {/* crear clases para cada una */}

            <div className={styles.api}>
              <ProductList API={API_CELULARES} maxImages={1} />
            </div>
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

          <section className={styles.area}>
            <p>Espacio para mostrar imagenes</p>
          </section>
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
