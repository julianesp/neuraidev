"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ArrowRight } from "lucide-react";
import { portafolioSitios } from "@/data/portafolioSitios";

/**
 * Sección de la página de inicio que muestra los sitios web / PWAs del
 * portafolio, con un botón para acceder a cada uno y un acceso directo a la
 * página completa de desarrollo de software.
 */
export default function PortafolioSitios() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            🚀 Sitios Web y Aplicaciones
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Algunos de los proyectos y plataformas que hemos desarrollado con
            tecnologías modernas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {portafolioSitios.map((sitio) => (
            <div
              key={sitio.id}
              className="flex flex-col items-center text-center bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-center w-20 h-20 mb-4">
                {sitio.imagen.startsWith("http") ? (
                  <Image
                    src={sitio.imagen}
                    alt={sitio.nombre}
                    width={80}
                    height={80}
                    style={{ objectFit: "contain", borderRadius: "8px" }}
                    unoptimized
                  />
                ) : (
                  <span className="text-5xl">{sitio.imagen}</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {sitio.nombre}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 flex-grow">
                {sitio.descripcion}
              </p>
              <Link
                href={sitio.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm"
              >
                Visitar sitio
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Acceso directo a la página completa de desarrollo de software */}
        <div className="mt-10 text-center">
          <Link
            href="/servicios/desarrollador-software"
            className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-colors"
          >
            Ver todos los servicios de desarrollo web
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
