import React from "react";
// import AccesoriosContainer from "@/containers/AccesoriosContainer/page";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";

// Este componente será la página que muestra todos los accesorios destacados
export default function AccesoriosDestacadosPage() {
  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer apiUrl="/accesoriosDestacados.json" />
      </div>
    </main>
  );
}
