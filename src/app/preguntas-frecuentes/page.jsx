"use client";

import FAQ from "../../components/FAQ";

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Preguntas Frecuentes
        </h1>
        <FAQ />
      </div>
    </div>
  );
}
