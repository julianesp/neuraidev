"use client";

import React from "react";
import Link from "next/link";

export default function ClientesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Fondo con backdrop-filter */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-blue-50/20 to-teal-100/30 dark:from-green-900/20 dark:via-blue-900/15 dark:to-teal-900/20"></div>
      <div className="absolute inset-0 backdrop-blur-[1px] bg-white/10 dark:bg-black/10"></div>
      
      {/* Contenido */}
      <div className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-md p-8 relative z-10">
        <h1 className="text-3xl font-bold mb-4 text-blue-700 dark:text-blue-400 border-b pb-2">
          Atención al cliente
        </h1>

        <p className="mb-4 text-gray-700 dark:text-gray-300">
          En <strong>neurai.dev</strong>, estamos comprometidos a brindarte la
          mejor experiencia posible. Estaremos disponibles para ayudarte con
          cualquier duda, consulta o inconveniente que puedas tener.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600 dark:text-blue-400">
          ¿Cómo podemos ayudarte?
        </h2>
        <ul className="list-disc list-inside mb-4 text-gray-800 dark:text-gray-300 space-y-1">
          <li>Consultas sobre productos y servicios.</li>
          <li>Soporte técnico para tus compras.</li>
          <li>Devoluciones, cambios y garantías.</li>
          <li>Sugerencias y retroalimentación.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600 dark:text-blue-400">
          Contáctanos
        </h2>
        <p className="mb-2 text-gray-700 dark:text-gray-300">
          Puedes comunicarte con nosotros a través de los siguientes canales:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-800 dark:text-gray-300">
          <li>
            <strong>Correo electrónico:</strong>{" "}
            <Link
              href="mailto:julii1295@gmail.com"
              className="text-blue-500 dark:text-blue-400 underline hover:text-blue-600 dark:hover:text-blue-300"
            >
              Enviar mensaje
            </Link>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600 dark:text-blue-400">
          Horarios de atención
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          El horario de atención es de <strong>lunes a viernes</strong>, de{" "}
          <strong>8:00 AM a 6:00 PM</strong>. Fuera de este horario, puedes
          dejarnos un mensaje a través de las redes sociales que se encuentran
          en el botón del lado inferior izquierdo y te responderemos lo antes
          posible.
        </p>

        <div className="mt-8 border-t pt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} neurai.dev &mdash; Todos los
          derechos reservados.
        </div>
      </div>
    </div>
  );
}