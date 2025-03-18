"use client";

// components/AccesoriosContainer.jsx
import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

// Componente principal
const AccesoriosContainer = ({
  accesorio,
  otrosAccesorios,
  telefono = "1234567890", // Teléfono por defecto para WhatsApp
}) => {
  const [mainSlideIndex, setMainSlideIndex] = useState(0);
  const [relatedSlideIndex, setRelatedSlideIndex] = useState(0);

  // Función para avanzar en el carrusel principal
  const nextMainSlide = () => {
    setMainSlideIndex((prevIndex) =>
      prevIndex === accesorio.imagenes.length - 1 ? 0 : prevIndex + 1,
    );
  };

  // Función para retroceder en el carrusel principal
  const prevMainSlide = () => {
    setMainSlideIndex((prevIndex) =>
      prevIndex === 0 ? accesorio.imagenes.length - 1 : prevIndex - 1,
    );
  };

  // Función para avanzar en el carrusel de productos relacionados
  const nextRelatedSlide = () => {
    const totalSlides = Math.ceil(otrosAccesorios.length / 4);
    setRelatedSlideIndex((prevIndex) =>
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1,
    );
  };

  // Función para retroceder en el carrusel de productos relacionados
  const prevRelatedSlide = () => {
    const totalSlides = Math.ceil(otrosAccesorios.length / 4);
    setRelatedSlideIndex((prevIndex) =>
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1,
    );
  };

  // URL para WhatsApp con mensaje predefinido
  const whatsappUrl = `https://wa.me/${telefono}?text=Hola, estoy interesado en el accesorio: ${accesorio.nombre}`;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      {/* Título del accesorio */}
      <h1 className="text-3xl font-bold text-center mb-6">
        {accesorio.nombre}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Carrusel principal */}
        <div className="relative h-96">
          <div className="h-full w-full relative overflow-hidden rounded-lg">
            {accesorio.imagenes.map((imagen, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === mainSlideIndex ? "opacity-100" : "opacity-0"}`}
              >
                <Image
                  src={imagen.url}
                  alt={`${accesorio.nombre} - Imagen ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                  // width={100}
                  // height={100}
                />
              </div>
            ))}

            {/* Controles del carrusel principal */}
            <button
              onClick={prevMainSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md hover:bg-opacity-75 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextMainSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md hover:bg-opacity-75 transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicadores de posición */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {accesorio.imagenes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setMainSlideIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === mainSlideIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Descripción y detalles */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-3">Descripción</h2>
            <p className="text-gray-600 mb-4">{accesorio.descripcion}</p>

            {/* Características */}
            {accesorio.caracteristicas && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Características</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {accesorio.caracteristicas.map((caracteristica, index) => (
                    <li key={index} className="text-gray-600">
                      {caracteristica}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Precio */}
            <div className="mt-4">
              <span className="text-2xl font-bold text-primary">
                ${accesorio.precio.toFixed(2)}
              </span>
              {accesorio.precioAnterior && (
                <span className="ml-2 text-gray-400 line-through">
                  ${accesorio.precioAnterior.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Botón de WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 bg-green-500 text-white py-3 px-6 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="mr-2" />
            Consultar por WhatsApp
          </a>
        </div>
      </div>

      {/* Carrusel de productos relacionados */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Otros accesorios
        </h2>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${relatedSlideIndex * 100}%)` }}
            >
              {/* Agrupamos los accesorios en conjuntos de 4 */}
              {Array.from({
                length: Math.ceil(otrosAccesorios.length / 4),
              }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="min-w-full grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {otrosAccesorios
                    .slice(slideIndex * 4, slideIndex * 4 + 4)
                    .map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="cursor-pointer bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow"
                        onClick={() =>
                          (window.location.href = `/accesorios/${item.id}`)
                        }
                      >
                        <div className="relative h-40 mb-2 overflow-hidden rounded">
                          <Image
                            src={item.imagenPrincipal}
                            alt={item.nombre}
                            // layout="fill"
                            objectFit="cover"
                            width={100}
                            height={100}
                          />
                        </div>
                        <h3 className="font-medium text-sm truncate">
                          {item.nombre}
                        </h3>
                        <p className="text-primary font-bold mt-1">
                          ${item.precio.toFixed(2)}
                        </p>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Controles del carrusel de relacionados */}
          {otrosAccesorios.length > 4 && (
            <>
              <button
                onClick={prevRelatedSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextRelatedSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccesoriosContainer;
