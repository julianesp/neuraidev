import React, { useEffect, useState } from "react";
import RootLayout from "@/src/app/layout";
import Link from "next/link";

const Clientes = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return (
    <RootLayout>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 mb-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-700 border-b pb-2">
          Atención al cliente
        </h1>

        <p className="mb-4 text-gray-700">
          En <strong>neurai.dev</strong>, estamos comprometidos a brindarte la
          mejor experiencia posible. Estaremos disponibles para ayudarte con
          cualquier duda, consulta o inconveniente que puedas tener.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">
          ¿Cómo podemos ayudarte?
        </h2>
        <ul className="list-disc list-inside mb-4 text-gray-800">
          <li>Consultas sobre productos y servicios.</li>
          <li>Soporte técnico para tus compras.</li>
          <li>Devoluciones, cambios y garantías.</li>
          <li>Sugerencias y retroalimentación.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">
          Contáctanos
        </h2>
        <p className="mb-2 text-gray-700">
          Puedes comunicarte con nosotros a través de los siguientes canales:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-800">
          <li>
            <strong>Correo electrónico:</strong>{" "}
            <Link
              href="mailto:julii1295@gmail.com"
              className="text-blue-500 underline"
            >
              enviar mensaje
            </Link>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">
          Horarios de atención
        </h2>
        <p className="mb-4 text-gray-700">
          El horario de atención es de <strong>lunes a viernes</strong>, de{" "}
          <strong>8:00 AM a 6:00 PM</strong>. Fuera de este horario, puedes
          dejarnos un mensaje a través de las redes sociales que se encuentran
          en el botón del lado inferior izquierdo y te responderemos lo antes
          posible.
        </p>

        <div className="mt-8 border-t pt-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} neurai.dev &mdash; Todos los
          derechos reservados.
        </div>
      </div>
    </RootLayout>
  );
};

export default Clientes;
