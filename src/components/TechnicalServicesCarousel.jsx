"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/components/Carousel.module.scss";

const TechnicalServicesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const servicesData = [
    {
      id: 1,
      title: "Formateo de Computadores",
      description:
        "Formateo completo con instalación de sistemas operativos como Windows o alguna distribución de Linux. Programas esenciales y optimización del sistema para máximo rendimiento.",
      image:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/computer.png",
      features: [
        "Instalación de Sistema Operativo",
        "Programas Básicos",
        "Drivers Actualizados",
      ],
      // price: "Desde $50.000",
      icon: "💻",
    },
    {
      id: 2,
      title: "Mantenimiento Preventivo",
      description:
        "Limpieza completa interna y externa, cambio de pasta térmica, optimización del sistema y diagnóstico de hardware.",
      image:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/servicios/mantenimiento.jpg",
      features: [
        "Limpieza Interna",
        "Cambio Pasta Térmica",
        "Optimización Sistema",
        "Diagnóstico Hardware",
      ],
      // price: "Desde $50.000",
      icon: "🔧",
    },
    {
      id: 3,
      title: "Upgrade de Componentes",
      description:
        "Mejora tu PC con nuevos componentes: RAM DDR4, discos SSD, y más.",
      image:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Accesorios/computers/ram%20ddr4%208%20gb/1.jpg",
      features: [
        "Memoria RAM DDR4",
        "Discos SSD",
        "Discos SSD M.2",
        "Hub USB C",
        "Instalación Incluida",
      ],
      // price: "Desde $63.900",
      icon: "⚡",
    },
    {
      id: 4,
      title: "Soporte Técnico",
      description:
        "Asesoría personalizada, soporte remoto y presencial, configuración de redes y recuperación de datos.",
      image:
        "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/servicios/mantenimiento.jpg",
      features: [
        "Soporte Remoto",
        "Configuración Redes",
        "Recuperación Datos",
        "Asesoría Especializada",
      ],
      // price: "Desde $40.000",
      icon: "🛠️",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % servicesData.length);
  }, [servicesData.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? servicesData.length - 1 : prev - 1,
    );
  }, [servicesData.length]);

  // Función para ir a una diapositiva específica
  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Función para alternar pausa/play
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Auto-play con pausa
  useEffect(() => {
    if (!isClient || isPaused) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isClient, isPaused, nextSlide]);

  if (!isClient) return null;

  const currentService = servicesData[currentIndex];

  return (
    <div className="w-full max-w-6xl mx-auto my-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🛠️ Servicios Técnicos Profesionales
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Soluciones completas para mantener tu computador en óptimas
          condiciones
        </p>
      </div>

      <div className="relative bg-white/10 backdrop-blur-md dark:bg-black/20 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px]">
          {/* Image Section */}
          <div className="relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
            <Image
              src={currentService.image}
              alt={currentService.title}
              width={600}
              height={100}
              className="w-full h-48 md:h-80 object-cover"
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? "eager" : "lazy"}
              onError={(e) => {
                // Fallback image if main image fails to load
                e.target.src =
                  "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/servicios/mantenimiento.jpg";
              }}
            />
            <div className="absolute top-4 left-4">
              <div className="bg-blue-500 text-white p-3 rounded-full text-2xl">
                {currentService.icon}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {currentService.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {currentService.description}
              </p>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                ✅ Incluye:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentService.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                  >
                    <span className="text-green-500 mr-2">▪</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price and CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentService.price}
              </div>
              <Link
                href="/servicios/tecnicos"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Solicitar Servicio
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => {
            prevSlide();
            setIsPaused(false); // Reanudar autoplay después del cambio manual
          }}
          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-black text-white p-2 md:p-3 rounded-full transition-all duration-300 z-10 hover:scale-110"
          aria-label="Servicio anterior"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="md:w-6 md:h-6"
          >
            <path d="M15 18l-6-6 6-6v12z" />
          </svg>
        </button>

        <button
          onClick={() => {
            nextSlide();
            setIsPaused(false); // Reanudar autoplay después del cambio manual
          }}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-black text-white p-2 md:p-3 rounded-full transition-all duration-300 z-10 hover:scale-110"
          aria-label="Servicio siguiente"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="md:w-6 md:h-6"
          >
            <path d="M9 18l6-6-6-6v12z" />
          </svg>
        </button>

        {/* Botón de Pausa/Play */}
        <button
          onClick={togglePause}
          className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white p-2 md:p-3 rounded-full transition-all duration-300 z-10 hover:scale-110"
          aria-label={isPaused ? "Reanudar autoplay" : "Pausar autoplay"}
          title={isPaused ? "Reanudar autoplay" : "Pausar autoplay"}
        >
          {isPaused ? (
            // Icono de Play
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="md:w-6 md:h-6"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            // Icono de Pausa
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="md:w-6 md:h-6"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {servicesData.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index);
                setIsPaused(false); // Reanudar autoplay después del cambio manual
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white shadow-lg scale-125"
                  : "bg-white/40 hover:bg-white/60 hover:scale-110"
              }`}
              aria-label={`Ir al servicio ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="mt-4 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          ¿Necesitas alguno de estos servicios?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Contáctanos para una consulta gratuita y presupuesto personalizado
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="https://wa.me/573174503604?text=Hola, necesito información sobre servicios técnicos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
            </svg>
            WhatsApp
          </Link>

          {/* <Link
            href="tel:+573174503604"
            className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Llamar
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default TechnicalServicesCarousel;
