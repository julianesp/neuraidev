import React, { useContext } from "react";
import Head from "next/head";
import Layout from "../components/Layout.js";
import Image from "next/image.js";
import Slider from "../containers/Slider.js";
// images doc
import d1 from "/public/images/doctor/1.png";
import d2 from "/public/images/doctor/2.png";
import d3 from "/public/images/doctor/3.png";

// images cirugias
import c1 from "/public/images/cirugias/cirugia_vesicula.png";
import c2 from "/public/images/cirugias/colonoscopia.png";
import c3 from "/public/images/cirugias/lapa_vesicula.png";
import c4 from "/public/images/services/cirugia_laparoscopia_1.jpg";
import c5 from "/public/images/services/colecistectomia.jpg";
import c6 from "/public/images/services/patologias.jpg";
import c7 from "/public/images/services/colonoscopia.jpg";

import VisorImages from "../components/VisorImages.js";
// import imagesInfo from '../../data/images.json'
import styles from "../styles/Home.module.scss";
import ImageSlider from "../containers/ImageSlider.js";
import { Publicaciones } from "../components/Publicaciones.js";

const Home = () => {
  const imagePath = [d1, d2, d3];
  const cirugias = [c1, c2, c3, c4, c5, c6, c7];

  // Publicaciones
  // const { publicaciones } = useContext(Publicaciones);

  return (
    <Layout>
      <Head>
        <title>Servicio de cirugía general</title>
        {/* <link rel="icon" href="../app/favicon.ico" /> */}
        <meta name="description" content="Servicio de cirugía general" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.container}>
        <section className={styles.presentation}>
          <ImageSlider imagePaths={imagePath} enableTransition={true} />
        </section>

        <section className={styles.tratamientos}>
          <div className={styles.area}>
            <h3>Servicios</h3>

            <ul>
              <li>Formateo PC</li>
              <li>Mantenimiento PC</li>
              <li>Instalación programas</li>
              <li>Desarrollo páginas web</li>
            </ul>

            <button>Ver más</button>
          </div>
        </section>

        {/* <section className={styles.info}>
          <h2>Información</h2>
        </section> */}

        <section className={styles.horario}>
          <ImageSlider imagePaths={cirugias} enableTransition={false} />
        </section>

        <section className={styles.publications}>
          <h1>Publicaciones</h1>

          {/* <div>
            {publicaciones.map((publicacion, index) => (
              <div key={index}>
                <h2>{publicacion.titulo}</h2>
                <p>{publicacion.contenido}</p>
              </div>
            ))}
          </div> */}
        </section>

        <section className={styles.eventos__municipales}>
          <article className={styles.evento}>
            <p className="text-4xl">Eventos de mi pueblo</p>
          </article>
        </section>
      </main>
    </Layout>
  );
};

export default Home;