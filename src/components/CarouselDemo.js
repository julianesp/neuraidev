// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import Image from "next/image";
// import styles from "../styles/components/Carousel.module.scss";

// export function CarouselDemo({
//   images = [],
//   apiUrl,
//   showIndicators = true,
//   showArrows = true,
//   enableTransitions = false, // Nueva prop para controlar las transiciones
// }) {
//   const [imageData, setImageData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   const autoplayTimerRef = useRef(null);
//   const touchStartRef = useRef(null);
//   const touchEndRef = useRef(null);

//   // Cargar imágenes desde API
//   useEffect(() => {
//     if (apiUrl) {
//       setLoading(true);
//       setError(null);

//       fetch(apiUrl)
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`Error HTTP: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           let extractedImages = [];

//           if (Array.isArray(data)) {
//             extractedImages = data.flatMap((item) => {
//               if (Array.isArray(item.images)) {
//                 return item.images;
//               } else if (typeof item.images === "string") {
//                 return [item.images];
//               } else {
//                 return Object.values(item).filter(
//                   (value) =>
//                     typeof value === "string" &&
//                     (value.includes("http") || value.includes("/")),
//                 );
//               }
//             });
//           } else if (typeof data === "object" && data !== null) {
//             extractedImages = Object.values(data).filter(
//               (value) =>
//                 typeof value === "string" &&
//                 (value.includes("http") || value.includes("/")),
//             );
//           }

//           setImageData(extractedImages);
//         })
//         .catch((error) => {
//           console.error("Error cargando imágenes:", error);
//           setError(error.message);
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [apiUrl]);

//   // Obtener las imágenes a mostrar
//   const displayImages = images.length > 0 ? images : imageData;

//   // Función para cambiar slide con transición
//   const changeSlide = useCallback(
//     (newIndexOrFunction) => {
//       if (enableTransitions) {
//         setIsTransitioning(true);

//         // Aplicar fade out
//         setTimeout(() => {
//           if (typeof newIndexOrFunction === "function") {
//             setCurrentIndex(newIndexOrFunction);
//           } else {
//             setCurrentIndex(newIndexOrFunction);
//           }

//           // Después de cambiar la imagen, aplicar fade in
//           setTimeout(() => {
//             setIsTransitioning(false);
//           }, 750); // 750ms para fade in
//         }, 750); // 750ms para fade out (total 1.5 segundos)
//       } else {
//         if (typeof newIndexOrFunction === "function") {
//           setCurrentIndex(newIndexOrFunction);
//         } else {
//           setCurrentIndex(newIndexOrFunction);
//         }
//       }
//     },
//     [enableTransitions],
//   );

//   // Función para iniciar el autoplay usando useRef para evitar problemas de dependencias
//   const startAutoplayRef = useRef(() => {});

//   // Definimos la función real de autoplay
//   useEffect(() => {
//     startAutoplayRef.current = () => {
//       if (autoplayTimerRef.current) {
//         clearTimeout(autoplayTimerRef.current);
//       }

//       if (!displayImages || displayImages.length <= 1) return;

//       autoplayTimerRef.current = setTimeout(() => {
//         if (!isPaused && !isTransitioning && !isHovered) {
//           changeSlide((prevIndex) => (prevIndex + 1) % displayImages.length);
//         }
//         startAutoplayRef.current();
//       }, 5000);
//     };
//   }, [displayImages, isPaused, isTransitioning, isHovered, changeSlide]);

//   // Iniciar autoplay al montar el componente
//   useEffect(() => {
//     startAutoplayRef.current();

//     return () => {
//       if (autoplayTimerRef.current) {
//         clearTimeout(autoplayTimerRef.current);
//       }
//     };
//   }, []);

//   // Funciones para manejar el hover
//   const handleMouseEnter = () => {
//     setIsHovered(true);
//   };

//   const handleMouseLeave = () => {
//     setIsHovered(false);
//   };

//   // Funciones para manejar touch (mobile)
//   const handleTouchStart = (e) => {
//     touchStartRef.current = e.touches[0].clientX;
//     touchEndRef.current = null;
//   };

//   const handleTouchMove = (e) => {
//     touchEndRef.current = e.touches[0].clientX;
//   };

//   const handleTouchEnd = () => {
//     if (!touchStartRef.current || !touchEndRef.current) return;

//     const distance = touchStartRef.current - touchEndRef.current;
//     const minSwipeDistance = 50; // Distancia mínima para considerar un swipe

//     if (Math.abs(distance) > minSwipeDistance) {
//       if (distance > 0) {
//         // Swipe left - siguiente imagen
//         goToNext();
//       } else {
//         // Swipe right - imagen anterior
//         goToPrevious();
//       }
//     }

//     touchStartRef.current = null;
//     touchEndRef.current = null;
//   };
//   // const changeSlide = (newIndexOrFunction) => {
//   //   if (enableTransitions) {
//   //     setIsTransitioning(true);

//   //     // Aplicar fade out
//   //     setTimeout(() => {
//   //       if (typeof newIndexOrFunction === "function") {
//   //         setCurrentIndex(newIndexOrFunction);
//   //       } else {
//   //         setCurrentIndex(newIndexOrFunction);
//   //       }

//   //       // Después de cambiar la imagen, aplicar fade in
//   //       setTimeout(() => {
//   //         setIsTransitioning(false);
//   //       }, 750); // 750ms para fade in
//   //     }, 750); // 750ms para fade out (total 1.5 segundos)
//   //   } else {
//   //     if (typeof newIndexOrFunction === "function") {
//   //       setCurrentIndex(newIndexOrFunction);
//   //     } else {
//   //       setCurrentIndex(newIndexOrFunction);
//   //     }
//   //   }
//   // };

//   // Función para pausar temporalmente el autoplay
//   const pauseAutoplay = () => {
//     if (autoplayTimerRef.current) {
//       clearTimeout(autoplayTimerRef.current);
//     }

//     setIsPaused(true);

//     setTimeout(() => {
//       setIsPaused(false);
//       startAutoplayRef.current();
//     }, 1000);
//   };

//   // Navegación manual
//   const goToPrevious = () => {
//     if (isTransitioning) return; // Prevenir múltiples transiciones

//     const newIndex =
//       currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
//     changeSlide(newIndex);
//     pauseAutoplay();
//   };

//   const goToNext = () => {
//     if (isTransitioning) return; // Prevenir múltiples transiciones

//     const newIndex = (currentIndex + 1) % displayImages.length;
//     changeSlide(newIndex);
//     pauseAutoplay();
//   };

//   const goToSlide = (index) => {
//     if (isTransitioning || index === currentIndex) return; // Prevenir transiciones innecesarias

//     changeSlide(index);
//     pauseAutoplay();
//   };

//   if (loading) {
//     return <div>Cargando imágenes...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!displayImages || displayImages.length === 0) {
//     return (
//       <div>No hay imágenes disponibles. Verifique la estructura del JSON.</div>
//     );
//   }

//   return (
//     <div className={styles.carouselContainer}>
//       <div
//         className={styles.carousel}
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//       >
//         <div className={styles.carouselContent}>
//           <div
//             className={`${styles.carouselItem} ${enableTransitions ? styles.transitionEnabled : ""}`}
//             key={currentIndex}
//             style={{
//               opacity: enableTransitions ? (isTransitioning ? 0 : 1) : 1,
//               transition: enableTransitions
//                 ? "opacity 1.5s ease-in-out"
//                 : "none",
//             }}
//           >
//             <div className="p-1 h-full">
//               <div className={styles.card}>
//                 <div className={`${styles.cardContent} p-0`}>
//                   <Image
//                     src={displayImages[currentIndex]}
//                     alt={`Imagen ${currentIndex + 1}`}
//                     className="rounded-lg"
//                     width={800}
//                     height={600}
//                     priority={true}
//                     sizes="(max-width: 768px) 100vw, 80vw"
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Botones de navegación */}
//         {showArrows && displayImages.length > 1 && (
//           <>
//             <button
//               onClick={goToPrevious}
//               className={`carousel-prev ${styles.boton}`}
//               aria-label="Anterior"
//               disabled={isTransitioning}
//               style={{
//                 opacity: isTransitioning ? 0.5 : 1,
//                 cursor: isTransitioning ? "not-allowed" : "pointer",
//               }}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className={`h-4 w-4 ${styles.icon}`}
//               >
//                 <polyline points="15 18 9 12 15 6"></polyline>
//               </svg>
//             </button>

//             <button
//               onClick={goToNext}
//               className="carousel-next"
//               aria-label="Siguiente"
//               disabled={isTransitioning}
//               style={{
//                 opacity: isTransitioning ? 0.5 : 1,
//                 cursor: isTransitioning ? "not-allowed" : "pointer",
//               }}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="h-4 w-4"
//               >
//                 <polyline points="9 18 15 12 9 6"></polyline>
//               </svg>
//             </button>
//           </>
//         )}
//       </div>

//       {/* Indicadores */}
//       {showIndicators && displayImages.length > 1 && (
//         <div className={styles.indicators}>
//           {displayImages.map((_, index) => (
//             <button
//               key={index}
//               className={`${styles.indicator} ${
//                 index === currentIndex ? styles.active : ""
//               }`}
//               onClick={() => goToSlide(index)}
//               aria-label={`Ir a imagen ${index + 1}`}
//               disabled={isTransitioning}
//               style={{
//                 opacity: isTransitioning ? 0.7 : 1,
//                 cursor: isTransitioning ? "not-allowed" : "pointer",
//               }}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default CarouselDemo;

// src/components/CarouselDemo.js - VERSIÓN OPTIMIZADA
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import styles from "../styles/components/Carousel.module.scss";

export function CarouselDemo({
  images = [],
  apiUrl,
  showIndicators = true,
  showArrows = true,
  enableTransitions = false,
}) {
  const [imageData, setImageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Optimización: Solo cargar en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoizar imágenes para evitar re-renders
  const displayImages = useMemo(() => {
    return images.length > 0 ? images : imageData;
  }, [images, imageData]);

  // Optimización: Cargar datos solo cuando sea necesario
  useEffect(() => {
    if (!apiUrl || images.length > 0) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (!isMounted) return;

        // Procesar solo las primeras 5 imágenes para mejorar performance
        let extractedImages = [];
        if (Array.isArray(data)) {
          extractedImages = data
            .slice(0, 5)
            .flatMap((item) => {
              if (Array.isArray(item.images)) return item.images[0];
              return typeof item.images === "string" ? item.images : null;
            })
            .filter(Boolean);
        }

        setImageData(extractedImages);
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [apiUrl, images.length]);

  // Optimización: useCallback para prevenir re-renders
  const nextSlide = useCallback(() => {
    if (displayImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevSlide = useCallback(() => {
    if (displayImages.length <= 1) return;
    setCurrentIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1,
    );
  }, [displayImages.length]);

  // Auto-play optimizado
  useEffect(() => {
    if (!enableTransitions || displayImages.length <= 1) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [enableTransitions, displayImages.length, nextSlide]);

  // Renderizado condicional para evitar hidratación
  if (!isClient) return null;

  if (loading) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.loadingPlaceholder}>
          <div className={styles.spinner}>🔄</div>
        </div>
      </div>
    );
  }

  if (displayImages.length === 0) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.noImages}>No hay imágenes disponibles</div>
      </div>
    );
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carousel}>
        <div className={styles.carouselContent}>
          <div className={styles.carouselItem} key={currentIndex}>
            <div className="h-full">
              <div className={styles.card}>
                <div className={`${styles.cardContent} p-0`}>
                  <Image
                    src={displayImages[currentIndex]}
                    alt={`Imagen ${currentIndex + 1}`}
                    width={800}
                    height={600}
                    priority={currentIndex === 0}
                    loading={currentIndex === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 768px) 100vw, 80vw"
                    quality={85}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        {showArrows && displayImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="carousel-prev"
              aria-label="Imagen anterior"
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15 18l-6-6 6-6v12z" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="carousel-next"
              aria-label="Imagen siguiente"
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 18l6-6-6-6v12z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Indicadores */}
      {showIndicators && displayImages.length > 1 && (
        <div className={styles.indicators}>
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentIndex ? styles.active : ""
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir a imagen ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CarouselDemo;
