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
import AccesoriosPage from "./AccesoriosPage";
import { Button } from "@/components/ui/button";

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

  // cargadno datos para accesorios
  // Estado para los datos de accesorios
  const [accesoriosData, setAccesoriosData] = useState([]);
  // const [loading, setLoading] = useState(true);

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

    // Simulando carga de datos
    // En una aplicación real, aquí harías una llamada a tu API
    const cargarDatos = () => {
      try {
        // Datos de ejemplo - En una app real, estos vendrían de una API/servidor
        const datos = [
          {
            id: 1,
            images: [
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fteclado_genius.jpg?alt=media&token=5a9ecc50-db16-4d9a-b00c-a01de3c506b3",
              "",
            ],
            title: "Teclado Genius básico",
            description: "Teclado Genius básico con conexión USB",
            price: "39.500",
          },
          {
            id: 2,
            images: [
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F1.jpg?alt=media&token=191dc074-94cd-4ac1-89de-62070679a96e",
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F2.jpg?alt=media&token=dd5ebf3c-578d-4010-a256-650df448dc2b",
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F3.jpg?alt=media&token=82806339-47f0-44f6-8be5-cef6f138c8f6",
            ],
            title: "Cámara Genius",
            description:
              "Ideal para videollamadas o tareas simples. Es compatible con computadoras a través de USB.",
            price: "84.900",
          },
          {
            id: 3,
            images: [
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fram%20ddr3l%2F1.jpg?alt=media&token=6a358cee-9ebf-4255-8acf-e93fbff3ad25",
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fram%20ddr3l%2F2.jpg?alt=media&token=af3ae254-2d27-478b-9b1e-8f0bde678ab1",
            ],
            title: "Memoria RAM DDR3L",
            description:
              "Una memoria RAM DDR3L es un módulo de memoria de bajo consumo (1.35V) diseñado para mejorar la eficiencia.",
            price: "44.900",
          },
          {
            id: 4,
            images:
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
            title: "Bombillo USB",
            description: "Bombillo USB para iluminar tu teclado",
            price: "9.900",
          },
          {
            id: 5,
            images:
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
            title: "Bombillo USB",
            description: "Bombillo USB para iluminar tu teclado",
            price: "9.900",
          },
          {
            id: 6,
            images:
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fluces_bici.jpg?alt=media&token=6dca1abb-ec2d-41ed-88a1-5fb7dc4474aa",
            title: "Luces bicicleta",
            description:
              "Luces delatera y trasera para bicicleta con batería recargable",
            price: "34.900",
          },
        ];

        // Simulamos un pequeño retraso para simular carga desde un servidor
        setTimeout(cargarDatos, 300);

        setAccesoriosData(datos);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setLoading(false);
      }
    };
  }, []);
  if (!isLoaded) return null;

  // code for accesories
  // Indicador de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-700">Cargando accesorios...</p>
        </div>
      </div>
    );
  }

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

        <section>
          <AccesoriosPage />
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

              <Link href="AccesoriosPage">Ver más</Link>
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

        <section>
          <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">
              Bienvenido a nuestra tienda
            </h1>

            {/* Opción 1: Usando el componente Button con Link */}
            <div className="mb-4">
              <Link href="/AccesoriosPage">
                <Button className="px-6">Ver Accesorios</Button>
              </Link>
            </div>

            {/* Opción 2: Usando Link directamente con estilos de botón */}
            <div className="mb-4">
              <Link
                href="/accesorios"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Explorar Accesorios
              </Link>
            </div>

            {/* Opción 3: Usando el componente Button con asChild */}
            <div>
              <Button asChild>
                <Link href="/accesorios">Catálogo de Accesorios</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.publicidad}>
          <Advertisement ads={ads} />
        </section>
      </main>
    </>
  );
};

export default Inicio;
