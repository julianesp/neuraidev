import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, ShoppingCart } from "lucide-react";

const ProductoDetalle = ({ producto = {} }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [timer, setTimer] = useState(null);

  // Normalizar imágenes para prevenir errores
  const images =
    !producto || !producto.images
      ? ["/placeholder.jpg"]
      : Array.isArray(producto.images)
        ? producto.images
        : [producto.images];

  // Usar useCallback para memorizar la función startAutoplay
  const startAutoplay = useCallback(() => {
    const newTimer = setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      setAutoplay(true);
    }, 5000);
    setTimer(newTimer);
  }, [images.length]); // Solo se recrea si images.length cambia

  // Iniciar autoplay cuando el componente monta
  useEffect(() => {
    startAutoplay();
    return () => clearTimeout(timer);
  }, [startAutoplay, timer]);

  // Actualizar el timer cuando cambia la imagen actual
  useEffect(() => {
    if (autoplay) {
      clearTimeout(timer);
      startAutoplay();
    }
  }, [currentImageIndex, autoplay, startAutoplay, timer]);

  // Función para iniciar el autoplay
  // const startAutoplay = () => {
  //   const newTimer = setTimeout(() => {
  //     setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  //     setAutoplay(true);
  //   }, 5000);
  //   setTimer(newTimer);
  // };

  // Funciones para cambiar manualmente las imágenes
  const prevImage = () => {
    clearTimeout(timer);
    setAutoplay(false);
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );

    // Esperar 5 segundos antes de reanudar el autoplay
    setTimeout(() => {
      setAutoplay(true);
    }, 5000);
  };

  const nextImage = () => {
    clearTimeout(timer);
    setAutoplay(false);
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);

    // Esperar 5 segundos antes de reanudar el autoplay
    setTimeout(() => {
      setAutoplay(true);
    }, 5000);
  };

  // Formatear precio
  const formatPrice = (price) => {
    if (!price) return "$0";

    // Si el precio es un string, convertirlo a número
    const numericPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^\d.-]/g, ""))
        : price;

    // Formatear con separador de miles
    return `$${numericPrice.toLocaleString("es-CO")}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Slider de imágenes */}
        <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden shadow-md mb-8">
          {/* {images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity  ease-in-out ${
                idx === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{transitionDuration:'2000ms'}}
            >
              <Image
                src={
                  img ||
                  "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20celulares/funda%20iphone%20xs/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNlbHVsYXJlcy9mdW5kYSBpcGhvbmUgeHMvMS5qcGciLCJpYXQiOjE3NDE0MDI2MTcsImV4cCI6MTc3MjkzODYxN30.m0HxaFk-b1MM-BN4SvETr6THXURPT_bce2ttGsSDwM0"
                }
                alt={`Imagen ${idx + 1} de ${producto.title || "Producto"}`}
                layout="fill"
                objectFit="contain"
                className="p-6"
              />
            </div>
          ))} */}
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                idx === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDuration: "2000ms" }}
              // {/* Duración personalizada de 2 segundos */}
            >
              <Image
                src={
                  img ||
                  "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20celulares/funda%20iphone%20xs/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNlbHVsYXJlcy9mdW5kYSBpcGhvbmUgeHMvMS5qcGciLCJpYXQiOjE3NDE0MDI2MTcsImV4cCI6MTc3MjkzODYxN30.m0HxaFk-b1MM-BN4SvETr6THXURPT_bce2ttGsSDwM0"
                }
                alt={`Imagen ${idx + 1} de ${producto.title || "Producto"}`}
                layout="fill"
                objectFit="contain"
                className="p-6"
                width={100}
              />
            </div>
          ))}

          {/* Controles del slider */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
                aria-label="Siguiente imagen"
              >
                <ChevronRight size={24} className="text-gray-700" />
              </button>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-blue-600 w-6"
                        : "bg-gray-300 w-2 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Descripción del producto */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {producto.title || "Accesorio Premium"}
            </h1>

            <div className="bg-gray-50 p-5 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">
                Descripción de accesorio
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {producto.description ||
                  "Este accesorio de alta calidad está diseñado para mejorar la experiencia del usuario. Fabricado con materiales duraderos y acabados premium, es compatible con todos los modelos recientes. Incluye garantía de un año y soporte técnico."}
              </p>
            </div>

            {/* Precio y botón de compra */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-green-600 mr-2">
                  {formatPrice(producto.price || 299999)}
                </span>
                {producto.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(producto.oldPrice)}
                  </span>
                )}
              </div>

              <button
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm font-semibold"
                aria-label="Comprar este producto"
              >
                <ShoppingCart size={20} className="mr-2" />
                <span>Comprar</span>
              </button>
            </div>

            {/* Video de presentación */}
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Video de presentación de accesorio
              </h2>

              <div className="bg-gray-50 rounded-xl overflow-hidden relative aspect-video">
                {producto.videoUrl ? (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    poster="/video-thumbnail.jpg"
                  >
                    <source src={producto.videoUrl} type="video/mp4" />
                    Tu navegador no soporta la reproducción de video.
                  </video>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Play size={48} className="text-gray-300 mb-3" />
                    <p className="text-gray-500">Video no disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Accesorios relacionados
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
              >
                <div className="aspect-square relative bg-gray-50">
                  <Image
                    src={`https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20celulares/usb%20tipo%202%20meters/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNlbHVsYXJlcy91c2IgdGlwbyAyIG1ldGVycy8xLmpwZyIsImlhdCI6MTc0MTQ1MzMwMSwiZXhwIjoxNzcyOTg5MzAxfQ.aCyi-QRfw7EpNrIQ6nItyJviRx3e3nElGYzYWt1ErxE`}
                    alt={`Accesorio relacionado ${item}`}
                    layout="fill"
                    objectFit="contain"
                    className="p-3"
                    width={100}
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 truncate">
                    Accesorio {item}
                  </h3>
                  <p className="text-green-600 font-semibold mt-1">
                    {formatPrice(149999 + item * 10000)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;

// Datos de ejemplo para previsualización
export async function getStaticProps() {
  const producto = {
    id: "accesorio-premium",
    title: "Accesorio Premium Ultra",
    description:
      "Este accesorio de alta calidad está diseñado para mejorar la experiencia del usuario. Fabricado con materiales duraderos y acabados premium, es compatible con todos los modelos recientes. Incluye garantía de un año y soporte técnico especializado.",
    price: 299999,
    oldPrice: 349999,
    images: [
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/multi%20puerto%20usb%203%208%20puertos/2.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9tdWx0aSBwdWVydG8gdXNiIDMgOCBwdWVydG9zLzIuanBnIiwiaWF0IjoxNzQxNDAyNjgxLCJleHAiOjE3NzI5Mzg2ODF9.Eb3zeTptmP5_hkQ4xU1WhhKgDYCJY9S1nll6Gx4Wnmk",
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20celulares/funda%20iphone%20xs/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNlbHVsYXJlcy9mdW5kYSBpcGhvbmUgeHMvMS5qcGciLCJpYXQiOjE3NDE0MDI2MTcsImV4cCI6MTc3MjkzODYxN30.m0HxaFk-b1MM-BN4SvETr6THXURPT_bce2ttGsSDwM0",
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/multi%20puerto%20usb%203%208%20puertos/2.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9tdWx0aSBwdWVydG8gdXNiIDMgOCBwdWVydG9zLzIuanBnIiwiaWF0IjoxNzQxNDAyNjgxLCJleHAiOjE3NzI5Mzg2ODF9.Eb3zeTptmP5_hkQ4xU1WhhKgDYCJY9S1nll6Gx4Wnmk",
    ],
    videoUrl:
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20celulares/funda%20iphone%20xs/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNlbHVsYXJlcy9mdW5kYSBpcGhvbmUgeHMvMS5qcGciLCJpYXQiOjE3NDE0MDI2MTcsImV4cCI6MTc3MjkzODYxN30.m0HxaFk-b1MM-BN4SvETr6THXURPT_bce2ttGsSDwM0",
  };

  return {
    props: {
      producto,
    },
  };
}
