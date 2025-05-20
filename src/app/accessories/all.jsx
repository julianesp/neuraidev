import React, { Suspense } from "react";
import AccesoriosContainer from "../../containers/AccesoriosContainer/page";
import { ErrorBoundary } from "react-error-boundary";

// Metadata for SEO
export const metadata = {
  title: "Todos los Accesorios | NeurAI Dev",
  description: "Explora nuestra colección completa de accesorios disponibles.",
  keywords: "accesorios, tienda, productos, colección completa, neuraidev",
};

// Loading component
function AccessoriesLoading() {
  return (
    <div className="max-w-6xl mx-auto p-4 mt-8 bg-white/30 backdrop-blur-md rounded-lg shadow-lg flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Error fallback component
function ErrorFallback({ error }) {
  // Get more specific error message based on error type
  const getErrorMessage = () => {
    if (error.name === 'SyntaxError') {
      return 'Error en el formato de datos recibidos.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    } else if (error.message.includes('timeout')) {
      return 'La solicitud ha tardado demasiado tiempo. Intenta de nuevo más tarde.';
    } else if (error.message.includes('404')) {
      return 'No se encontraron accesorios en esta categoría.';
    } else {
      return error.message || 'Error desconocido al cargar los accesorios.';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8 bg-white/30 backdrop-blur-md rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center text-red-600">
        Algo salió mal al cargar los accesorios
      </h2>
      <p className="text-center mt-4">{getErrorMessage()}</p>
      <div className="flex justify-center mt-6">
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

// Main page component
export default function AllAccessoriesPage() {

  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<AccessoriesLoading />}>
            <AccesoriosContainer apiUrl="/accesorios.json" />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  );
}

