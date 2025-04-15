"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import Link from "next/link.js";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import ImageSlider from "../containers/ImageSlider.js";
import ProductList from "@/containers/ProductList.jsx";
import CarouselDemo from "@/components/CarouselDemo";
import ImageCarousel from "@/components/ImageCarousel";
import Advertisement from "@/components/Advertisement";
import AccesoriosDestacados from "@/components/Accesorio/AccesoriosDestacados";
import ParallaxSection from "@/components/ParallaxSection";
import NightSkyHero from "@/components/NightSkyHero";

import { Button } from "@/components/ui/button";
import AccesoriosNuevos from "@/components/Accesorio/AccesoriosNuevos";
import BackToTop from "@/components/backTop/BackToTop";
import AccesoriosContainer from "@/app/accesorios/destacados/page";

const API = "/accesories.json";
const API_CELULARES = "/celulares.json";
const API_COMPUTADORES = "/computers.json";
const API_PRESENTATION = "/presentation.json";
const API_DESTACADOS = "/destacados.json";
const API_ACCESORIOS_CONTAINER = "/accesoriesContainer.json";

// IDs especificos para cada categpria de accesorios
const CATEGORIA_IDS = {
  CELULARES: "celulares",
  COMPUTADORES: "computadores",
  DAMAS: "damas",
  LIBROS_NUEVOS: "libros-nuevos",
  LIBROS_USADOS: "libros-usados",
};

