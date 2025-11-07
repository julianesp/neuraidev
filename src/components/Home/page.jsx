"use client";

import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import Link from "next/link.js";
import Head from "next/head";
import styles from "./Home.module.scss";
import Advertisement from "@/components/Advertisement";
import AccesoriosDestacados from "@/components/Accesorio/AccesoriosDestacados";
import ProductosRecientes from "@/components/Producto/ProductosRecientes";
import NightSkyHero from "@/components/NightSkyHero";
import BackToTop from "@/components/backTop/BackToTop";
import { CarouselDemo } from "@/components/CarouselDemo";
import Image from "next/image";
import FAQ from "@/components/FAQ";
// import ContactForm from "./ContactForm";
import SideModal from "@/components/SideModal/page";
import PresentationCarousel from "@/components/PresentationCarousel/PresentationCarousel";
import TechnicalServicesCarousel from "@/components/TechnicalServicesCarousel";
import WebDevSection from "@/components/WebDevelopment/WebDevSection";
import ContactWhatsApp from "@/components/ContactWhatsApp/ContactWhatsApp";
// import FacebookLogin from "./Auth/FacebookLogin";
// import "./ContactForm.css";
// import "./SideModal/SideModal.module.scss";

const API_PRESENTATION = "/presentation.json";
const API_ACCESORIOS = "/accesoriosDestacados.json";

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

  // Efecto para asegurar que la página inicie en la parte superior
  useEffect(() => {
    // Scroll al inicio cuando el componente se monta
    window.scrollTo(0, 0);

    // También prevenimos cualquier scroll automático
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

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

        // Si el elemento está visible en la pantalla (umbral más amplio para activación)
        if (position.top < window.innerHeight * 1.2 && position.bottom >= 0) {
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
    setTimeout(handleScrollAnimation, 100);

    // Ejecutamos nuevamente después de un delay para asegurar que todo esté cargado
    setTimeout(handleScrollAnimation, 500);

    // Agregamos el evento de scroll
    window.addEventListener("scroll", handleScrollAnimation);

    return () => {
      window.removeEventListener("scroll", handleScrollAnimation);
    };
  }, [isLoaded]);

  useEffect(() => {
    setIsLoaded(true);
    fetch("/accesoriosDestacados.json")
      .then((response) => response.json())
      .then((data) => {
        const products = data.accesorios || [];
        const normalizedData = products.map((product) => ({
          ...product,
          images: Array.isArray(product.images)
            ? product.images
            : [product.images],
        }));
        setData(normalizedData);
      });

    // Usar la URL directamente como imagen
    setPresentationImages([API_PRESENTATION]);
    setLoading(false);

    // Cargar Facebook SDK
    if (typeof window !== "undefined") {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "123456789", // Reemplaza con tu App ID
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });
      };

      // Cargar el SDK de Facebook
      (function (d, s, id) {
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        const js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/es_ES/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    }
  }, []);

  if (!isLoaded) return null;

  const ads = [
    {
      businessName: "Tienda Local",
      description:
        "Abarrotes y productos básicos para tu hogar. Servicio a domicilio disponible.",
      imageUrl:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
      businessId: "tienda-local",
    },
    {
      businessName: "Panadería El Trigal",
      description:
        "Pan fresco todos los días. Especialistas en productos artesanales.",
      imageUrl:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
      businessId: "panaderia-el-trigal",
    },
    {
      businessName: "Ferretería Martínez",
      description:
        "Todo para construcción y reparaciones. Más de 20 años de experiencia.",
      imageUrl:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
      businessId: "ferreteria-martinez",
    },
    {
      businessName: "¿Tienes un negocio?",
      description:
        "Solicita tu espacio publicitario aquí y llega a más clientes en tu zona.",
      imageUrl:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
      linkUrl:
        "https://wa.me/573174503604?text=Hola,%20me%20interesa%20solicitar%20un%20espacio%20publicitario%20para%20mi%20negocio%20en%20NeuraIdev",
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
        style={{ margin: 0, padding: 0, overflowX: 'hidden', maxWidth: '100vw' }}
      >
        {/* Modal para envio gratis */}
        {/* <SideModal /> */}
        {/* Sección Hero - contenedor con altura controlada */}
        <div className={`${styles.presentacion}`}>
          <PresentationCarousel />
        </div>

        {/* Accesorios destacados */}
        <section
          ref={destacadosRef}
          className={`${styles.destacados} ${styles.fadeInUp}`}
        >
          <Suspense fallback={<LoadingSkeleton />}>
            <AccesoriosDestacados />
            <ProductosRecientes />
          </Suspense>
        </section>

        {/* Sección lateral de anuncios o aside*/}
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
            // height: "100%",
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

        {/* Accesorios  */}
        <section
          ref={accesoriesRef}
          className={`${styles.accesories} ${styles.fadeInUp}`}
        >
          <section className={styles.varios}>
            <h1 id="accesories" className={`${styles.accesoriesTitle} `}>
              <Link
                href="/accesorios/"
                className="text-black border-solid border-black border-2 rounded-xl p-2  dark:text-white dark:bg-dark dark:border-white"
                title="Ver página de accesorios"
                target="_blankw"
              >
                Accesorios
              </Link>
            </h1>

            {/* Artículo con animación desde la izquierda */}
            <article
              ref={celularesRef}
              className={`${styles.tipo} ${styles.fadeInLeft} `}
              style={{
                backgroundImage: "url('/images/celulares-placeholder.png')",
              }}
            >
              <h2 className="text-white dark:text-white">Celulares</h2>

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
              style={{
                backgroundImage: "url('/images/computadores-placeholder.png')",
              }}
            >
              <h2 className="text-white dark:text-white">Computadores</h2>

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
              style={{
                backgroundImage: "url('/images/damas-placeholder.png')",
              }}
            >
              <h2 className="text-white dark:text-white">Damas</h2>

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
              style={{
                backgroundImage: "url('/images/libros-nuevos-placeholder.png')",
              }}
            >
              <h2 className="text-white dark:text-white">Libros nuevos</h2>

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
              style={{
                backgroundImage: "url('/images/libros-usados-placeholder.png')",
              }}
            >
              <h2 className="text-white dark:text-white">Libros usados</h2>

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
              style={{
                backgroundImage: "url('/images/generales-placeholder.png')",
              }}
            >
              <h2 className="text-white dark:text-white">Generales</h2>

              <Link
                href="/accesorios/generales"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ver más
              </Link>
            </article>
          </section>
        </section>

        {/* Formulario de contacto por WhatsApp */}
        <ContactWhatsApp />

        {/* Sección de Desarrollo Web */}
        <Suspense
          fallback={
            <div className="w-full h-64 bg-gray-100 animate-pulse"></div>
          }
        >
          <section className={`${styles.webDevSection}`}>
            <WebDevSection />
          </section>
        </Suspense>

        <section className={styles.faq}>
          <FAQ />
        </section>

        {/* Section Technical Services Carousel */}
        <section className={`${styles.technicalServices}`}>
          <Suspense
            fallback={
              <div className="w-full max-w-6xl mx-auto px-4">
                <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl h-64"></div>
              </div>
            }
          >
            <TechnicalServicesCarousel />
          </Suspense>
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
