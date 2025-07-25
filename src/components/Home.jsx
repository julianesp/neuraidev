"use client";
import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import Link from "next/link.js";
import Head from "next/head";
import styles from "../styles/pages/Home.module.scss";
import Advertisement from "../components/Advertisement";
import AccesoriosDestacados from "../components/Accesorio/AccesoriosDestacados";
import NightSkyHero from "../components/NightSkyHero";
import BackToTop from "../components/backTop/BackToTop";
import { CarouselDemo } from "./CarouselDemo";
import Image from "next/image";
import FAQ from "./FAQ";
// import ContactForm from "./ContactForm";
// import SideModal from "./SideModal";
import "./ContactForm.css";
import "./SideModal.css";

const API_PRESENTATION = "/presentation.json";
const API_ACCESORIOS = "/accesories.json";

function CarouselSkeleton() {
  return (
    <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-gray-400">Cargando...</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-yellow-50 p-6 rounded-lg border animate-pulse">
      <div className="h-6 bg-gray-300 rounded mb-4 w-48"></div>
      <div className="h-48 bg-gray-300 rounded mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-32"></div>
    </div>
  );
}

export default function Inicio() {
  const [imageError, setImageError] = useState({});
  const [imageId, setImageId] = useState({});
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

  const ads = [
    {
      businessName: "Productos",
      description: "Solicite este espacio para su negocio",
      imageUrl: "",
      linkUrl: "/productos/",
    },
    {
      businessName: "Accesorios",
      description: "Solicite este espacio para su negocio",
      imageUrl: "",
      linkUrl: "/accesorios/",
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
        {/* Modal para envio gratis */}
        {/* <SideModal /> */}

        {/* Sección Hero - contenedor con altura controlada */}
        <div className={`${styles.presentacion}`}>
          <NightSkyHero />
        </div>
        <div className={`${styles.carrusel}`}>
          <Suspense fallback={<CarouselSkeleton />}>
            <CarouselDemo
              apiUrl={API_ACCESORIOS}
              showArrows={true}
              enableTransitions={true}
              showIndicators={true}
            />
          </Suspense>
        </div>
        {/* Sección lateral de anuncios */}
        <section
          className={`${styles.aside} `}
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
          <Suspense
            fallback={
              <div className="w-72 h-96 bg-gray-100 animate-pulse rounded"></div>
            }
          >
            <Advertisement ads={ads} />
          </Suspense>
        </section>
        {/* Botones de Servicios y Accesorios */}
        <div
          className={`${styles.directos} w-full z-50 bg-black  shadow-md py-2 flex justify-center gap-5 md:static md:shadow-none md:bg-transparent md:py-4 md:mb-2 `}
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
            className="px-4 py-2  rounded-md border border-slate-300 hover:bg-slate-300 transition-all text-white  dark:bg-white dark:text-black"
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
            className="px-4 py-2  rounded-md border border-slate-300 hover:bg-slate-300 transition-all text-white dark:bg-white dark:text-black"
          >
            Accesorios
          </a>
        </div>
        {/* Sección de productos destacados con animación */}
        <section
          ref={destacadosRef}
          className={`${styles.destacados} ${styles.fadeInUp}`}
        >
          <Suspense fallback={<LoadingSkeleton />}>
            <AccesoriosDestacados />
            {/* <AccesoriosNuevos /> */}
          </Suspense>
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

              <div className={`${styles.imageContainer}`}>
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2FCelulares%2Fcable%20pzoz%20100w%20c%20-%20c%2FScreenshot_2025-05-13-21-31-33-554_com.alibaba.aliexpresshd-edit.jpg?alt=media&token=fa0d2a66-8a7e-4551-98f3-a7dd8105a0d5"
                  alt="Celulares"
                  width={300}
                  height={200}
                  className="mt-4 rounded-md"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [imageId]: true }))
                  }
                />
              </div>

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
              <div className={`${styles.imageContainer}`}>
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcarcasa%202.5%20black%2F1.jpg?alt=media&token=87377fab-a145-4ce1-a87a-cf9caffc1990"
                  alt="Computadores"
                  width={300}
                  height={200}
                  className="rounded-md object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [imageId]: true }))
                  }
                />
              </div>

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

              <div className={`${styles.imageContainer}`}>
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fdamas%2Frizador%2F470206118_122195128148083804_8173820928240704070_n.jpg?alt=media&token=dfb4c27d-7dc7-4ad6-9f94-a60f2c2afc72"
                  alt="Damas"
                  width={300}
                  height={200}
                  className="mt-4 rounded-md"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [imageId]: true }))
                  }
                />
              </div>

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

              <div className={`${styles.imageContainer}`}>
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbooks%2Fnew%2Fenamorate%20de%20ti%2F480534106_122204421584083804_6430148799072894958_n.jpg?alt=media&token=ba8c5d5b-6bf3-478c-aaf6-0f50bfe22be1"
                  alt="Libros Nuevos"
                  width={300}
                  height={200}
                  className="mt-4 rounded-md"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [imageId]: true }))
                  }
                />
              </div>

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

              <div className={`${styles.imageContainer}`}>
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbooks%2Fold%2Fcircuitos%20electricos%2F1.jpg?alt=media&token=5ca250e3-8461-4415-9f0d-1da8e6ae8f6a"
                  alt="Libros Usados"
                  width={300}
                  height={200}
                  className="mt-4 rounded-md"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [imageId]: true }))
                  }
                />
              </div>

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

              <div className={`${styles.imageContainer}`}>
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fgeneral%2Fcepillo%20pets%2F488471910_122211784658083804_5069962783250805604_n.jpg?alt=media&token=7a9310af-278b-42de-b45c-62a1b25a6ee3"
                  alt="Accesorios"
                  width={300}
                  height={200}
                  className="mt-4 rounded-md"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [imageId]: true }))
                  }
                />
              </div>

              <Link
                href="/accesorios/generales"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ver más
              </Link>
            </article>
          </section>
        </section>

        <section className={styles.faq}>
          <FAQ />
        </section>

        {/* Formulario para clientes */}
        {/* <section className={`py-5 ${styles.consulta}`}>
          <div className="container">
            <h2 className="text-center mb-4">¡Contáctanos!</h2>
            <ContactForm />
          </div>
        </section> */}

        <div className="mb-16 md:mb-0">
          <Suspense fallback={null}>
            <BackToTop />
          </Suspense>
        </div>
      </main>
    </>
  );
}
