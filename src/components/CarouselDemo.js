// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import Image from "next/image";

// export default function CarouselDemo({ apiUrl }) {
//   const [images, setImages] = useState([]);

//   useEffect(() => {
//     if (!apiUrl) return;

//     fetch(apiUrl)
//       .then((response) => response.json())
//       .then((data) => {
//         const extractedImages = data
//           .map((item) =>
//             Array.isArray(item.images) ? item.images[0] : item.images,
//           )
//           .filter((image) => image);
//         setImages(extractedImages);
//       })
//       .catch((error) => console.error("Error al cargar el JSON:", error));
//   }, [apiUrl]);

//   return (
//     <Carousel className="w-full max-w-xs">
//       <CarouselContent>
//         {images.map((image, index) => (
//           <CarouselItem key={index}>
//             <div className="p-1">
//               <Card>
//                 <CardContent className="flex aspect-square items-center justify-center p-6">
//                   <Image
//                     src={image}
//                     width={100}
//                     height={100}
//                     alt={`Accesorio ${index + 1}`}
//                     className="w-full h-full object-cover"
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

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import Image from "next/image";

const CarouselDemo = ({ apiUrl, linkUrl }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideInterval = 5000; // 5 segundos
  let intervalId;

  useEffect(() => {
    if (!apiUrl) return;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const extractedImages = data
          .map((item) =>
            Array.isArray(item.images) ? item.images[0] : item.images,
          )
          .filter((image) => image);
        setImages(extractedImages);
      })
      .catch((error) => console.error("Error al cargar el JSON:", error));
  }, [apiUrl]);

  useEffect(() => {
    startAutoSlide();
    return stopAutoSlide;
  }, [currentIndex, images]);

  const startAutoSlide = () => {
    stopAutoSlide();
    intervalId = setInterval(() => {
      handleNext();
    }, slideInterval);
  };

  const stopAutoSlide = () => {
    clearInterval(intervalId);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const handleUserInteraction = (action) => {
    stopAutoSlide();
    action();
    setTimeout(() => {
      startAutoSlide();
    }, slideInterval);
  };

  return (
    <div>
      <Carousel className=" max-w-xs relative w-screen">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem
              key={index}
              className={index === currentIndex ? "block" : "hidden"}
            >
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <Image
                      src={image}
                      alt={`Accesorio ${index + 1}`}
                      className="w-full h-full object-cover"
                      width={320}
                      height={100}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="absolute ml-14"
          onClick={() => handleUserInteraction(handlePrevious)}
        />
        <CarouselNext
          className="absolute mr-14"
          onClick={() => handleUserInteraction(handleNext)}
        />
      </Carousel>

      {/* Botón para abrir en nueva pestaña */}
      <div className="mt-4 text-center">
        <Link
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg"
        >
          Ver más detalles
        </Link>
      </div>
    </div>
  );
};

export default CarouselDemo;
