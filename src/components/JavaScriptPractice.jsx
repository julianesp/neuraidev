"use client";

import React from "react";
import Link from "next/link";

export default function JavaScriptPractice() {
  return (
    <article className="w-full max-w-4xl mx-auto mb-12 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 dark:border-gray-700/30">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          🚀 Prácticas de JavaScript
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
      </div>

      {/* Descripción */}
      <div className="mb-8">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          En mi repositorio de GitHub, he estado documentando mi progreso en el
          aprendizaje de JavaScript. Aquí encontrarás una colección de
          ejercicios básicos que me sirven para fortalecer habilidades en
          programación.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
            📚 Lo que encontrarás:
          </p>
          <ul className="text-gray-700 dark:text-gray-300 space-y-1 ml-4">
            <li>• Ejercicios de fundamentos de JavaScript</li>
            <li>• Manipulación del DOM</li>
            <li>• Proyectos prácticos interactivos</li>
            <li>• Ejemplos de código comentado</li>
            <li>• Soluciones a problemas de programación</li>
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 p-1 rounded-lg mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Cada ejercicio incluye botones interactivos que te permiten ejecutar
            el código directamente
          </p>
        </div>

        <Link
          href="https://julianesp.github.io/exercises_javascript/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black dark:from-gray-700 dark:to-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-gray-800 hover:to-gray-900 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Ver Prácticas en GitHub
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
