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
import AccesoriosBase from "@/components/Accesorio/AccesoriosBase";
import AccesoriosDestacados from "@/components/Accesorio/AccesoriosDestacados";

const API = "/accesories.json";
const API_CELULARES = "/celulares.json";
const API_COMPUTADORES = "/computers.json";
const API_PRESENTATION = "/presentation.json";
// const imagesData = "/presentation.json";

const accesoriosData = [
  {
    id: 1,
    nombre: "Collar Elegante",
    descripcion: "Collar elegante con piedras preciosas",
    precio: 29.99,
    precioAnterior: 39.99,
    descuento: 25,
    imagen: "/accesorios/collar.jpg",
    calificacion: 4,
    numResenas: 128,
    destacado: true,
  },
  {
    id: 2,
    nombre: "Pulsera Vintage",
    descripcion: "Pulsera de estilo vintage con acabado en plata",
    precio: 19.99,
    precioAnterior: 0,
    descuento: 0,
    imagen: "/accesorios/pulsera.jpg",
    calificacion: 5,
    numResenas: 93,
    destacado: true,
  },
  // Más accesorios...
];

const handleAccesorioClick = (accesorio) => {
  console.log("Accesorio seleccionado:", accesorio.nombre);
};

const ads = [
  {
    businessName: "Peluquería",
    description: "Mejorar presentacion de personas",
    imageUrl: "",
    linkUrl: "#",
  },
  {
    businessName: "Agropecuaria",
    description: "Encuentre lo mejor en abonos",
    imageUrl: "",
    linkUrl: "#",
  },
  {
    businessName: "Tercena  ",
    description: "La mejor calidad en carnes",
    imageUrl: "",
    linkUrl: "#",
  },
];

const imagesData = [
  {
    id: 1,
    images: [
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation/presentationFormateo.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb24vcHJlc2VudGF0aW9uRm9ybWF0ZW8uanBnIiwiaWF0IjoxNzQwNDQ1MTg4LCJleHAiOjE3NzE5ODExODh9.xabEBNZ0LO0hAOu4XFgKBxzHJmpRk6lwBmsgibGdIls",
    ],
  },
  {
    id: 2,
    images:
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation/contavsib.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb24vY29udGF2c2liLmpwZyIsImlhdCI6MTc0MDQ0NTIzOSwiZXhwIjoxNzcxOTgxMjM5fQ.NH5PlczGcHafNYVapMBOMwD0SXZYzjsn-ICkwaO2OK4",
  },
];

const Inicio = () => {
  const [presentationSlides, setPresentationSlides] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState([]);
  const [images, setImages] = useState([]);
  const [presentationImages, setPresentationImages] = useState([]);
  const [loading, setLoading] = useState(true);

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

    fetch(API_PRESENTATION)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Normalizar las imágenes a un array
          const normalized = data.map((item) => ({
            ...item,
            images: Array.isArray(item.images) ? item.images : [item.images],
          }));
          const allImages = normalized.flatMap((item) => item.images);
          setPresentationImages(allImages);
        }
      })
      .catch((error) => console.error("Error cargando presentación:", error))
      .finally(() => setLoading(false));
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
          {/* <CarouselDemo apiUrl={API_PRESENTATION} /> */}
          <CarouselDemo apiUrl={API_CELULARES} />
        </section>

        <section className={styles.destacados}>
          <AccesoriosDestacados
            accesorios={accesoriosData}
            mostrarDescripcion={false}
            onAccesorioClick={handleAccesorioClick}
          />
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

        <section className={`${styles.accesories}`}>
          <section className={styles.varios}>
            <article className={styles.tipo}>
              <h2>Accesorios celulares</h2>

              {/* <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              /> */}
              <CarouselDemo apiUrl={API_CELULARES} />

              <Link href="#">Ver más</Link>
            </article>
            <article className={styles.tipo}>
              <h2>Accesorios computador</h2>
              {/* <ImageSlider
                className={styles.slider}
                imagePaths={imagePath}
                enableTransition={false}
              /> */}
              <CarouselDemo apiUrl={API_COMPUTADORES} />
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

        <section className={styles.publicidad}>
          <Advertisement ads={ads} />
        </section>
      </main>
    </>
  );
};

export default Inicio;
