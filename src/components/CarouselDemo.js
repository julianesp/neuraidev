// "use client";

// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";

// import Image from "next/image";
// import { useEffect, useState } from "react";

// import styles from "@/styles/Carousel.module.scss";

// export function CarouselDemo({ images = [], apiUrl }) {
//   const [imageData, setImageData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Si se proporciona un apiUrl, carga las imágenes desde la API
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
//           console.log("Datos cargados del JSON:", data); // Para depuración

//           let extractedImages = [];

//           // Intenta extraer las imágenes según diferentes estructuras posibles
//           if (Array.isArray(data)) {
//             // Caso 1: El JSON es un array de objetos, cada uno con una propiedad 'images'
//             extractedImages = data.flatMap((item) => {
//               // Si item.images es un array, lo usamos directamente
//               if (Array.isArray(item.images)) {
//                 return item.images;
//               }
//               // Si item.images es una string, la convertimos en un elemento de array
//               else if (typeof item.images === "string") {
//                 return [item.images];
//               }
//               // Si el item tiene propiedades como d1, d2, etc. (como en tu variable 'accesorios')
//               else {
//                 return Object.values(item).filter(
//                   (value) =>
//                     typeof value === "string" &&
//                     (value.includes("http") || value.includes("/")),
//                 );
//               }
//             });
//           } else if (typeof data === "object" && data !== null) {
//             // Caso 2: El JSON es un objeto único con propiedades que contienen URLs
//             extractedImages = Object.values(data).filter(
//               (value) =>
//                 typeof value === "string" &&
//                 (value.includes("http") || value.includes("/")),
//             );
//           }

//           console.log("Imágenes extraídas:", extractedImages); // Para depuración
//           setImageData(extractedImages);
//         })
//         .catch((error) => {
//           console.error("Error cargando imágenes:", error);
//           setError(error.message);
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [apiUrl]);

//   // Usa las imágenes proporcionadas directamente o las cargadas desde la API
//   const displayImages = images.length > 0 ? images : imageData;

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
//     <Carousel className={`${styles.carousel} w-full`}>
//       <CarouselContent className={styles.carouselContent}>
//         {displayImages.map((src, index) => (
//           <CarouselItem key={index} className={styles.carouselItem}>
//             <div className="p-1">
//               <Card className={styles.card}>
//                 <CardContent className={`${styles.cardContent} p-0`}>
//                   <Image
//                     src={src}
//                     alt={`Imagen ${index + 1}`}
//                     className="rounded-lg"
//                     width={800}
//                     height={600}
//                     priority={index === 0} // Prioriza la carga de la primera imagen
//                     sizes="(max-width: 768px) 100vw, 80vw"
//                   />
//                 </CardContent>
//               </Card>
//             </div>
//           </CarouselItem>
//         ))}
//       </CarouselContent>
//       <CarouselPrevious />
//       <CarouselNext />
//     </Carousel>
//   );
// }

// export default CarouselDemo;

"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "@/styles/Carousel.module.scss";

export function CarouselDemo({ images = [], apiUrl }) {
  const [imageData, setImageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si se proporciona un apiUrl, carga las imágenes desde la API
    if (apiUrl) {
      setLoading(true);
      setError(null);

      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Datos cargados del JSON:", data); // Para depuración

          let extractedImages = [];

          // Intenta extraer las imágenes según diferentes estructuras posibles
          if (Array.isArray(data)) {
            // Caso 1: El JSON es un array de objetos, cada uno con una propiedad 'images'
            extractedImages = data.flatMap((item) => {
              // Si item.images es un array, lo usamos directamente
              if (Array.isArray(item.images)) {
                return item.images;
              }
              // Si item.images es una string, la convertimos en un elemento de array
              else if (typeof item.images === "string") {
                return [item.images];
              }
              // Si el item tiene propiedades como d1, d2, etc. (como en tu variable 'accesorios')
              else {
                return Object.values(item).filter(
                  (value) =>
                    typeof value === "string" &&
                    (value.includes("http") || value.includes("/")),
                );
              }
            });
          } else if (typeof data === "object" && data !== null) {
            // Caso 2: El JSON es un objeto único con propiedades que contienen URLs
            extractedImages = Object.values(data).filter(
              (value) =>
                typeof value === "string" &&
                (value.includes("http") || value.includes("/")),
            );
          }

          console.log("Imágenes extraídas:", extractedImages); // Para depuración
          setImageData(extractedImages);
        })
        .catch((error) => {
          console.error("Error cargando imágenes:", error);
          setError(error.message);
        })
        .finally(() => setLoading(false));
    }
  }, [apiUrl]);

  // Usa las imágenes proporcionadas directamente o las cargadas desde la API
  const displayImages = images.length > 0 ? images : imageData;

  if (loading) {
    return <div>Cargando imágenes...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!displayImages || displayImages.length === 0) {
    return (
      <div>No hay imágenes disponibles. Verifique la estructura del JSON.</div>
    );
  }

  return (
    <Carousel className={`${styles.carousel} w-full h-full`}>
      <CarouselContent className={styles.carouselContent}>
        {displayImages.map((src, index) => (
          <CarouselItem key={index} className={styles.carouselItem}>
            <div className="p-1 h-full">
              <Card className={styles.card}>
                <CardContent className={`${styles.cardContent} p-0`}>
                  <Image
                    src={src}
                    alt={`Imagen ${index + 1}`}
                    className="rounded-lg"
                    width={800}
                    height={600}
                    priority={index === 0} // Prioriza la carga de la primera imagen
                    sizes="(max-width: 768px) 100vw, 80vw"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default CarouselDemo;
