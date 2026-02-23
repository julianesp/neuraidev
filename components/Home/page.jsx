"use client";

import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import Link from "next/link.js";
import Head from "next/head";
import styles from "./Home.module.scss";
import SidebarContent from "@/components/SidebarContent/SidebarContent";
import AccesoriosDestacados from "@/components/Accesorio/AccesoriosDestacados";
import ProductosRecientes from "@/components/Producto/ProductosRecientes";
import MostVisitedProducts from "@/components/MostVisitedProducts/MostVisitedProducts";
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
import ProductSearch from "@/components/ProductSearch/ProductSearch";
import ExternalNews from "@/components/ExternalNews/ExternalNews";
import NotificationsBanner from "@/components/NotificationsBanner";
import CategoryCard from "@/components/CategoryCard";
import {
  Smartphone,
  Monitor,
  Heart,
  BookOpen,
  Package,
  Star,
} from "lucide-react";
// import FacebookLogin from "./Auth/FacebookLogin";
// import "./ContactForm.css";
// import "./SideModal/SideModal.module.scss";

const API_PRESENTATION = "/presentation.json";
const API_ACCESORIOS = "/accesoriosDestacados.json";

// Categorías de accesorios para la página de inicio
const categorias = [
  {
    id: "celulares",
    nombre: "Celulares",
    descripcion: "Cables, cargadores, fundas y más para tu smartphone",
    ruta: "/accesorios/celulares",
    icono: <Smartphone className="w-8 h-8" />,
    color: "bg-blue-500",
  },
  {
    id: "computadoras",
    nombre: "Computadores",
    descripcion: "Teclados, mouse, cables y componentes para PC",
    ruta: "/accesorios/computadoras",
    icono: <Monitor className="w-8 h-8" />,
    color: "bg-green-500",
  },
  {
    id: "libros-nuevos",
    nombre: "Libros nuevos",
    descripcion: "Colección de libros nuevos de diferentes géneros",
    ruta: "/accesorios/libros-nuevos",
    icono: <BookOpen className="w-8 h-8" />,
    color: "bg-orange-500",
  },
  {
    id: "libros-usados",
    nombre: "Libros usados",
    descripcion: "Libros de segunda mano en excelente estado",
    ruta: "/accesorios/libros-usados",
    icono: <BookOpen className="w-8 h-8" />,
    color: "bg-amber-600",
  },
  {
    id: "generales",
    nombre: "Generales",
    descripcion: "Variedad de productos para diferentes necesidades",
    ruta: "/accesorios/generales",
    icono: <Package className="w-8 h-8" />,
    color: "bg-gray-500",
  },
];

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

    // Cargar productos destacados desde Supabase
    const cargarProductosDestacados = async () => {
      try {
        const { getFeaturedProducts } = await import("@/lib/productService");
        const productosDestacados = await getFeaturedProducts(10);

        const normalizedData = productosDestacados.map((product) => ({
          ...product,
          images: Array.isArray(product.imagenes)
            ? product.imagenes
            : product.imagenes
              ? [product.imagenes]
              : [],
        }));

        setData(normalizedData);
      } catch (error) {
        console.error("[Home] Error al cargar productos destacados:", error);
        setData([]);
      }
    };

    cargarProductosDestacados();

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

  return (
    <>
      <Head>
        <title>Inicio</title>
        <link rel="icon" href="/favicon.ico" />
        <meta content="Página de inicio" />
      </Head>
      <main
        className={`${styles.container} bg-white text-black dark:bg-gray-800 dark:text-white`}
        style={{
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          maxWidth: "100vw",
        }}
      >
        {/* Modal para envio gratis */}
        {/* <SideModal /> */}
        {/* Sección Hero - contenedor con altura controlada */}
        <div className={`${styles.presentacion}`}>
          <PresentationCarousel />
        </div>

        {/* Banner de notificaciones - solo en página de inicio */}
        <div className="mt-4">
          <NotificationsBanner />
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

        {/* Productos Más Visitados - Diseño Bento Grid */}
        <Suspense fallback={<LoadingSkeleton />}>
          <MostVisitedProducts />
        </Suspense>

        {/* Noticias Externas */}
        <Suspense fallback={<LoadingSkeleton />}>
          <ExternalNews />
        </Suspense>

        {/* Negocios Locales */}
        {/* <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Negocios Locales
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Descubre tiendas locales con todo lo que necesitas: mercado, aseo, mecato, tecnología y mucho más
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <Link href="/business/tienda-local" className="group block">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-24 h-24 text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ Popular
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      Tienda Local - Tu Súper Completo
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      Miles de productos: mercado, aseo, mecato, tecnología, ropa y más
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        🛒 Mercado
                      </span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        🧼 Aseo
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        🍬 Mecato
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        🕐 Lun-Dom: 6AM-10PM
                      </span>
                      <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform">
                        Ver tienda →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              
              <Link href="/business/panaderia-el-trigal" className="group block">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl">🥖</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      Panadería El Trigal
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      Pan fresco todos los días. Panadería artesanal y pastelería
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                        🥐 Panadería
                      </span>
                      <span className="text-xs bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-2 py-1 rounded">
                        🎂 Tortas
                      </span>
                      <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                        ☕ Desayunos
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        🕐 Todos los días: 5AM-7PM
                      </span>
                      <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform">
                        Ver tienda →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              
              <Link href="/business/ferreteria-martinez" className="group block">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-48 bg-gradient-to-br from-gray-600 to-gray-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-24 h-24 text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      Ferretería Martínez
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      Todo para construcción y reparaciones del hogar
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        🔨 Herramientas
                      </span>
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                        🎨 Pinturas
                      </span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        🚿 Plomería
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        🕐 Lun-Sáb: 7AM-6PM
                      </span>
                      <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform">
                        Ver tienda →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                ¿Tienes un negocio local?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Únete a nuestra plataforma y llega a miles de clientes. Configura tu tienda online con métodos de pago integrados.
              </p>
              <a
                href="https://wa.me/573174503604?text=Hola,%20quiero%20registrar%20mi%20negocio%20en%20NeuraIdev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Registrar mi negocio
              </a>
            </div>
          </div>
        </section> */}

        {/* Sección lateral - Buscador, Categorías, Publicidad y Enlaces */}
        <section
          className={`${styles.aside} `}
          style={{
            display: "block",
            gridArea: "aside",
            width: "100%",
            maxWidth: "320px",
            justifySelf: "end",
            position: "relative",
            marginLeft: "0",
          }}
        >
          <Suspense
            fallback={
              <div className="w-72 h-96 bg-gray-100 animate-pulse rounded"></div>
            }
          >
            <SidebarContent />
          </Suspense>
        </section>

        {/* Accesorios  */}
        <section
          ref={accesoriesRef}
          className={`${styles.accesories} ${styles.fadeInUp} mt-16`}
        >
          <div className="w-full max-w-7xl mx-auto px-4">
            <h1
              id="accesories"
              className="text-center mb-8"
              data-aos="fade-up"
            >
              <Link
                href="/accesorios/"
                className="text-black border-solid border-black border-2 rounded-xl p-2  dark:text-white dark:bg-dark dark:border-white"
                title="Ver página de accesorios"
                target="_blank"
              >
                Accesorios
              </Link>
            </h1>

            {/* Buscador de productos */}
            <div className="max-w-3xl mx-auto mb-8" data-aos="fade-up">
              <ProductSearch />
            </div>

            {/* Grid de categorías con carrusel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {categorias.map((categoria) => (
                <CategoryCard key={categoria.id} categoria={categoria} />
              ))}
            </div>
          </div>
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
