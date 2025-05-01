import React from "react";
import AccesoriosContainer from "@/containers/AccesoriosContainer/page";

// Este componente será la página que muestra todos los accesorios destacados
export default function AccesoriosDestacadosPage() {
  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        {/* <h1 className="text-3xl font-bold text-center mb-8">
          Accesorios Destacados
        </h1> */}
        {/* <p className="text-gray-600 text-center mb-8">
          Conoce nuestros productos más populares y destacados
        </p> */}

        {/* Usamos el componente AccesoriosContainer con la URL del archivo JSON de destacados */}
        <AccesoriosContainer apiUrl="/accesoriosDestacados.json" />
      </div>
    </main>
  );
}
