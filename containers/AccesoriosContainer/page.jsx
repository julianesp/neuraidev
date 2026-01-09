"use client";

// components/AccesoriosContainer.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingCart,
} from "lucide-react";
import styles from "./AccesoriosContainer.module.scss"; // Importamos estilos SCSS
import {
  generateProductSlug,
  buildProductUrl,
  getCategorySlug,
} from "@/utils/slugify";
import ShareButton from "@/components/ShareButton";
// import ProductMetaTags from "@/components/ProductMetaTags"; // REMOVIDO: Causa conflictos con generateMetadata
import PriceWithDiscount from "@/components/PriceWithDiscount";
import AddToCartButton from "@/components/AddToCartButton";
import ProductSchema from "@/components/ProductSchema";
import Breadcrumbs, { CATEGORY_NAMES } from "@/components/Breadcrumbs";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/contexts/ToastContext";
import FavoriteButton from "@/components/FavoriteButton";
import ProductLikes from "@/components/ProductSocial/ProductLikes";
import ProductComments from "@/components/ProductSocial/ProductComments";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/auth/roles";
import SafeHtmlRenderer from "@/components/SafeHtmlRenderer";

// Componente principal mejorado
const AccesoriosContainer = ({
  apiUrl,
  accesorio: accesorioProps,
  otrosAccesorios: otrosAccesoriosProps = [],
  telefono: telefonoProps = "+573174503604",
}) => {
  // Referencia para el scrolling
  const containerRef = useRef(null);

  // Router de Next.js para actualizar URL
  const router = useRouter();

  // Hooks para el carrito
  const { addToCart } = useCart();
  const toast = useToast();

  // Hook para obtener el usuario actual (para verificar si es admin)
  const { user } = useUser();
  const userIsAdmin = user ? isAdmin(user) : false;

  const [todosAccesorios, setTodosAccesorios] = useState(
    [accesorioProps, ...(otrosAccesoriosProps || [])].filter(Boolean),
  );
  const [accesorio, setAccesorio] = useState(accesorioProps || null);
  const [otrosAccesorios, setOtrosAccesorios] = useState(
    otrosAccesoriosProps || [],
  );
  const [telefono, setTelefono] = useState(telefonoProps);
  const [mainSlideIndex, setMainSlideIndex] = useState(0);
  const [relatedSlideIndex, setRelatedSlideIndex] = useState(0);
  const [loading, setLoading] = useState(!accesorioProps);
  const [dataLoaded, setDataLoaded] = useState(!!accesorioProps); // Bandera para evitar cargas múltiples
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState({}); // Controlar errores de carga de imágenes
  const [imageRetries, setImageRetries] = useState({}); // Controlar reintentos de carga
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Modal de imagen expandida
  const [currentUrl, setCurrentUrl] = useState(""); // URL actual para evitar problemas de hidratación

  // Funciones para el modal de imagen
  const openImageModal = () => setIsImageModalOpen(true);
  const closeImageModal = () => setIsImageModalOpen(false);

  // Establecer URL actual solo en el cliente para evitar problemas de hidratación
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Función para asignar emoji según el contenido
  const asignarEmoji = (texto) => {
    const textoLower = texto.toLowerCase();

    // Capacidad y almacenamiento
    if (
      textoLower.includes("gb") ||
      textoLower.includes("capacidad") ||
      textoLower.includes("almacenamiento")
    )
      return "💾";
    if (textoLower.includes("tb") || textoLower.includes("terabyte"))
      return "🗄️";

    // Velocidad y rendimiento
    if (
      textoLower.includes("velocidad") ||
      textoLower.includes("rápid") ||
      textoLower.includes("speed")
    )
      return "⚡";
    if (
      textoLower.includes("frecuencia") ||
      textoLower.includes("mhz") ||
      textoLower.includes("ghz")
    )
      return "⏱️";
    if (
      textoLower.includes("rendimiento") ||
      textoLower.includes("performance")
    )
      return "🚀";

    // Tecnología
    if (
      textoLower.includes("ddr4") ||
      textoLower.includes("ddr3") ||
      textoLower.includes("tecnología")
    )
      return "🔬";
    if (
      textoLower.includes("sata") ||
      textoLower.includes("usb") ||
      textoLower.includes("conexión")
    )
      return "🔌";
    if (
      textoLower.includes("bluetooth") ||
      textoLower.includes("inalámbrico") ||
      textoLower.includes("wifi")
    )
      return "📶";

    // Compatibilidad
    if (
      textoLower.includes("compatible") ||
      textoLower.includes("compatibilidad")
    )
      return "✅";
    if (
      textoLower.includes("plug") ||
      textoLower.includes("play") ||
      textoLower.includes("instalación")
    )
      return "🔧";

    // Formato y diseño
    if (
      textoLower.includes("formato") ||
      textoLower.includes("dimm") ||
      textoLower.includes("factor")
    )
      return "📐";
    if (
      textoLower.includes("diseño") ||
      textoLower.includes("compacto") ||
      textoLower.includes("ligero")
    )
      return "💎";
    if (
      textoLower.includes("portátil") ||
      textoLower.includes("laptop") ||
      textoLower.includes("notebook")
    )
      return "💻";

    // Energía
    if (
      textoLower.includes("consumo") ||
      textoLower.includes("energético") ||
      textoLower.includes("batería")
    )
      return "🔋";
    if (textoLower.includes("alimentación") || textoLower.includes("power"))
      return "⚡";

    // Protección y seguridad
    if (
      textoLower.includes("protección") ||
      textoLower.includes("segur") ||
      textoLower.includes("resistente")
    )
      return "🛡️";
    if (
      textoLower.includes("disipación") ||
      textoLower.includes("térmic") ||
      textoLower.includes("temperatura")
    )
      return "🌡️";

    // Audio y video
    if (
      textoLower.includes("audio") ||
      textoLower.includes("sonido") ||
      textoLower.includes("micrófono")
    )
      return "🎵";
    if (
      textoLower.includes("video") ||
      textoLower.includes("cámara") ||
      textoLower.includes("imagen")
    )
      return "📹";
    if (
      textoLower.includes("hd") ||
      textoLower.includes("resolución") ||
      textoLower.includes("calidad")
    )
      return "📺";

    // Conectividad
    if (
      textoLower.includes("puerto") ||
      textoLower.includes("entrada") ||
      textoLower.includes("salida")
    )
      return "🔌";
    if (textoLower.includes("cable") || textoLower.includes("cord"))
      return "🔗";

    // Sistema
    if (
      textoLower.includes("sistema") ||
      textoLower.includes("windows") ||
      textoLower.includes("mac") ||
      textoLower.includes("linux")
    )
      return "💻";

    // Por defecto
    return "🔹";
  };

  // Función para formatear la descripción
  const formatearDescripcion = (descripcion) => {
    if (!descripcion) return "Sin descripción disponible";

    // Limpiar caracteres problemáticos
    const textoLimpio = descripcion
      .replace(/[♦◊♢◇▪▫■□●○▲△▼▽◆◇]/g, "")
      .replace(/�/g, "") // Eliminar símbolo de reemplazo Unicode
      .replace(/\uFFFD/g, "") // Eliminar carácter de reemplazo Unicode (alternativo)
      .replace(/\s+/g, " ")
      .trim();

    // Dividir el texto en frases (por puntos o frases largas)
    let frases = textoLimpio
      .split(
        /[.!]\s+|(?<=[a-zA-Z])\s+(?=[\u{1F527}\u{26A1}\u{1F4CA}\u{1F9EE}\u{2728}\u{1F4C8}\u{1F3AF}\u{1F4DA}\u{1F4A1}\u{1F522}\u{1F31F}\u{1F5A5}\u{1F4BE}\u{1F4F1}\u{1F50C}\u{1F9F0}\u{1F6E1}\u{1F50B}\u{1F4E6}\u{1F4B0}\u{1F4BB}\u{1F4DD}\u{1F3A7}\u{1F3AE}\u{1F310}\u{1F4AA}\u{1F3C3}\u{1F510}\u{1F9F5}\u{1F4F9}\u{1F3A4}\u{1F50D}\u{1F4CE}\u{1F4A1}\u{1F507}\u{2668}\u{1F4C8}\u{1F9E9}\u{1F4F1}\u{1F504}\u{23F1}\u{1F4BB}\u{1F525}\u{1F310}])/u,
      )
      .filter((frase) => frase.trim().length > 10);

    // Si no hay muchas frases, dividir por longitud
    if (frases.length < 3) {
      const palabras = textoLimpio.split(" ");
      frases = [];
      let fraseActual = "";

      palabras.forEach((palabra) => {
        if (fraseActual.length + palabra.length < 80) {
          fraseActual += (fraseActual ? " " : "") + palabra;
        } else {
          if (fraseActual.trim()) frases.push(fraseActual.trim());
          fraseActual = palabra;
        }
      });
      if (fraseActual.trim()) frases.push(fraseActual.trim());
    }

    // Asignar emoji a cada frase y formatear
    return frases
      .map((frase) => {
        const fraseLimpia = frase
          .replace(
            /^[\u{1F527}\u{26A1}\u{1F4CA}\u{1F9EE}\u{2728}\u{1F4C8}\u{1F3AF}\u{1F4DA}\u{1F4A1}\u{1F522}\u{1F31F}\u{1F5A5}\u{1F4BE}\u{1F4F1}\u{1F50C}\u{1F9F0}\u{1F6E1}\u{1F50B}\u{1F4E6}\u{1F4B0}\u{1F4BB}\u{1F4DD}\u{1F3A7}\u{1F3AE}\u{1F310}\u{1F4AA}\u{1F3C3}\u{1F510}\u{1F9F5}\u{1F4F9}\u{1F3A4}\u{1F50D}\u{1F4CE}\u{1F4A1}\u{1F507}\u{2668}\u{1F4C8}\u{1F9E9}\u{1F4F1}\u{1F504}\u{23F1}\u{1F4BB}\u{1F525}\u{1F310}]\s*/u,
            "",
          )
          .trim();
        const emoji = asignarEmoji(fraseLimpia);
        return `${emoji} ${fraseLimpia}`;
      })
      .join("\n\n");
  };

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isImageModalOpen) {
        closeImageModal();
      }
    };

    if (isImageModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevenir scroll del body
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isImageModalOpen]);

  // Obtener el slug de categoría desde apiUrl
  const categorySlug = apiUrl ? getCategorySlug(apiUrl) : "generales";

  // Validar que accesorio exista antes de continuar
  if (!accesorio) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-center">
          <div className="text-gray-500 mb-2">⏳ Cargando producto...</div>
          <div className="text-xs text-gray-400">
            Si ves este mensaje después de unos segundos, verifica que los datos
            estén disponibles.
          </div>
        </div>
      </div>
    );
  }

  // Efecto para detectar si estamos en móvil
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  // En AccesoriosContainer, modifica la función cambiarAccesorio para ajustar el scroll
  const cambiarAccesorio = useCallback(
    (nuevoAccesorio) => {
      if (!nuevoAccesorio) {
        console.error(
          "Error: Intento de cambiar a un accesorio nulo o indefinido",
        );
        return;
      }

      // Resetear el índice del slide principal
      setMainSlideIndex(0);

      // Resetear los errores de imagen
      setImageError({});

      // 1. Guardar el accesorio actual
      const accesorioActual = accesorio;

      // 2. Establecer el nuevo accesorio principal
      setAccesorio(nuevoAccesorio);

      // 3. Actualizar otros accesorios...
      // [resto del código para actualizar accesorios]

      // 4. Actualizar la URL del navegador para reflejar el producto actual
      try {
        const productSlug = generateProductSlug(nuevoAccesorio);
        const nuevaUrl = buildProductUrl(
          nuevoAccesorio.categoria || categorySlug,
          productSlug,
          nuevoAccesorio,
        );
        // Usar router.push para actualizar URL sin recargar la página
        router.push(nuevaUrl, { scroll: false });
      } catch (error) {
        console.error("Error al actualizar URL del producto:", error);
      }

      // Hacer scroll con un pequeño offset para que el contenido sea visible
      if (containerRef.current) {
        // Calculamos la posición del elemento
        const rect = containerRef.current.getBoundingClientRect();
        // Usamos scrollTo con un offset en lugar de scrollIntoView
        window.scrollTo({
          top: window.scrollY + rect.top - 100, // Offset de 100px
          behavior: "smooth",
        });
      }
    },
    [accesorio, categorySlug, router],
  );

  // Cargar datos desde API
  useEffect(() => {
    // Caso 1: Tenemos datos como props, no necesitamos hacer fetch
    if (accesorioProps) {
      const todos = [accesorioProps, ...otrosAccesoriosProps];
      setTodosAccesorios(todos);
      setAccesorio(accesorioProps);
      setOtrosAccesorios(otrosAccesoriosProps);
      setLoading(false);
      setDataLoaded(true);
      return;
    }

    // Caso 2: No hay apiUrl, no podemos cargar nada
    if (!apiUrl) {
      setLoading(false);
      setDataLoaded(true);
      return;
    }

    // Caso 3: Tenemos apiUrl, vamos a cargar los datos
    if (dataLoaded) {
      return; // Ya cargamos los datos
    }

    const cargarDatos = async () => {
      try {
        const response = await fetch(apiUrl, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Error al cargar datos: ${response.status}`);
        }

        const data = await response.json();

        let accesoriosData = [];
        let accesorioInicial = null;
        let otrosAccesoriosData = [];
        let telefonoConfig = telefono;

        // Estructura 1: Array directo de accesorios
        if (Array.isArray(data)) {
          accesoriosData = [...data];
          if (data.length > 0) {
            accesorioInicial = data[0];
            otrosAccesoriosData = data.slice(1);
          }
        }
        // Estructura 2: Objeto con propiedad 'accesorios'
        else if (data.accesorios && Array.isArray(data.accesorios)) {
          accesoriosData = [...data.accesorios];
          if (data.accesorios.length > 0) {
            accesorioInicial = data.accesorios[0];
            otrosAccesoriosData = data.accesorios.slice(1);
          }

          // Configuración adicional
          if (data.configuracion && data.configuracion.telefono) {
            telefonoConfig = data.configuracion.telefono;
          }
        }
        // Estructura 3: API response con propiedad 'productos'
        else if (data.productos && Array.isArray(data.productos)) {
          accesoriosData = [...data.productos];
          if (data.productos.length > 0) {
            accesorioInicial = data.productos[0];
            otrosAccesoriosData = data.productos.slice(1);
          }
        }

        // Actualizar estados
        setTodosAccesorios(accesoriosData);
        setAccesorio(accesoriosData.length > 0 ? accesoriosData[0] : null);
        setOtrosAccesorios(accesoriosData.slice(1));
        setTelefono(telefonoConfig);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setAccesorio(null);
        setTodosAccesorios([]);
        setOtrosAccesorios([]);
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    };

    cargarDatos();
  }, [apiUrl, accesorioProps, otrosAccesoriosProps, telefono, dataLoaded]);

  // Función para avanzar en el carrusel principal
  const nextMainSlide = (e) => {
    e.preventDefault(); // Prevenir comportamiento predeterminado
    e.stopPropagation(); // Detener propagación del evento

    if (
      !accesorio?.imagenes ||
      !Array.isArray(accesorio.imagenes) ||
      accesorio.imagenes.length <= 1
    )
      return;

    setMainSlideIndex((prevIndex) =>
      prevIndex === accesorio.imagenes.length - 1 ? 0 : prevIndex + 1,
    );
  };

  // Función para retroceder en el carrusel principal
  const prevMainSlide = (e) => {
    e.preventDefault(); // Prevenir comportamiento predeterminado
    e.stopPropagation(); // Detener propagación del evento

    if (
      !accesorio?.imagenes ||
      !Array.isArray(accesorio.imagenes) ||
      accesorio.imagenes.length <= 1
    )
      return;

    setMainSlideIndex((prevIndex) =>
      prevIndex === 0 ? accesorio.imagenes.length - 1 : prevIndex - 1,
    );
  };

  // Función para avanzar en el carrusel de productos relacionados
  const nextRelatedSlide = (e) => {
    e.preventDefault(); // Prevenir comportamiento predeterminado

    if (!otrosAccesorios || otrosAccesorios.length <= (isMobile ? 2 : 3))
      return;

    const totalSlides = Math.ceil(otrosAccesorios.length / (isMobile ? 2 : 3));
    setRelatedSlideIndex((prevIndex) =>
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1,
    );
  };

  // Función para retroceder en el carrusel de productos relacionados
  const prevRelatedSlide = (e) => {
    e.preventDefault(); // Prevenir comportamiento predeterminado

    if (!otrosAccesorios || otrosAccesorios.length <= (isMobile ? 2 : 3))
      return;

    const totalSlides = Math.ceil(otrosAccesorios.length / (isMobile ? 2 : 3));
    setRelatedSlideIndex((prevIndex) =>
      prevIndex === 0 ? totalSlides - 1 : prevIndex + 1,
    );
  };

  // Manejar errores de carga de imágenes con sistema de reintento
  const handleImageError = (index, imageSrc) => {
    console.warn(`Error cargando imagen: ${imageSrc}`);

    // Comprobar si ya hemos reintentado esta imagen
    const currentRetries = imageRetries[index] || 0;

    if (currentRetries < 2) {
      // Reintentar cargando la imagen
      setImageRetries((prev) => ({
        ...prev,
        [index]: currentRetries + 1,
      }));

      // Forzar reintento agregando timestamp para evitar caché
      const timeStamp = new Date().getTime();
      const retrySrc =
        imageSrc && typeof imageSrc === "string" && imageSrc.includes("?")
          ? `${imageSrc}&retry=${timeStamp}`
          : `${imageSrc}?retry=${timeStamp}`;

      // Actualizar la URL temporal para forzar recarga (solo para lógica interna)
      setTimeout(() => {
        const img = new Image();
        img.src = retrySrc;
      }, 1000);
    } else {
      // Después de reintentos fallidos, marcar como error
      setImageError((prev) => ({
        ...prev,
        [index]: true,
      }));
    }
  };

  // Determinar si mostrar botones de navegación para productos relacionados
  const mostrarBotonesRelacionados =
    otrosAccesorios && otrosAccesorios.length > (isMobile ? 2 : 3);

  // Si está cargando, mostrar un spinner
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 mt-8 bg-white/30 backdrop-blur-md rounded-lg shadow-lg flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay accesorio, mostrar un mensaje
  if (!accesorio) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
        <div className="text-center py-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            No se encontraron productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No hay productos disponibles en esta categoría en este momento.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            API URL: {apiUrl}
          </p>
        </div>
      </div>
    );
  }

  // Formatear correctamente el mensaje para WhatsApp
  const mensajeBase = `Hola, estoy interesado en el accesorio: ${accesorio?.nombre || ""}`;
  const whatsappUrl = currentUrl
    ? `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeBase)}%0A%0A${encodeURIComponent("Puedes verlo aquí: ")}${encodeURIComponent(currentUrl)}`
    : "#";

  // Determinar si hay imágenes para mostrar
  const tieneImagenes =
    accesorio?.imagenes &&
    Array.isArray(accesorio.imagenes) &&
    accesorio.imagenes.length > 0;

  // Obtener la imagen principal - PRIORIZA imagenPrincipal como fuente principal
  let imagenPrincipal = accesorio?.imagenPrincipal || null;

  // Solo si no hay imagenPrincipal, intentar usar la primera de imagenes
  if (!imagenPrincipal && tieneImagenes) {
    imagenPrincipal =
      typeof accesorio.imagenes[0] === "object" && accesorio.imagenes[0].url
        ? accesorio.imagenes[0].url
        : accesorio.imagenes[0];
  }

  return (
    <>
      {/* Meta tags ahora se manejan en generateMetadata() de las páginas */}
      {/* Schema.org para SEO */}
      <ProductSchema producto={accesorio} />
      {/* max-w-4xl */}
      <div ref={containerRef} id="accesorios-container" className="w-full">
        <div className="lg:max-w-md mx-auto px-2 py-4 md:p-4">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { name: "Accesorios", url: "/accesorios" },
              {
                name: CATEGORY_NAMES[categorySlug] || categorySlug,
                url: `/accesorios/${categorySlug}`,
              },
              {
                name: accesorio?.nombre || "Producto",
                url: accesorio ? buildProductUrl(accesorio, categorySlug) : "#",
              },
            ]}
          />
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-center flex-1">
              {accesorio.nombre}
            </h1>
            <div className="flex items-center gap-2">
              {userIsAdmin && (
                <Link
                  href={`/dashboard/productos/editar/${accesorio.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium shadow-md"
                  title="Editar producto"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar
                </Link>
              )}
              <FavoriteButton producto={accesorio} size="large" />
            </div>
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-32 ${styles.accesorioContainer}`}
          >
            {/* Carrusel principal - SECCIÓN MEJORADA */}
            <div
              className={`${styles.mainImageContainer} relative h-96 md:h-[450px] lg:h-[500px] group`}
            >
              {/* Botón de expansión - visible solo cuando el modal NO está abierto */}
              {!isImageModalOpen && (
                <button
                  onClick={openImageModal}
                  className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 text-gray-900 dark:text-white p-2.5 md:p-3 rounded-full transition-all duration-200 shadow-xl border-2 border-gray-300 dark:border-gray-600 hover:scale-110 "
                  aria-label="Ver imagen en pantalla completa"
                >
                  <svg
                    className="w-10 h-10 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
              )}

              <div className="h-full w-full relative overflow-hidden rounded-lg">
                {tieneImagenes ? (
                  accesorio.imagenes.map((imagen, index) => {
                    const imagenUrl =
                      typeof imagen === "object" && imagen.url
                        ? imagen.url
                        : imagen;

                    return (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                          index === mainSlideIndex ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <div className="relative w-full h-full z-1">
                          {!imageError[`main-${index}`] ? (
                            <Image
                              src={imagenUrl}
                              alt={`${accesorio.nombre} - Imagen ${index + 1}`}
                              fill={true}
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="rounded-lg object-cover"
                              priority={index === mainSlideIndex}
                              onError={() =>
                                handleImageError(`main-${index}`, imagenUrl)
                              }
                              unoptimized={
                                imagenUrl &&
                                typeof imagenUrl === "string" &&
                                imagenUrl.includes(
                                  "firebasestorage.googleapis.com",
                                )
                              }
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-slate-100/40 backdrop-blur-sm rounded-lg">
                              <Image
                                src="/images/placeholder-product.png"
                                alt="Imagen no disponible"
                                width={200}
                                height={200}
                                className="mb-2 opacity-60"
                              />
                              <p className="text-gray-500">
                                Imagen no disponible
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : imagenPrincipal ? (
                  <div className="absolute inset-0">
                    <div className="relative w-full h-full">
                      {!imageError["principal"] ? (
                        <Image
                          src={imagenPrincipal}
                          alt={accesorio.nombre}
                          fill={true}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="rounded-lg object-cover"
                          priority
                          onError={() => handleImageError("principal")}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-white/20 backdrop-blur-sm rounded-lg">
                          <p className="text-gray-500 dark:text-gray-300">
                            Imagen no disponible
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-white/20 backdrop-blur-sm rounded-lg">
                    <p className="text-gray-500 dark:text-gray-300">
                      No hay imágenes disponibles
                    </p>
                  </div>
                )}

                {/* Controles del carrusel principal - solo si hay múltiples imágenes Y el modal NO está abierto */}
                {tieneImagenes &&
                  accesorio.imagenes.length > 1 &&
                  !isImageModalOpen && (
                    <>
                      <button
                        onClick={prevMainSlide}
                        className={`${styles.navButton} bg-black text-white  absolute left-2 top-1/2 transform -translate-y-1/2 border-solid border-white p-2 rounded-full shadow-md  transition-all     dark:border-solid `}
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextMainSlide}
                        className={`${styles.navButton} bg-black text-white dark:bg-white dark:text-black absolute right-2 top-1/2 transform -translate-y-1/2 border-solid border-white p-2 rounded-full shadow-md hover:bg-opacity-75 transition-all`}
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight size={24} />
                      </button>

                      {/* Indicadores de posición */}
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center mx-auto space-x-2 bg-orange-300 h-5 p-1 w-56 rounded-xl border-stone-950">
                        {accesorio.imagenes.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.preventDefault();
                              setMainSlideIndex(index);
                            }}
                            className={`w-3 h-3 rounded-full ${
                              index === mainSlideIndex
                                ? "bg-primary"
                                : "bg-gray-300"
                            }`}
                            aria-label={`Ir a imagen ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
              </div>
            </div>

            {/* Columna 2: Descripción y Características */}
            <div>
              <h2 className="text-sm font-semibold mb-3 text-black dark:text-white">
                Descripción
              </h2>
              <div className="text-black dark:text-white mb-2 leading-relaxed">
                {/* Verificar si la descripción contiene HTML */}
                {accesorio.descripcion &&
                (accesorio.descripcion.includes("<p>") ||
                  accesorio.descripcion.includes("<strong>") ||
                  accesorio.descripcion.includes("<em>") ||
                  accesorio.descripcion.includes("<ul>") ||
                  accesorio.descripcion.includes("<ol>")) ? (
                  <SafeHtmlRenderer
                    html={accesorio.descripcion}
                    className="text-sm md:text-base"
                  />
                ) : (
                  formatearDescripcion(accesorio.descripcion)
                    .split("\n\n")
                    .map((parrafo, index) => (
                      <p key={index} className=" text-sm md:text-base">
                        {parrafo}
                      </p>
                    ))
                )}
              </div>

              {/* Características */}
              {accesorio.caracteristicas &&
                accesorio.caracteristicas.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2 text-black dark:text-black">
                      Características
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {accesorio.caracteristicas.map(
                        (caracteristica, index) => (
                          <li
                            key={index}
                            className="text-gray-800 dark:text-gray-200"
                          >
                            {caracteristica}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

              {/* Garantía */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-base font-semibold mb-1 text-blue-900 dark:text-blue-200">
                      Garantía de 1 mes
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Todos nuestros productos cuentan con garantía de 1 mes
                      contra defectos de fabricación.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 3: Stock, Precio y Botones de Acción */}
            <div className="flex flex-col">
              <div>
                {/* Información adicional del producto */}
                <div className="mt-4 space-y-3">
                  {/* Stock y disponibilidad */}
                  <div className="flex flex-wrap gap-4">
                    {/* Información de stock/cantidad */}
                    <div className="flex items-center">
                      <span
                        className={`text-sm px-3 py-1 rounded-full font-medium ${
                          accesorio.stock > 0
                            ? accesorio.stock > 10
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : ""
                        }`}
                        style={
                          accesorio.stock === 0
                            ? {
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                color: "rgba(185, 28, 28, 0.8)",
                              }
                            : {}
                        }
                      >
                        {accesorio.stock > 0
                          ? `Cantidad: ${accesorio.stock}`
                          : "Agotado"}
                      </span>
                    </div>

                    {/* Cantidad legacy - mantener por compatibilidad */}
                    {accesorio.cantidad !== undefined &&
                      accesorio.stock === undefined && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                            Cantidad:
                          </span>
                          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            {accesorio.cantidad}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Peso y dimensiones */}
                  {(accesorio.peso || accesorio.dimensiones) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {accesorio.peso && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Peso
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {accesorio.peso}
                          </p>
                        </div>
                      )}
                      {accesorio.dimensiones && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dimensiones
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {accesorio.dimensiones}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Precio */}
                <div className="mt-4">
                  <PriceWithDiscount
                    precio={accesorio.precio}
                    showBadge={true}
                    className="text-2xl font-bold text-primary dark:text-white"
                  />
                  {accesorio.precioAnterior && (
                    <span className="ml-2 text-gray-400 dark:text-gray-500 line-through">
                      $
                      {typeof accesorio.precioAnterior === "number"
                        ? accesorio.precioAnterior.toLocaleString("es-CO")
                        : accesorio.precioAnterior}
                    </span>
                  )}
                </div>
                {/* Botón para compartir el producto */}
                <div className="mt-4 ">
                  <ShareButton product={accesorio} />
                </div>
              </div>

              {/* Botón de WhatsApp */}
              {accesorio.stock === 0 ? (
                <div className="mt-6 space-y-3">
                  {/* Botón de Producto Agotado */}
                  <div className="bg-gray-400 text-gray-600 py-3 px-6 rounded-lg flex items-center justify-center cursor-not-allowed">
                    <MessageCircle className="mr-2" />
                    Producto Agotado
                  </div>

                  {/* Botón Solicitarlo */}
                  <Link
                    href={
                      currentUrl
                        ? `https://wa.me/573174503604?text=${encodeURIComponent(
                            `¡Hola! 👋\n\nQuiero más de este producto:\n\n📦 ${accesorio.nombre}\n\n🔗 Puedes verlo aquí: ${currentUrl}\n\n¡Espero tu respuesta! 😊`,
                          )}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-500 text-white py-3 px-6 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors font-medium"
                  >
                    <svg
                      className="mr-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-3.618-.82L3 21l1.82-6.382A8.13 8.13 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                      />
                    </svg>
                    Solicitarlo por WhatsApp
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 mt-6">
                  {/* Componente de agregar al carrito */}
                  <AddToCartButton producto={accesorio} />

                  {/* Enlace de pago específico para el libro de Cálculo */}
                  {accesorio?.id === "cmfew2nv3000rs0jpmwvzv6ue" && (
                    <Link
                      href="https://payco.link/a2bf14cd-759a-4717-a500-baf869523a61"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center justify-center font-semibold transition-colors"
                    >
                      <svg
                        className="mr-2 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Comprar Ahora - Pago Seguro
                    </Link>
                  )}

                  {/* <Link
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.boton} bg-green-500 text-black dark:text-white py-3 px-6 rounded-lg flex items-center justify-center transition-colors dark:bg-gray-800`}
                  >
                    <MessageCircle className="mr-2 text-black dark:text-white" />
                    Consultar por WhatsApp
                  </Link> */}
                </div>
              )}
            </div>
          </div>

          {otrosAccesorios && otrosAccesorios.length > 0 && (
            <div className="mt-8 md:mt-12">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
                Otros accesorios
              </h2>

              <div className="relative">
                {/* IMPORTANTE: Solo usar la clase SCSS, NO mezclar con Tailwind grid */}
                <div className={`${styles.otrosAccesoriosGrid}  `}>
                  {otrosAccesorios.map((item, itemIndex) => {
                    // Obtener URL de imagen de manera segura
                    const itemImageUrl =
                      item.imagenPrincipal ||
                      (item.imagenes && item.imagenes.length > 0
                        ? typeof item.imagenes[0] === "object" &&
                          item.imagenes[0].url
                          ? item.imagenes[0].url
                          : item.imagenes[0]
                        : null);

                    const isOutOfStock =
                      item.stock === 0 || item.cantidad === 0;

                    return (
                      <Link
                        key={itemIndex}
                        href={buildProductUrl(
                          item.categoria || categorySlug,
                          generateProductSlug(item),
                          item,
                        )}
                        className={`${styles.relatedItemCard} ${styles.otrosAccesoriosItem} relative rounded-lg overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-xl block ${
                          isOutOfStock ? "opacity-70" : ""
                        }`}
                        style={{ height: "300px" }}
                      >
                        {/* Imagen de fondo */}
                        <div className="absolute inset-0 w-full h-full">
                          {!imageError[`related-${itemIndex}`] &&
                          itemImageUrl ? (
                            <Image
                              src={itemImageUrl}
                              alt={item.nombre || ""}
                              fill={true}
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={() =>
                                handleImageError(`related-${itemIndex}`)
                              }
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              priority={false}
                              loading="lazy"
                              quality={85}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-200">
                              <p className="text-gray-500">Sin imagen</p>
                            </div>
                          )}

                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        </div>

                        {/* Botón flotante para agregar al carrito */}
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isOutOfStock) {
                              toast.warning(
                                `"${item.nombre}" no está disponible`,
                                {
                                  title: "⚠️ Producto Agotado",
                                  duration: 3000,
                                },
                              );
                              return;
                            }
                            const success = await addToCart(item, 1);
                            if (success) {
                              toast.success(
                                `"${item.nombre}" agregado al carrito`,
                                {
                                  title: "✅ Producto Agregado",
                                  duration: 3000,
                                },
                              );
                            }
                          }}
                          className={`absolute top-2 right-2 md:top-4 md:right-4 z-50 p-2.5 md:p-3 rounded-full shadow-lg transition-all backdrop-blur-sm border-2 border-white/30 ${
                            isOutOfStock
                              ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-90"
                              : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-110"
                          }`}
                          disabled={isOutOfStock}
                          aria-label={`Agregar ${item.nombre} al carrito`}
                          title={
                            isOutOfStock
                              ? "Producto agotado"
                              : "Agregar al carrito"
                          }
                        >
                          <ShoppingCart size={20} />
                        </button>

                        {/* Badge de stock o agotado */}
                        {isOutOfStock && (
                          <div className="absolute top-3 left-3 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            AGOTADO
                          </div>
                        )}

                        {/* Información del producto en la parte inferior */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                          <h3 className="font-bold text-base text-white mb-2 line-clamp-2 drop-shadow-lg">
                            {item.nombre || ""}
                          </h3>
                          <PriceWithDiscount
                            precio={item.precio}
                            showBadge={false}
                            className="text-white text-xl font-bold drop-shadow-lg"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sección de Likes y Comentarios */}
          <div className="mt-12 space-y-8">
            {/* Botón de likes */}
            <div className="flex justify-center sm:justify-start">
              <ProductLikes productoId={accesorio.id} />
            </div>

            {/* Sección de comentarios */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <ProductComments productoId={accesorio.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imagen expandida - FUERA del contenedor principal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 dark:bg-black/98 backdrop-blur-md overflow-hidden"
          onClick={closeImageModal}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Botón cerrar - Esquina superior derecha - MEJORADO */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeImageModal();
              }}
              className={`fixed   md:top-6 md:right-6 bg-red-600 hover:bg-red-700 text-white p-3 md:p-4 rounded-full transition-all duration-200 shadow-2xl border-2 border-white hover:scale-110 cursor-pointer z-[100000] ${styles.buttonCloseModal}`}
              aria-label="Cerrar imagen expandida"
              type="button"
            >
              <svg
                className="w-6 h-6 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Indicador para cerrar - visible en móviles */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm md:hidden backdrop-blur-sm border border-white/30 z-[100000]">
              Toca para cerrar
            </div>

            {/* Contenedor de la imagen - centrado en el viewport */}
            <div
              className="relative flex items-center justify-center w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {tieneImagenes ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {accesorio.imagenes.map((imagen, index) => {
                    const imagenUrl =
                      typeof imagen === "object" && imagen.url
                        ? imagen.url
                        : imagen;

                    return (
                      <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-500 ${
                          index === mainSlideIndex
                            ? "opacity-100 z-10"
                            : "opacity-0 z-0"
                        }`}
                      >
                        {!imageError[`modal-${index}`] ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                              src={imagenUrl}
                              alt={`${accesorio.nombre} - Imagen ${index + 1}`}
                              width={2000}
                              height={1500}
                              className="object-contain rounded-xl shadow-2xl"
                              onError={() =>
                                handleImageError(`modal-${index}`, imagenUrl)
                              }
                              style={{
                                maxWidth: "95vw",
                                maxHeight: "85vh",
                                width: "auto",
                                height: "auto",
                                minHeight: "300px",
                              }}
                              unoptimized={
                                imagenUrl &&
                                typeof imagenUrl === "string" &&
                                imagenUrl.includes(
                                  "firebasestorage.googleapis.com",
                                )
                              }
                              priority
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-8">
                            <p className="text-gray-300">
                              Imagen no disponible
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Controles del carrusel en modal */}
                  {accesorio.imagenes.length > 1 && (
                    <>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMainSlideIndex((prevIndex) =>
                            prevIndex === 0
                              ? accesorio.imagenes.length - 1
                              : prevIndex - 1,
                          );
                        }}
                        className="fixed left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 md:p-4 rounded-full transition-all duration-200 shadow-2xl border-2 border-white/30 cursor-pointer hover:scale-110 dark:bg-gray-700"
                        aria-label="Imagen anterior"
                        type="button"
                        style={{ zIndex: 9999999, pointerEvents: "auto" }}
                      >
                        <ChevronLeft
                          className="w-8 h-8 md:w-12 md:h-12"
                          strokeWidth={2.5}
                        />
                      </button>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMainSlideIndex((prevIndex) =>
                            prevIndex === accesorio.imagenes.length - 1
                              ? 0
                              : prevIndex + 1,
                          );
                        }}
                        className="fixed right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 md:p-4 rounded-full transition-all duration-200 shadow-2xl border-2 border-white/30 cursor-pointer hover:scale-110 dark:bg-gray-700"
                        aria-label="Imagen siguiente"
                        type="button"
                        style={{ zIndex: 9999999, pointerEvents: "auto" }}
                      >
                        <ChevronRight
                          className="w-8 h-8 md:w-12 md:h-12"
                          strokeWidth={2.5}
                        />
                      </button>

                      {/* Indicadores en modal */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                        {accesorio.imagenes.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMainSlideIndex(index);
                            }}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === mainSlideIndex
                                ? "bg-white"
                                : "bg-white/50"
                            }`}
                            aria-label={`Ir a imagen ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : imagenPrincipal ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {!imageError["modal-principal"] ? (
                    <Image
                      src={imagenPrincipal}
                      alt={accesorio.nombre}
                      width={2000}
                      height={1500}
                      className="object-contain rounded-xl shadow-2xl"
                      onError={() => handleImageError("modal-principal")}
                      style={{
                        maxWidth: "95vw",
                        maxHeight: "85vh",
                        width: "auto",
                        height: "auto",
                        minHeight: "300px",
                      }}
                      priority
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-8">
                      <p className="text-gray-300">Imagen no disponible</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gray-800 rounded-lg p-8">
                  <p className="text-gray-300">No hay imágenes disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccesoriosContainer;

// {
//   mostrarBotonesRelacionados && (
//     <>
//       <button
//         onClick={prevRelatedSlide}
//         className={`${styles.navButton} absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all z-10`}
//         aria-label="Ver productos anteriores"
//       >
//         <ChevronLeft size={20} />
//       </button>
//       <button
//         onClick={nextRelatedSlide}
//         className={`${styles.navButton} absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all z-10`}
//         aria-label="Ver productos siguientes"
//       >
//         <ChevronRight size={20} />
//       </button>
//     </>
//   );
// }
