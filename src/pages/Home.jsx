"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link.js";

import VisorImages from "../components/VisorImages.js";
// import imagesInfo from '../../data/images.json'
import styles from "../styles/Home.module.scss";
import ImageSlider from "../containers/ImageSlider.js";
import { Publicaciones } from "../components/Publicaciones.js";
import RootLayout from "@/app/layout.js";
import Services from "../pages/Services.jsx";
import Head from "next/head.js";

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
    <RootLayout>
      <Head>
        <title>Inicio</title>
      </Head>
      <main className={styles.container}>
        <section className={`mt-6 ${styles.presentation}`}>
          <ImageSlider imagePaths={imagePath} enableTransition={true} />
        </section>

        <section className={`mb-0 ${styles.tratamientos}`}>
          <div className={styles.area}>
            <h3>Servicios</h3>

            <ul>
              <li>Formateo PC</li>
              <li>Mantenimiento PC</li>
              <li>Instalación programas</li>
              <li>Desarrollo páginas web</li>
            </ul>

            <Link href="/Services">Ver más</Link>
          </div>
        </section>

        {/* <section className={styles.info}>
          <h2>Información</h2>
        </section> */}

        <section className={styles.horario}>
          {/* <ImageSlider imagePaths={cirugias} enableTransition={false} /> */}
        </section>

        {/* className={styles.publications} */}
        <section>
          <ImageSlider imagePaths={imagePath} enableTransition={false} />

          {/* <div>
            {publicaciones.map((publicacion, index) => (
              <div key={index}>
                <h2>{publicacion.titulo}</h2>
                <p>{publicacion.contenido}</p>
              </div>
            ))}
          </div> */}
        </section>

        <section className={`p-1 ${styles.eventos__municipales}`}>
          <article
            className={`flex justify-center items-center w-screen h-80 mx-3 p-3 mt-10 rounded-xl border-slate-500 border-solid border-2 ${styles.evento}`}
          >
            <h2 className="text-2xl">Eventos municipales</h2>
          </article>
        </section>
      </main>
    </RootLayout>
  );
};

export default Inicio;