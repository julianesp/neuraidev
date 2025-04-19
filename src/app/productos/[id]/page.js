"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, ShoppingCart } from "lucide-react";

export default function ProductoDetalle({ params }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productoActual, setProductoActual] = useState(null);
  const [accesoriosDestacados, setAccesoriosDestacados] = useState([]);
  const [productosRelacionados, setProductosRelacionados] = useState([]);

  // Cargar el producto actual y los accesorios destacados
  useEffect(() => {
    // Función para cargar datos
    const cargarProductos = async () => {
      try {
        // Llamada a la API
        const response = await fetch("/api/productos");
        if (!response.ok) {
          throw new Error("Error al cargar los productos");
        }

        const productos = await response.json();

        // Encontrar el producto actual por ID (params.id viene del segmento dinámico [id] en la URL)
        const producto = productos.find((p) => p.id === params.id);
        if (!producto) {
          console.error(`Producto con ID ${params.id} no encontrado`);
          return;
        }

        setProductoActual(producto);

        // Filtrar productos destacados
        const destacados = productos.filter(
          (p) => p.destacado === true && p.id !== params.id,
        );
        setAccesoriosDestacados(destacados);

        // Filtrar productos relacionados (misma categoría)
        if (producto.categoria) {
          const relacionados = productos
            .filter(
              (p) => p.categoria === producto.categoria && p.id !== producto.id,
            )
            .slice(0, 4); // Mostrar máximo 4 relacionados
          setProductosRelacionados(relacionados);
        }
      } catch (error) {
        console.error("Error al cargar los productos:", error);
      }
    };

    if (params.id) {
      cargarProductos();
    }
  }, [params.id]);

  // Si no hay producto, mostrar mensaje de carga
  if (!productoActual) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p>Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  // Normalizar imágenes para prevenir errores
  const images = !productoActual.images
    ? ["/placeholder.jpg"]
    : Array.isArray(productoActual.images)
      ? productoActual.images
      : [productoActual.images];

  // Funciones para cambiar manualmente las imágenes
  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
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
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                idx === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDuration: "1000ms" }}
            >
              <Image
                src={img || "/placeholder.jpg"}
                alt={`Imagen ${idx + 1} de ${productoActual.title || "Producto"}`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                style={{ objectFit: "contain" }}
                className="p-6"
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
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{ cursor: "pointer" }}
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
              {productoActual.title || "Accesorio Premium"}
            </h1>

            <div className="bg-gray-50 p-5 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">
                Descripción de accesorio
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {productoActual.description ||
                  "Este accesorio de alta calidad está diseñado para mejorar la experiencia del usuario. Fabricado con materiales duraderos y acabados premium, es compatible con todos los modelos recientes. Incluye garantía de un año y soporte técnico."}
              </p>
            </div>

            {/* Precio y botón de compra */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-green-600 mr-2">
                  {formatPrice(productoActual.price || 299999)}
                </span>
                {productoActual.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(productoActual.oldPrice)}
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
                {productoActual.videoUrl ? (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    poster="/video-thumbnail.jpg"
                  >
                    <source src={productoActual.videoUrl} type="video/mp4" />
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
            {productosRelacionados.length > 0
              ? productosRelacionados.map((item) => (
                  <Link
                    href={`/productos/${item.id}`}
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
                  >
                    <div className="aspect-square relative bg-gray-50">
                      <Image
                        src={
                          Array.isArray(item.images)
                            ? item.images[0]
                            : item.images || "/placeholder.jpg"
                        }
                        alt={item.title || `Accesorio relacionado`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        style={{ objectFit: "contain" }}
                        className="p-3"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-800 truncate">
                        {item.title || `Accesorio ${item.id}`}
                      </h3>
                      <p className="text-green-600 font-semibold mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </Link>
                ))
              : // Productos de ejemplo si no hay relacionados
                [1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
                  >
                    <div className="aspect-square relative bg-gray-50">
                      <Image
                        src="/placeholder.jpg"
                        alt={`Accesorio relacionado ${item}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        style={{ objectFit: "contain" }}
                        className="p-3"
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

        {/* Accesorios destacados */}
        {accesoriosDestacados.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Accesorios destacados
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {accesoriosDestacados.map((item) => (
                <Link
                  href={`/productos/${item.id}`}
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
                >
                  <div className="aspect-square relative bg-gray-50">
                    <Image
                      src={
                        Array.isArray(item.images)
                          ? item.images[0]
                          : item.images || "/placeholder.jpg"
                      }
                      alt={item.title || `Accesorio destacado`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      style={{ objectFit: "contain" }}
                      className="p-3"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 truncate">
                      {item.title || `Accesorio ${item.id}`}
                    </h3>
                    <p className="text-green-600 font-semibold mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
