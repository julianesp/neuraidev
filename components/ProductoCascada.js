"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X
} from "lucide-react";
import { useSoldProducts } from "../hooks/useSoldProducts";
import { htmlToPlainText } from "@/utils/htmlToText";
import {
  generateProductSlug,
  buildProductUrl,
} from "../utils/slugify";
import { useCart } from "../context/CartContext";
import { useToast } from "../contexts/ToastContext";

export default function ProductoCascada({ productos, categorySlug = "generales" }) {
  const [slideIndexes, setSlideIndexes] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedImageIndex, setExpandedImageIndex] = useState(0);
  const [productosConEstado, setProductosConEstado] = useState([]);

  const { applySoldStatus } = useSoldProducts();
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    if (productos && Array.isArray(productos)) {
      const conEstado = applySoldStatus(productos);
      setProductosConEstado(conEstado);

      const initialIndexes = {};
      productos.forEach((producto) => {
        if (producto && producto.id) {
          initialIndexes[producto.id] = 0;
        }
      });
      setSlideIndexes(initialIndexes);
    }
  }, [productos, applySoldStatus]);

  if (!productosConEstado || productosConEstado.length === 0) {
    return <div className="text-center py-8">Cargando productos...</div>;
  }

  const normalizeImages = (images, producto) => {
    // Si hay imagen_principal, úsala como primera opción
    if (producto?.imagen_principal) {
      return [producto.imagen_principal];
    }

    if (!images) return ["https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"];
    if (typeof images === "string") return [images];
    if (Array.isArray(images)) {
      const normalized = images.map(img => {
        if (typeof img === "object" && img.url) {
          return img.url;
        }
        return img;
      });
      return normalized.length > 0 ? normalized : ["https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"];
    }
    return ["https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"];
  };

  const formatPrice = (price) => {
    if (!price) return "$0";
    const numericPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^\d.-]/g, ""))
        : price;
    return `$${numericPrice.toLocaleString("es-CO")}`;
  };

  const handleImageError = (productoId, imageIndex) => {
    setImageErrors((prev) => ({
      ...prev,
      [`${productoId}-${imageIndex}`]: true,
    }));
  };

  const nextSlide = (productoId, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const producto = productosConEstado.find((item) => item?.id === productoId);
    if (!producto) return;

    const images = normalizeImages(producto.images || producto.imagenes);
    const totalSlides = images.length;
    if (totalSlides <= 1) return;

    setSlideIndexes((prev) => ({
      ...prev,
      [productoId]: ((prev[productoId] || 0) + 1) % totalSlides,
    }));
  };

  const prevSlide = (productoId, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const producto = productosConEstado.find((item) => item?.id === productoId);
    if (!producto) return;

    const images = normalizeImages(producto.images || producto.imagenes);
    const totalSlides = images.length;
    if (totalSlides <= 1) return;

    setSlideIndexes((prev) => ({
      ...prev,
      [productoId]: ((prev[productoId] || 0) - 1 + totalSlides) % totalSlides,
    }));
  };

  const handleExpandImage = (images, index, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setExpandedImage(images);
    setExpandedImageIndex(index);
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
    setExpandedImageIndex(0);
  };

  const nextExpandedImage = (e) => {
    e.stopPropagation();
    if (!expandedImage) return;
    setExpandedImageIndex((prev) => (prev + 1) % expandedImage.length);
  };

  const prevExpandedImage = (e) => {
    e.stopPropagation();
    if (!expandedImage) return;
    setExpandedImageIndex((prev) =>
      (prev - 1 + expandedImage.length) % expandedImage.length
    );
  };

  return (
    <>
      <div className="w-full px-4 py-8">
        {/* Grid de productos - tamaño uniforme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {productosConEstado.map((producto, index) => {
                if (!producto) return null;

                const images = normalizeImages(producto.images || producto.imagenes, producto);
                const currentImageIndex = slideIndexes[producto.id] || 0;
                const isOutOfStock = producto.vendido || producto.stock === 0 || producto.cantidad === 0;

                return (
                  <div
                    key={producto.id || index}
                    className={`group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative ${
                      isOutOfStock ? "opacity-70" : ""
                    }`}
                  >
                    {/* Botón de carrito superior derecho - FUERA de la imagen */}
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isOutOfStock) return;

                        const success = await addToCart(producto, 1);
                        if (success) {
                          toast.success(`"${producto.nombre || producto.title}" agregado al carrito`, {
                            title: "✅ Producto Agregado",
                            duration: 3000,
                          });
                        }
                      }}
                      className={`absolute top-3 right-3 z-30 p-2.5 rounded-full shadow-lg transition-all ${
                        isOutOfStock
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-110"
                      }`}
                      disabled={isOutOfStock}
                      aria-label={isOutOfStock ? "Producto agotado" : "Agregar al carrito"}
                      title={isOutOfStock ? "Producto agotado" : "Agregar al carrito"}
                    >
                      <ShoppingCart size={18} />
                    </button>

                    {/* Badge de stock bajo */}
                    {!isOutOfStock && producto.stock && producto.stock <= 5 && (
                      <div className="absolute top-3 left-3 z-20 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ¡Últimas {producto.stock}!
                      </div>
                    )}

                    {/* Badge de VENDIDO o AGOTADO */}
                    {isOutOfStock && (
                      <div className="absolute top-3 left-3 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {producto.vendido ? "VENDIDO" : "AGOTADO"}
                      </div>
                    )}

                    {/* Galería de imágenes con altura fija */}
                    <div className="relative w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <div className="relative w-full h-full">
                        {images.map((img, idx) => {
                          const imageErrorKey = `${producto.id}-${idx}`;
                          const hasImageError = imageErrors[imageErrorKey];

                          return (
                            <div
                              key={idx}
                              className={`absolute inset-0 transition-opacity duration-500 ${
                                idx === currentImageIndex ? "opacity-100" : "opacity-0"
                              }`}
                            >
                              {hasImageError ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-500 text-sm">Error cargando imagen</span>
                                </div>
                              ) : (
                                <Image
                                  src={img || "https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"}
                                  alt={producto.title || producto.nombre || "Producto"}
                                  fill
                                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                  priority={false}
                                  loading="lazy"
                                  quality={85}
                                  onError={() => handleImageError(producto.id || index, idx)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Botón de expandir */}
                      <button
                        onClick={(e) => handleExpandImage(images, currentImageIndex, e)}
                        className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-lg z-30 opacity-0 group-hover:opacity-100"
                        aria-label="Expandir imagen"
                      >
                        <Maximize2 size={16} className="text-gray-700" />
                      </button>

                      {/* Controles de navegación */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => prevSlide(producto.id, e)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/70 transition-all z-30 opacity-0 group-hover:opacity-100"
                            aria-label="Imagen anterior"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={(e) => nextSlide(producto.id, e)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/70 transition-all z-30 opacity-0 group-hover:opacity-100"
                            aria-label="Siguiente imagen"
                          >
                            <ChevronRight size={18} />
                          </button>

                          {/* Indicadores */}
                          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSlideIndexes(prev => ({...prev, [producto.id]: idx}));
                                }}
                                className={`transition-all rounded-full ${
                                  idx === currentImageIndex
                                    ? "bg-white w-6 h-1.5"
                                    : "bg-white/50 w-1.5 h-1.5 hover:bg-white/70"
                                }`}
                                aria-label={`Ir a imagen ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="p-4">
                      <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">
                        {producto.title || producto.nombre || "Sin título"}
                      </h3>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {htmlToPlainText(producto.description || producto.descripcion || "Sin descripción", 120)}
                      </p>

                      {/* Precio */}
                      <div className="mb-3">
                        <span className="text-xl font-bold text-green-600">
                          {formatPrice(producto.price || producto.precio)}
                        </span>
                        {producto.cantidad && (
                          <p className="text-xs text-gray-500 mt-1">
                            Stock: {producto.cantidad}
                          </p>
                        )}
                      </div>

                      {/* Botón Ver detalles */}
                      <Link
                        href={buildProductUrl(
                          categorySlug,
                          generateProductSlug(producto),
                          producto
                        )}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye size={16} />
                        <span>Ver detalles</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Modal de imagen expandida */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeExpandedImage}
        >
          <button
            onClick={closeExpandedImage}
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all z-50"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
            <Image
              src={expandedImage[expandedImageIndex] || "https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"}
              alt="Imagen expandida"
              fill
              className="object-contain"
              sizes="100vw"
              quality={100}
              priority
            />

            {expandedImage.length > 1 && (
              <>
                <button
                  onClick={prevExpandedImage}
                  className="absolute left-4 bg-white/10 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/20 transition-all"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={nextExpandedImage}
                  className="absolute right-4 bg-white/10 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/20 transition-all"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight size={32} />
                </button>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {expandedImage.map((_, idx) => (
                    <div
                      key={idx}
                      className={`transition-all rounded-full ${
                        idx === expandedImageIndex
                          ? "bg-white w-8 h-2"
                          : "bg-white/50 w-2 h-2"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
