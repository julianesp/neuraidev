"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link.js";
import Head from "next/head";
import styles from "../styles/pages/Home.module.scss";
import Advertisement from "../components/Advertisement";
import AccesoriosDestacados from "../components/Accesorio/AccesoriosDestacados";
import NightSkyHero from "../components/NightSkyHero";
import AccesoriosNuevos from "../components/Accesorio/AccesoriosNuevos";
import BackToTop from "../components/backTop/BackToTop";
import { CarouselDemo } from "./CarouselDemo";
import ProductList from "./ProductList";

const API_CELULARES = "/celulares.json";
const API_COMPUTADORES = "/computers.json";
const API_BOOKS_NEW = "/accesoriesBooksNew.json";
const API_BOOKS_OLD = "/accesoriesBooksOld.json";
const API_PRESENTATION = "/presentation.json";
const API_ACCESORIOS = "/accesories.json";

// IDs especificos para cada categpria de accesorios
const CATEGORIA_IDS = {
  CELULARES: "celulares",
  COMPUTADORES: "computadores",
  DAMAS: "damas",
  LIBROS_NUEVOS: "libros-nuevos",
  LIBROS_USADOS: "libros-usados",
  ACCESORIOS: "accesorios",
};

export default function Inicio() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState([]);

  const [presentationImages, setPresentationImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for toggling product lists visibility
  const [showCelulares, setShowCelulares] = useState(false);
  const [showComputadores, setShowComputadores] = useState(false);
  const [showDamas, setShowDamas] = useState(false);
  const [showLibrosNuevos, setShowLibrosNuevos] = useState(false);
  const [showLibrosUsados, setShowLibrosUsados] = useState(false);
  const [showAccesorios, setShowAccesorios] = useState(false);

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
  const accesoriosRef = useRef(null);

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
        accesoriosRef.current,
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
  }, [data, setData, setLoading, setPresentationImages]);

  if (!isLoaded) return null;

  // const imagePath = [accesorios[0].d1, accesorios[1].d2];
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
      businessName: "Tercena",
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

        {/* Sección de carrusel */}
        <div className={`${styles.carrusel}`}>
          <CarouselDemo apiUrl={API_CELULARES} />
        </div>

        {/* Sección lateral de anuncios */}
        <section
          className={`${styles.aside}`}
          style={{
            display: "block",
            gridArea: "aside",
            width: "100%",
            maxWidth: "300px",
            justifySelf: "end",
            position: "relative",
            marginLeft: "0",
          }}
        >
          <Advertisement ads={ads} />
        </section>

        {/* Botones de Servicios y Accesorios */}
        <div
          className={`${styles.directos} w-full z-50 bg-white shadow-md py-2 flex justify-center gap-5 md:static md:shadow-none md:bg-transparent md:py-4 md:mb-2`}
        >
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

        {/* Sección de tratamientos */}
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

              {/* <button
                onClick={() => setShowCelulares(!showCelulares)}
                className={`px-4 py-2 bg-slate-200 rounded-md border border-slate-300 hover:bg-slate-300 transition-all`}
              >
                {showCelulares ? "Ver menos" : "Ver más"}
              </button> */}

              <Link
                href="/accesorios/celulares"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ver más
              </Link>

              {showCelulares && (
                <div className="mt-8 w-full">
                  <ProductList API={API_CELULARES} />
                </div>
              )}
            </article>

            {/* Artículo con animación desde la derecha */}
            <article
              ref={computadoresRef}
              className={`${styles.tipo} ${styles.fadeInRight}`}
            >
              <h2>Computadores</h2>

              <CarouselDemo apiUrl={API_COMPUTADORES} showIndicators={false} />

              <button
                onClick={() => setShowComputadores(!showComputadores)}
                className={`px-4 py-2 bg-slate-200 rounded-md border border-slate-300 hover:bg-slate-300 transition-all`}
              >
                {showComputadores ? "Ver menos" : "Ver más"}
              </button>

              {showComputadores && (
                <div className="mt-8 w-full">
                  <ProductList API={API_COMPUTADORES} />
                </div>
              )}
            </article>

            {/* Artículo con animación desde la izquierda */}
            <article
              ref={damasRef}
              className={`${styles.tipo} ${styles.fadeInLeft}`}
            >
              <h2>Damas</h2>

              <CarouselDemo apiUrl={API_COMPUTADORES} showIndicators={false} />

              <button
                onClick={() => setShowDamas(!showDamas)}
                className={`px-4 py-2 bg-slate-200 rounded-md border border-slate-300 hover:bg-slate-300 transition-all`}
              >
                {showDamas ? "Ver menos" : "Ver más"}
              </button>

              {showDamas && (
                <div className="mt-8 w-full">
                  <ProductList API={API_COMPUTADORES} />
                </div>
              )}
            </article>

            {/* Artículo con animación desde la derecha */}
            <article
              ref={librosNuevosRef}
              className={`${styles.tipo} ${styles.fadeInRight}`}
            >
              <h2>Libros nuevos</h2>

              <CarouselDemo apiUrl={API_BOOKS_NEW} showIndicators={false} />

              <button
                onClick={() => setShowLibrosNuevos(!showLibrosNuevos)}
                className={`px-4 py-2 bg-slate-200 rounded-md border border-slate-300 hover:bg-slate-300 transition-all`}
              >
                {showLibrosNuevos ? "Ver menos" : "Ver más"}
              </button>

              {showLibrosNuevos && (
                <div className="mt-8 w-full">
                  <ProductList API={API_BOOKS_NEW} />
                </div>
              )}
            </article>

            {/* Artículo con animación desde la izquierda */}
            <article
              ref={librosUsadosRef}
              className={`${styles.tipo} ${styles.fadeInLeft}`}
            >
              <h2>Libros usados</h2>

              <CarouselDemo apiUrl={API_BOOKS_OLD} showIndicators={false} />

              <button
                onClick={() => setShowLibrosUsados(!showLibrosUsados)}
                className={`px-4 py-2 bg-slate-200 rounded-md border border-slate-300 hover:bg-slate-300 transition-all`}
              >
                {showLibrosUsados ? "Ver menos" : "Ver más"}
              </button>

              {showLibrosUsados && (
                <div className="mt-8 w-full">
                  <ProductList API={API_BOOKS_OLD} />
                </div>
              )}
            </article>

            {/* Artículo de accesorios con animación desde la izquierda */}
            <article
              ref={accesoriosRef}
              className={`${styles.tipo} ${styles.fadeInLeft}`}
            >
              <h2>Accesorios</h2>

              <CarouselDemo apiUrl={API_ACCESORIOS} showIndicators={false} />

              <button
                onClick={() => setShowAccesorios(!showAccesorios)}
                className={`px-4 py-2 bg-slate-200 rounded-md border border-slate-300 hover:bg-slate-300 transition-all`}
              >
                {showAccesorios ? "Ver menos" : "Ver más"}
              </button>

              {showAccesorios && (
                <div className="mt-8 w-full">
                  <ProductList API={API_ACCESORIOS} />
                </div>
              )}
            </article>
          </section>
        </section>

        <div className="mb-16 md:mb-0">
          <BackToTop />
        </div>
      </main>
    </>
  );
}
