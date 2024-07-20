import React, { useContext } from 'react';
import Head from 'next/head';
// import Layout from "../components/Layout.js";

import Image from 'next/image.js';
import Slider from '../containers/Slider.js';
// images doc
import d1 from '/public/images/1.jpg';
import d2 from '/public/images/2.jpg';
import d3 from '/public/images/3.jpg';

// images cirugias
import c1 from '/public/images/1.jpg';
import c2 from '/public/images/2.jpg';
import c3 from '/public/images/3.jpg';
import c4 from '/public/images/4.jpg';
import c5 from '/public/images/5.jpg';
import c6 from '/public/images/6.jpg';
import c7 from '/public/images/7.jpg';

import VisorImages from '../components/VisorImages.js';
// import imagesInfo from '../../data/images.json'
import styles from '../styles/Home.module.scss';
import ImageSlider from '../containers/ImageSlider.js';
import { Publicaciones } from '../components/Publicaciones.js';
import RootLayout from '@/app/layout.js';

const Inicio = () => {
    const imagePath = [d1, d2, d3];
    const cirugias = [c1, c2, c3, c4, c5, c6, c7];

    // Publicaciones
    // const { publicaciones } = useContext(Publicaciones);

    return (
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

                    <button>Ver más</button>
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
    );
};

export default Inicio;