export default function Inicio() {
  const [presentationSlides, setPresentationSlides] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState([]);
  const [images, setImages] = useState([]);
  const [presentationImages, setPresentationImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accesoriosData, setAccesoriosData] = useState([]);

  // Referencias para elementos con animación de scroll
  const servicesRef = useRef(null);
  const accesoriesRef = useRef(null);
  const destacadosRef = useRef(null);
  const publicidadRef = useRef(null);
  const linkDirectRef = useRef(null);

  // Referencias para elementos con animaciones laterales
  const celularesRef = useRef(null);
  const computadoresRef = useRef(null);
  const damasRef = useRef(null);
  const librosNuevosRef = useRef(null);
  const librosUsadosRef = useRef(null);

  // Efecto para manejar las animaciones al hacer scroll
  useEffect(() => {
    const handleScrollAnimation = () => {
      const fadeInElements = [
        servicesRef.current,
        accesoriesRef.current,
        destacadosRef.current,
        publicidadRef.current,
        linkDirectRef.current,
      ];

      // Elementos que entrarán desde la izquierda
      const fadeInLeftElements = [
        celularesRef.current,
        damasRef.current,
        librosUsadosRef.current,
      ];

      // Elementos que entrarán desde la derecha
      const fadeInRightElements = [
        computadoresRef.current,
        librosNuevosRef.current,
      ];

      // Animación para elementos fadeIn
      fadeInElements.forEach((element) => {
        if (!element) return;

        const position = element.getBoundingClientRect();

        // Si el elemento está visible en la pantalla
        if (position.top < window.innerHeight * 0.8 && position.bottom >= 0) {
          element.classList.add(styles.visible);
        }
      });

      // Animación para elementos fadeInLeft
      fadeInLeftElements.forEach((element) => {
        if (!element) return;

        const position = element.getBoundingClientRect();

        // Si el elemento está visible en la pantalla
        if (position.top < window.innerHeight * 0.9 && position.bottom >= 0) {
          element.classList.add(styles.visibleLeft);
        }
      });

      // Animación para elementos fadeInRight
      fadeInRightElements.forEach((element) => {
        if (!element) return;

        const position = element.getBoundingClientRect();

        // Si el elemento está visible en la pantalla
        if (position.top < window.innerHeight * 0.9 && position.bottom >= 0) {
          element.classList.add(styles.visibleRight);
        }
      });
    };

    // Ejecutamos la función una vez para los elementos ya visibles
    setTimeout(handleScrollAnimation, 300);

    // Agregamos el evento de scroll
    window.addEventListener("scroll", handleScrollAnimation);

    return () => {
      window.removeEventListener("scroll", handleScrollAnimation);
    };
  }, [isLoaded]);

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

        // Simulamos un pequeño retraso
        setTimeout(() => {
          setAccesoriosData(datos);
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (!isLoaded) return null;

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
  const ads = [
    {
      businessName: "Negocio",
      description: "Descripción de negocio",
      imageUrl: "",
      linkUrl: "/business/Tienda",
    },
    {
      businessName: "Peluquería",
      description: "Mejore su presentación",
      imageUrl: "",
      linkUrl: "/business/Peluqueria",
    },
    {
      businessName: "Tercena  ",
      description: "La mejor calidad en carnes",
      imageUrl: "",
      linkUrl: "#",
    },
  ];

  return (
    <>
      <Head>
        <title>Inicio</title>
        <link rel="icon" href="/favicon.ico" />
        <meta content="Página de inicio" />
      </Head>

      <main
        className={`${styles.container} bg-white text-black dark:bg-gray-800 dark:text-white`}
        style={{ margin: 0, padding: 0 }}
      >
        {/* Sección Hero - contenedor con altura controlada */}
        <div className={`${styles.presentacion}`}>
          <NightSkyHero />
        </div>

        {/* Sección del carrusel/publicidad principal - altura controlada */}
        <div
          className={`${styles.publicidad} w-full max-w-full overflow-hidden`}
          style={{ maxHeight: "350px" }}
        >
          <CarouselDemo apiUrl={API_CELULARES} />
        </div>

        {/* Botones de Servicios y Accesorios fijos en móvil, normales en desktop */}
        <div className=" left-0 w-full z-50 bg-white shadow-md py-2 flex justify-center gap-5 md:static md:shadow-none md:bg-transparent md:py-4 md:mb-2">
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById("services");
              if (!element) return;

              // Scroll al elemento
              const offsetTop =
                element.getBoundingClientRect().top + window.pageYOffset - 100;
              window.scrollTo({
                top: offsetTop,
                behavior: "smooth",
              });

              // Animación de rebote
              setTimeout(() => {
                element.classList.remove(styles.bounceAnimation);
                void element.offsetWidth;
                element.classList.add(styles.bounceAnimation);

                setTimeout(() => {
                  element.classList.remove(styles.bounceAnimation);
                }, 1000);
              }, 500);
            }}
            className="px-4 py-2 bg-slate-200 rounded-md border border-slate-300 hover:bg-slate-300 transition-all"
          >
            Servicios
          </a>
          <a
            href="#accesories"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById("accesories");
              if (!element) return;

              // Scroll al elemento
              const offsetTop =
                element.getBoundingClientRect().top + window.pageYOffset - 80;
              window.scrollTo({
                top: offsetTop,
                behavior: "smooth",
              });

              // Animación de rebote
              setTimeout(() => {
                element.classList.remove(styles.bounceAnimation);
                void element.offsetWidth;
                element.classList.add(styles.bounceAnimation);

                setTimeout(() => {
                  element.classList.remove(styles.bounceAnimation);
                }, 1000);
              }, 500);
            }}
            className="px-4 py-2 bg-slate-200 rounded-md border border-slate-300 hover:bg-slate-300 transition-all"
          >
            Accesorios
          </a>
        </div>

        {/* Sección de productos destacados con animación */}
        <section
          ref={destacadosRef}
          className={`${styles.destacados} ${styles.fadeInUp}`}
        >
          <AccesoriosDestacados />
          <AccesoriosNuevos />
        </section>

        {/* Sección de servicios */}
        <section
          ref={servicesRef}
          className={`${styles.tratamientos} ${styles.fadeInUp}`}
        >
          <section className={styles.area}>
            <h3 id="services">Servicios</h3>

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

        {/* Sección de accesorios */}
        <section
          ref={accesoriesRef}
          className={`${styles.accesories} ${styles.fadeInUp}`}
        >
          <section className={styles.varios}>
            <h1 id="accesories" className={styles.accesoriesTitle}>
              Accesorios
            </h1>

            {/* Artículo con animación desde la izquierda */}
            <article
              ref={celularesRef}
              className={`${styles.tipo} ${styles.fadeInLeft}`}
            >
              <h2>Celulares</h2>

              <CarouselDemo
                className="h-80"
                apiUrl={API_CELULARES}
                showIndicators={false}
              />

              <Link href={`/ProductoDetalle?id=${CATEGORIA_IDS.CELULARES}`}>
                Ver más
              </Link>
            </article>

            {/* Artículo con animación desde la derecha */}
            <article
              ref={computadoresRef}
              className={`${styles.tipo} ${styles.fadeInRight}`}
            >
              <h2>Computadores</h2>

              <CarouselDemo apiUrl={API_COMPUTADORES} showIndicators={false} />

              <Link href={`/ProductoDetalle?id=${CATEGORIA_IDS.COMPUTADORES}`}>
                Ver más
              </Link>
            </article>

            {/* Artículo con animación desde la izquierda */}
            <article
              ref={damasRef}
              className={`${styles.tipo} ${styles.fadeInLeft}`}
            >
              <h2>Damas</h2>

              <CarouselDemo apiUrl={API_COMPUTADORES} showIndicators={false} />
              <Link href={`/ProductoDetalle?id=${CATEGORIA_IDS.DAMAS}`}>
                Ver más
              </Link>
            </article>

            {/* Artículo con animación desde la derecha */}
            <article
              ref={librosNuevosRef}
              className={`${styles.tipo} ${styles.fadeInRight}`}
            >
              <h2>Libros nuevos</h2>

              <CarouselDemo apiUrl={API_COMPUTADORES} showIndicators={false} />
              <Link href={`/ProductoDetalle?id=${CATEGORIA_IDS.LIBROS_NUEVOS}`}>
                Ver más
              </Link>
            </article>

            {/* Artículo con animación desde la izquierda */}
            <article
              ref={librosUsadosRef}
              className={`${styles.tipo} ${styles.fadeInLeft}`}
            >
              <h2>Libros usados</h2>

              <CarouselDemo apiUrl={API_COMPUTADORES} showIndicators={false} />
              <Link href={`/ProductoDetalle?id=${CATEGORIA_IDS.LIBROS_USADOS}`}>
                Ver más
              </Link>
            </article>
          </section>
        </section>

        {/* Sección de publicidad lateral con z-index mejorado */}
        <section className="relative z-50">
          <Advertisement ads={ads} />
        </section>

        <div className="mb-16 md:mb-0">
          <BackToTop />
        </div>
      </main>
    </>
  );
}
