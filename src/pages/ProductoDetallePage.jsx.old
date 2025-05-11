// archivo: pages/ProductoDetalle.js
import React, { useEffect, useState } from "react";
import ProductoDetalle from "../components/ProductoDetalleDeleteAfter";
import { useRouter } from "next/router";
import RootLayout from "../app/layout";

// useEffect(() => {
//   setIsLoaded(true);
// }, []);
// if (!isLoaded) return null;

export default function ProductoDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // quitar error de hidratacion
    setIsLoaded(true);
    // Solo proceder cuando tenemos el ID (que llega después del primer renderizado)
    if (!id) return;

    // Función para cargar datos según la categoría
    const cargarProducto = () => {
      let productoData;

      // Determinar qué datos cargar según la categoría
      switch (id) {
        case "celulares":
          productoData = {
            id: "celular-premium",
            title: "Accesorio Premium para Celular",
            description:
              "Este accesorio de alta calidad está diseñado específicamente para mejorar la experiencia con tu celular. Compatible con los modelos más recientes y con acabados de primera calidad.",
            price: 49900,
            oldPrice: 69900,
            images: [
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F1.jpg?alt=media&token=191dc074-94cd-4ac1-89de-62070679a96e",
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F2.jpg?alt=media&token=dd5ebf3c-578d-4010-a256-650df448dc2b",
            ],
            videoUrl: "https://example.com/videos/celular-demo.mp4",
          };
          break;

        case "computadores":
          productoData = {
            id: "teclado-premium",
            title: "Teclado Genius Avanzado",
            description:
              "Teclado mecánico de alta precisión ideal para gaming y trabajo profesional. Con retroiluminación RGB y teclas programables.",
            price: 129900,
            oldPrice: 149900,
            images: [
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fteclado_genius.jpg?alt=media&token=5a9ecc50-db16-4d9a-b00c-a01de3c506b3",
            ],
            videoUrl: "https://example.com/videos/teclado-demo.mp4",
          };
          break;

        // Agregar casos para las demás categorías
        case "damas":
        case "accesoriesBooksNew":
        case "libros-usados":
          productoData = {
            id: id,
            title: `Accesorio de ${id}`,
            description: `Descripción detallada del accesorio de categoría ${id}`,
            price: 59900,
            images: [
              // Usa URLs de imágenes reales de tu aplicación
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
            ],
            videoUrl: null,
          };
          break;

        default:
          // Si no coincide con ninguna categoría, usar datos genéricos
          productoData = {
            id: id || "generico",
            title: "Accesorio",
            description: "Detalles del accesorio no disponibles",
            price: 29900,
            images: ["/placeholder.jpg"],
          };
      }

      setProducto(productoData);
      setLoading(false);
    };

    // Simular una carga de datos (en producción harías un fetch a tu API)
    setTimeout(cargarProducto, 300);
  }, [id]);
  if (!isLoaded) return null;

  // Pantalla de carga mientras se obtienen los datos
  if (loading) {
    return (
      <RootLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-700">
              Cargando detalles del producto...
            </p>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Renderiza el componente de detalle con los datos del producto
  return <ProductoDetalle producto={producto} />;
}
