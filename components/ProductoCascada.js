// archivo para modificar tarjeta de productos

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useSoldProducts } from "../hooks/useSoldProducts";
import { generateProductSlug, buildProductUrl } from "../utils/slugify";
import { useCart } from "../context/CartContext";
import { useToast } from "../contexts/ToastContext";

export default function ProductoCascada({
  productos,
  categorySlug = "generales",
}) {
  const [slideIndexes, setSlideIndexes] = useState({});
  const [imageErrors, setImageErrors] = useState({});
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

    if (!images)
      return ["https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"];
    if (typeof images === "string") return [images];
    if (Array.isArray(images)) {
      const normalized = images.map((img) => {
        if (typeof img === "object" && img.url) {
          return img.url;
        }
        return img;
      });
      return normalized.length > 0
        ? normalized
        : ["https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"];
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

  return (
    <>
      <div className="w-full px-4 py-8">
        {/* Grid de productos - tamaño uniforme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {productosConEstado.map((producto, index) => {
            if (!producto) return null;

            const images = normalizeImages(
              producto.images || producto.imagenes,
              producto,
            );
            const currentImageIndex = slideIndexes[producto.id] || 0;
            const isOutOfStock =
              producto.vendido ||
              producto.stock === 0 ||
              producto.cantidad === 0;

            return (
              <Link
                key={producto.id || index}
                href={buildProductUrl(
                  categorySlug,
                  generateProductSlug(producto),
                  producto,
                )}
                className={`group relative rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 block ${
                  isOutOfStock ? "opacity-70" : ""
                }`}
                style={{ height: "400px" }}
              >
                {/* Imagen de fondo con overlay */}
                <div className="absolute inset-0 w-full h-full">
                  {images.map((img, idx) => {
                    const imageErrorKey = `${producto.id}-${idx}`;
                    const hasImageError = imageErrors[imageErrorKey];

                    return (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          idx === currentImageIndex
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        {hasImageError ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-500 text-sm">
                              Error cargando imagen
                            </span>
                          </div>
                        ) : (
                          <Image
                            src={
                              img ||
                              "https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"
                            }
                            alt={
                              producto.title || producto.nombre || "Producto"
                            }
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            priority={false}
                            loading="lazy"
                            quality={85}
                            onError={() =>
                              handleImageError(producto.id || index, idx)
                            }
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Overlay gradient para mejor legibilidad del texto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </div>

                {/* Botón de carrito superior derecho */}
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isOutOfStock) return;

                    const success = await addToCart(producto, 1);
                    if (success) {
                      toast.success(
                        `"${producto.nombre || producto.title}" agregado al carrito`,
                        {
                          title: "✅ Producto Agregado",
                          duration: 3000,
                        },
                      );
                    }
                  }}
                  className={`absolute top-2 right-2 md:top-4 md:right-4 z-50 p-2.5 md:p-3 rounded-full shadow-lg transition-all backdrop-blur-sm border-2 border-white/30 ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-90"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-110"
                  }`}
                  disabled={isOutOfStock}
                  aria-label={
                    isOutOfStock ? "Producto agotado" : "Agregar al carrito"
                  }
                  title={
                    isOutOfStock ? "Producto agotado" : "Agregar al carrito"
                  }
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

                {/* Controles de navegación de imágenes */}
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
                    <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5 z-20">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSlideIndexes((prev) => ({
                              ...prev,
                              [producto.id]: idx,
                            }));
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

                {/* Información del producto - Posicionada en la parte inferior */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  {/* Título con fondo oscuro difuminado */}
                  <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg mb-2">
                    <h3 className="text-lg font-bold text-white line-clamp-2">
                      {producto.title || producto.nombre || "Sin título"}
                    </h3>
                  </div>

                  {/* Precio */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                      {formatPrice(producto.price || producto.precio)}
                    </span>
                    {producto.cantidad && (
                      <p className="text-xs text-white/90 bg-black/30 px-2 py-1 rounded-full">
                        Stock: {producto.cantidad}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

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
