"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  ShoppingCart,
  Eye,
  Heart,
  Share2
} from "lucide-react";
import { useSoldProducts } from "../hooks/useSoldProducts";
import SoldMarker from "./SoldMarker";
import {
  generateProductSlug,
  buildProductUrl,
  getCategorySlug,
} from "../utils/slugify";
import { useCart } from "../context/CartContext";

const ModernProductGrid = (props) => {
  const [accesorios, setAccesorios] = useState([]);
  const [slideIndexes, setSlideIndexes] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedImageIndex, setExpandedImageIndex] = useState(0);

  const { applySoldStatus, toggleSoldStatus } = useSoldProducts();
  const { addToCart } = useCart();
  const categorySlug = props.categorySlug || "generales";

  useEffect(() => {
    if (props.accesorios && Array.isArray(props.accesorios)) {
      const accesoriosConEstado = applySoldStatus(props.accesorios);
      setAccesorios(accesoriosConEstado);

      const initialIndexes = {};
      props.accesorios.forEach((accesorio) => {
        if (accesorio && accesorio.id) {
          initialIndexes[accesorio.id] = 0;
        }
      });
      setSlideIndexes(initialIndexes);

      if (accesoriosConEstado.length > 0) {
        setSelectedProduct(accesoriosConEstado[0]);
      }
    } else {
      setAccesorios([]);
    }
  }, [props.accesorios, applySoldStatus]);

  if (!accesorios || accesorios.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-xl font-light">
            No hay productos disponibles
          </p>
          <p className="text-gray-500 mt-2">
            Vuelve más tarde para ver nuestras novedades
          </p>
        </div>
      </div>
    );
  }

  const nextSlide = (accesorioId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const accesorio = accesorios.find((item) => item && item.id === accesorioId);
    if (!accesorio || !Array.isArray(accesorio.images)) return;

    const totalSlides = accesorio.images.length;
    if (totalSlides <= 1) return;

    setSlideIndexes((prev) => ({
      ...prev,
      [accesorioId]: ((prev[accesorioId] || 0) + 1) % totalSlides,
    }));
  };

  const prevSlide = (accesorioId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const accesorio = accesorios.find((item) => item && item.id === accesorioId);
    if (!accesorio || !Array.isArray(accesorio.images)) return;

    const totalSlides = accesorio.images.length;
    if (totalSlides <= 1) return;

    setSlideIndexes((prev) => ({
      ...prev,
      [accesorioId]: ((prev[accesorioId] || 0) - 1 + totalSlides) % totalSlides,
    }));
  };

  const handleExpandImage = (images, index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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

  const normalizeImages = (images) => {
    if (!images) return ["/placeholder.jpg"];
    if (typeof images === "string") return [images];
    return images;
  };

  const formatPrice = (price) => {
    if (!price) return "$0";
    const numericPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^\d.-]/g, ""))
        : price;
    return `$${numericPrice.toLocaleString("es-CO")}`;
  };

  const handleImageError = (accesorioId, imageIndex) => {
    setImageErrors((prev) => ({
      ...prev,
      [`${accesorioId}-${imageIndex}`]: true,
    }));
  };

  const handleToggleSold = (productId, isVendido, customStyles) => {
    toggleSoldStatus(productId, isVendido, customStyles);

    setAccesorios((prev) =>
      prev.map((accesorio) => {
        if (accesorio.id === productId) {
          return {
            ...accesorio,
            vendido: isVendido,
            estilos: isVendido ? customStyles : null,
          };
        }
        return accesorio;
      })
    );

    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) => ({
        ...prev,
        vendido: isVendido,
        estilos: isVendido ? customStyles : null,
      }));
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Nuestros Productos
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4">Descubre nuestra selección exclusiva</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {accesorios.map((accesorio, index) => {
            if (!accesorio) return null;

            const images = normalizeImages(accesorio.images || accesorio.imagenes);
            const currentImageIndex = slideIndexes[accesorio.id] || 0;

            return (
              <div
                key={accesorio.id || index}
                className={`group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  accesorio.vendido ? "opacity-70" : ""
                } ${
                  selectedProduct && selectedProduct.id === accesorio.id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedProduct(accesorio)}
              >
                {/* Badge de VENDIDO */}
                {accesorio.vendido && (
                  <div className="absolute top-4 right-4 z-20 bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transform rotate-12">
                    VENDIDO
                  </div>
                )}

                {/* Galería de imágenes */}
                <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {/* Imágenes */}
                  <div className="relative w-full h-full">
                    {images.map((img, idx) => {
                      const imageErrorKey = `${accesorio.id}-${idx}`;
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
                              <span className="text-gray-500">Error cargando imagen</span>
                            </div>
                          ) : (
                            <Image
                              src={img || "/images/placeholder.png"}
                              alt={accesorio.title || accesorio.nombre || "Producto"}
                              fill
                              className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              priority={false}
                              loading="lazy"
                              quality={85}
                              onError={() => handleImageError(accesorio.id || index, idx)}
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
                    <Maximize2 size={18} className="text-gray-700" />
                  </button>

                  {/* Controles de navegación */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => prevSlide(accesorio.id, e)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all z-30 opacity-0 group-hover:opacity-100"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={(e) => nextSlide(accesorio.id, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all z-30 opacity-0 group-hover:opacity-100"
                        aria-label="Siguiente imagen"
                      >
                        <ChevronRight size={24} />
                      </button>

                      {/* Indicadores de posición */}
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSlideIndexes(prev => ({...prev, [accesorio.id]: idx}));
                            }}
                            className={`transition-all rounded-full ${
                              idx === currentImageIndex
                                ? "bg-white w-8 h-2"
                                : "bg-white/50 w-2 h-2 hover:bg-white/70"
                            }`}
                            aria-label={`Ir a imagen ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {accesorio.title || accesorio.nombre || "Sin título"}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {accesorio.description || accesorio.descripcion || "Sin descripción"}
                  </p>

                  {/* Precio y stock */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(accesorio.price || accesorio.precio)}
                      </span>
                      {accesorio.cantidad && (
                        <p className="text-xs text-gray-500 mt-1">
                          Stock: {accesorio.cantidad}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <Link
                      href={buildProductUrl(
                        categorySlug,
                        generateProductSlug(accesorio),
                        accesorio
                      )}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye size={18} />
                      <span>Ver más</span>
                    </Link>

                    <button
                      className={`p-3 rounded-xl transition-colors ${
                        accesorio.vendido || (accesorio.stock !== undefined && accesorio.stock === 0)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                      disabled={accesorio.vendido || (accesorio.stock !== undefined && accesorio.stock === 0)}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!accesorio.vendido) {
                          await addToCart({
                            id: accesorio.id,
                            nombre: accesorio.title || accesorio.nombre,
                            precio: parseFloat((accesorio.price || accesorio.precio).toString().replace(/[^\d.-]/g, '')),
                            imagen: (accesorio.images || accesorio.imagenes || ['/placeholder.jpg'])[0],
                            categoria: categorySlug
                          }, 1, null);
                        }
                      }}
                      aria-label="Agregar al carrito"
                      title={(accesorio.stock !== undefined && accesorio.stock === 0) ? "Sin stock" : "Agregar al carrito"}
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
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
              src={expandedImage[expandedImageIndex] || "/images/placeholder.png"}
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

      {/* Panel de administrador */}
      {selectedProduct && (
        <SoldMarker
          producto={selectedProduct}
          onToggleSold={handleToggleSold}
          showAdmin={true}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
      `}</style>
    </>
  );
};

export default ModernProductGrid;
