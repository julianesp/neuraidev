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
import Image from "next/image";

const API_CELULARES = "/celulares.json";
const API_COMPUTADORES = "/computers.json";
const API_BOOKS_NEW = "/accesoriesBooksNew.json";
const API_BOOKS_OLD = "/accesoriesBooksOld.json";
const API_PRESENTATION = "/presentation.json";
const API_ACCESORIOS = "/accesories.json";
const API_GENERALES = "/accesories_generales.json";

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
  }, []);

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
          {/* <CarouselDemo apiUrl={API_CELULARES} /> */}
          <CarouselDemo
            apiUrl={API_ACCESORIOS}
            showArrows={true}
            enableTransitions={true}
            showIndicators={true}
          />
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
            height: "100%",
          }}
        >
          <Advertisement ads={ads} />
        </section>

        {/* Botones de Servicios y Accesorios */}
        <div
          className={`${styles.directos} w-full z-50 bg-black  shadow-md py-2 flex justify-center gap-5 md:static md:shadow-none md:bg-transparent md:py-4 md:mb-2 dark:`}
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
            className="px-4 py-2  rounded-md border border-slate-300 hover:bg-slate-300 transition-all text-white dark:text-white"
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
            className="px-4 py-2  rounded-md border border-slate-300 hover:bg-slate-300 transition-all text-white dark:text-white"
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

        {/*         
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
        </section> */}

        {/* Sección de accesorios */}
        <section
          ref={accesoriesRef}
          className={`${styles.accesories} ${styles.fadeInUp}`}
        >
          <section className={styles.varios}>
            <h1 id="accesories" className={`${styles.accesoriesTitle} `}>
              <span className="text-black dark:text-white dark:bg-dark ">
                Accesorios
              </span>
            </h1>

            {/* Artículo con animación desde la izquierda */}
            <article
              ref={celularesRef}
              className={`${styles.tipo} ${styles.fadeInLeft} `}
            >
              <h2 className="text-black dark:text-black">Celulares</h2>

              <Image
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2FCelulares%2Fcable%20pzoz%20100w%20c%20-%20c%2FScreenshot_2025-05-13-21-31-33-554_com.alibaba.aliexpresshd-edit.jpg?alt=media&token=fa0d2a66-8a7e-4551-98f3-a7dd8105a0d5"
                alt="Celulares"
                width={300}
                height={200}
                sizes="(max-width: 768px) 100vw, 300px"
                className="mt-4 rounded-md"
              />

              <Link
                href="/accesorios/celulares"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ver más
              </Link>
            </article>

            {/* Artículo con animación desde la derecha */}
            <article
              ref={computadoresRef}
              className={`${styles.tipo} ${styles.fadeInRight}`}
            >
              <h2 className="text-black dark:text-black">Computadores</h2>

              <Image
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fram%20ddr4%2Fram%20ddr4%208gb.jpg?alt=media&token=8c1fd852-a254-4671-9bf8-739b8715954b"
                alt="Computadores"
                width={300}
                height={200}
                sizes="(max-width: 768px) 100vw, 300px"
                className="mt-4 rounded-md"
              />

              <Link
                href="/accesorios/computadoras"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ver más
              </Link>
            </article>

            {/* Artículo con animación desde la izquierda */}
            <article
              ref={damasRef}
              className={`${styles.tipo} ${styles.fadeInLeft}`}
            >
              <h2 className="text-black dark:text-black">Damas</h2>

              <Image
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fdamas%2Frizador%2F470206118_122195128148083804_8173820928240704070_n.jpg?alt=media&token=dfb4c27d-7dc7-4ad6-9f94-a60f2c2afc72"
                alt="Damas"
                width={300}
                height={200}
                sizes="(max-width: 768px) 100vw, 300px"
                className="mt-4 rounded-md"
              />

              <Link
                href="/accesorios/damas"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ver más
              </Link>
            </article>

            {/* Artículo con animación desde la derecha */}
            <article
              ref={librosNuevosRef}
              className={`${styles.tipo} ${styles.fadeInRight}`}
            >
              <h2 className="text-black dark:text-black">Libros nuevos</h2>

              <Image
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbooks%2Fnew%2Fenamorate%20de%20ti%2F480534106_122204421584083804_6430148799072894958_n.jpg?alt=media&token=ba8c5d5b-6bf3-478c-aaf6-0f50bfe22be1"
                alt="Libros Nuevos"
                width={300}
                height={200}
                sizes="(max-width: 768px) 100vw, 300px"
                className="mt-4 rounded-md"
              />

              <Link
                href="/accesorios/libros-nuevos"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ver más
              </Link>
            </article>

            {/* Artículo con animación desde la izquierda */}
            <article
              ref={librosUsadosRef}
              className={`${styles.tipo} ${styles.fadeInLeft}`}
            >
              <h2 className="text-black dark:text-black">Libros usados</h2>

              <Image
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbooks%2Fold%2Fcircuitos%20electricos%2F1.jpg?alt=media&token=5ca250e3-8461-4415-9f0d-1da8e6ae8f6a"
                alt="Libros Usados"
                width={300}
                height={200}
                sizes="(max-width: 768px) 100vw, 300px"
                className="mt-4 rounded-md"
              />

              <Link
                href="/accesorios/libros-usados"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ver más
              </Link>
            </article>

            {/* Artículo de accesorios con animación desde la izquierda */}
            <article
              ref={accesoriosRef}
              className={`${styles.tipo} ${styles.fadeInLeft}`}
            >
              <h2 className="text-black dark:text-black">Generales</h2>

              <Image
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fgeneral%2Fcepillo%20pets%2F488471910_122211784658083804_5069962783250805604_n.jpg?alt=media&token=7a9310af-278b-42de-b45c-62a1b25a6ee3"
                alt="Accesorios"
                width={300}
                height={200}
                sizes="(max-width: 768px) 100vw, 300px"
                className="mt-4 rounded-md"
              />

              <Link
                href="/accesorios/generales"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ver más
              </Link>
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
