import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

export default function AccesoriosPage() {
  const [imageError, setImageError] = useState({});
  const [imageId, setImageId] = useState({});
  // Datos de ejemplo para los accesorios
  const accesorios = [
    {
      id: 1,
      nombre: "Accesorio 1",
      descripcion:
        "Este es un accesorio de alta calidad diseñado para mejorar tu experiencia. Fabricado con materiales premium y acabados de lujo.",
      precio: 29.99,
      imagenes: [
        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",

        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      ],
      video:
        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
    },
    {
      id: 2,
      nombre: "Accesorio 2",
      descripcion:
        "Accesorio versátil con múltiples funciones. Ideal para uso diario y compatible con varios dispositivos.",
      precio: 39.99,
      imagenes: [
        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      ],
      video:
        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
    },
  ];

  const accesorioActual = accesorios[0];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Carrusel de imágenes con flechas de navegación */}
      <Carousel className="w-full mb-6 rounded-xl overflow-hidden border">
        <CarouselContent>
          {accesorioActual.imagenes.map((imagen, index) => (
            <CarouselItem key={index}>
              <div className="flex items-center justify-center p-1">
                <Image
                  src={
                    imagen ||
                    "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
                  }
                  alt={`Imagen ${index + 1} de ${accesorioActual.nombre}`}
                  width={800}
                  height={400}
                  className="rounded-lg object-cover w-full h-[200px] md:h-[300px]"
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/80 hover:bg-white">
          <ChevronLeft className="h-6 w-6" />
        </CarouselPrevious>
        <CarouselNext className="right-2 bg-white/80 hover:bg-white">
          <ChevronRight className="h-6 w-6" />
        </CarouselNext>
      </Carousel>

      {/* Descripción del accesorio */}
      <div className="mb-6 p-4 border rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Descripción de accesorio</h2>
        <p className="text-gray-700">{accesorioActual.descripcion}</p>
      </div>

      {/* Botón de comprar */}
      <div className="mb-6 flex justify-center">
        <Button className="px-8 py-6 text-lg font-semibold">Comprar</Button>
      </div>

      {/* Video de presentación */}
      <div className="mb-6 p-4 border rounded-xl">
        <h2 className="text-xl font-semibold mb-2">
          Video de presentación de accesorio
        </h2>
        <div className="relative rounded-lg overflow-hidden">
          <Image
            src={
              accesorioActual.video ||
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
            }
            alt="Video de presentación"
            width={800}
            height={300}
            className="w-full h-[200px] object-cover"
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
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-16 h-16 bg-white/80 hover:bg-white"
            >
              <Play className="h-8 w-8" />
            </Button>
          </div>
        </div>
      </div>

      {/* Galería de accesorios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Card
            key={item}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="p-2">
              <Image
                src={`https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b`}
                alt={`Accesorio ${item}`}
                width={150}
                height={150}
                className="w-full h-[100px] object-cover rounded-md"
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
              <p className="mt-2 text-center font-medium">Accesorio {item}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
