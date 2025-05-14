import React from "react";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";

export default function BicicletasPage() {
  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer apiUrl="/bicicletas.json" />
      </div>
    </main>
  );
}

