"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Phone, Clock, ExternalLink, ArrowLeft,
  ShoppingCart, Search, Filter, Star, Heart,
  TrendingUp, Package, Tag, ChevronRight, ChevronLeft,
  Sparkles, Gift, Zap, AlertCircle
} from "lucide-react";

// Base de datos simulada de negocios
const businessDatabase = {
  "tienda-local": {
    id: "tienda-local",
    name: "Tienda Local",
    description:
      "Tienda de abarrotes y productos básicos del barrio. Encuentra todo lo que necesitas para tu hogar.",
    image:
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
    address: "Calle 15 #23-45, Barrio Centro",
    phone: "+57 3174503604",
    hours: "Lunes a Sábado: 6:00 AM - 8:00 PM",
    whatsapp: "573174503604",
    services: [
      "Abarrotes y granos",
      "Productos de aseo",
      "Bebidas frías",
      "Servicio a domicilio",
    ],
    coordinates: { lat: 4.6097, lng: -74.0817 },
  },
  "panaderia-el-trigal": {
    id: "panaderia-el-trigal",
    name: "Panadería El Trigal",
    description:
      "Pan fresco todos los días. Especialistas en productos de panadería artesanal y pastelería.",
    image:
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
    address: "Carrera 10 #18-32, Barrio San José",
    phone: "+57 3174503604",
    hours: "Todos los días: 5:00 AM - 7:00 PM",
    whatsapp: "573174503604",
    services: [
      "Pan fresco diario",
      "Tortas personalizadas",
      "Productos de pastelería",
      "Desayunos completos",
    ],
    coordinates: { lat: 4.615, lng: -74.09 },
  },
  "ferreteria-martinez": {
    id: "ferreteria-martinez",
    name: "Ferretería Martínez",
    description:
      "Todo para construcción y reparaciones del hogar. Más de 20 años sirviendo a la comunidad.",
    image:
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
    address: "Avenida Principal #45-67, Sector Industrial",
    phone: "+57 3174503604",
    hours: "Lunes a Viernes: 7:00 AM - 6:00 PM, Sábados: 7:00 AM - 4:00 PM",
    whatsapp: "573174503604",
    services: [
      "Materiales de construcción",
      "Herramientas eléctricas",
      "Plomería y electricidad",
      "Asesoría técnica",
    ],
    coordinates: { lat: 4.62, lng: -74.095 },
  },
};

// Componente de Producto Individual
function ProductCard({ product, onAddToCart }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasDiscount = product.precioAnterior && product.precioAnterior > product.precio;
  const discountPercent = hasDiscount
    ? Math.round(((product.precioAnterior - product.precio) / product.precioAnterior) * 100)
    : 0;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
        {hasDiscount && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />
            -{discountPercent}%
          </span>
        )}
        {product.destacado && (
          <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Destacado
          </span>
        )}
        {!product.disponible && (
          <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Agotado
          </span>
        )}
      </div>

      {/* Botón de favorito */}
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:scale-110 transition-transform"
      >
        <Heart
          className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
        />
      </button>

      {/* Imagen del producto */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {!imageError && product.imagenPrincipal ? (
          <Image
            src={product.imagenPrincipal}
            alt={product.nombre}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        {/* Marca y categoría */}
        {product.marca && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.marca}</p>
        )}

        {/* Nombre del producto */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[40px]">
          {product.nombre}
        </h3>

        {/* Precio */}
        <div className="mb-3">
          {hasDiscount && (
            <p className="text-xs text-gray-500 line-through mb-1">
              {formatPrice(product.precioAnterior)}
            </p>
          )}
          <p className="text-xl font-bold text-primary">
            {formatPrice(product.precio)}
          </p>
        </div>

        {/* Stock */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-500 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            ¡Solo quedan {product.stock}!
          </p>
        )}

        {/* Botón de agregar al carrito */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.disponible}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            product.disponible
              ? 'bg-primary hover:bg-primary-dark text-white'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.disponible ? 'Agregar al carrito' : 'No disponible'}
        </button>
      </div>
    </div>
  );
}

// Componente de Carrusel
function ProductCarousel({ title, products, icon: Icon, onAddToCart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 768) setItemsPerView(2);
      else if (window.innerWidth < 1024) setItemsPerView(3);
      else setItemsPerView(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          {Icon && <Icon className="w-8 h-8 text-primary" />}
          {title}
        </h2>

        {products.length > itemsPerView && (
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out gap-4"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
            >
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente de Categoría
function CategoryCard({ category, count, onClick }) {
  const categoryIcons = {
    'accesorios': '📱',
    'celulares': '📱',
    'computadoras': '💻',
    'libros-nuevos': '📚',
    'libros-usados': '📖',
    'generales': '🛍️',
    'damas': '👗',
    'caballeros': '👔',
    'electronica': '⚡',
    'hogar': '🏠',
    'deportes': '⚽',
    'juguetes': '🎮',
  };

  const icon = categoryIcons[category] || '📦';

  return (
    <button
      onClick={onClick}
      className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 text-center">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="font-bold text-gray-900 dark:text-white capitalize mb-1">
          {category.replace(/-/g, ' ')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {count} productos
        </p>
      </div>
    </button>
  );
}

export default function BusinessPage() {
  const params = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const businessId = params.id;
    const businessData = businessDatabase[businessId];

    if (businessData) {
      setBusiness(businessData);
    }

    // Cargar productos desde la base de datos
    fetchProducts();
  }, [params.id]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();

      if (data.productos) {
        setProducts(data.productos);

        // Obtener categorías únicas con conteo
        const categoryCount = {};
        data.productos.forEach(product => {
          categoryCount[product.categoria] = (categoryCount[product.categoria] || 0) + 1;
        });

        const categoriesArray = Object.entries(categoryCount).map(([name, count]) => ({
          name,
          count
        }));

        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // Aquí iría la lógica para agregar al carrito
    alert(`${product.nombre} agregado al carrito`);
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Productos destacados
  const featuredProducts = products.filter(p => p.destacado).slice(0, 8);

  // Productos con descuento
  const discountedProducts = products.filter(p => p.precioAnterior && p.precioAnterior > p.precio).slice(0, 8);

  // Productos más nuevos
  const newProducts = [...products].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 8);

  if (loading) {
    return (
      <main className="min-h-screen py-14">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando tienda...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Negocio no encontrado</h1>
          <p className="text-gray-600 mb-4">
            El negocio que buscas no existe o ha sido eliminado.
          </p>
          <Link
            href="/"
            className="inline-flex items-center bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Hola, vi su negocio "${business.name}" en NeuraIdev y me gustaría obtener más información.`)}`;

  return (
    <main className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navegación de regreso */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        {/* Header del negocio - Banner principal */}
        <div className="bg-gradient-to-r from-primary/90 to-secondary/90 rounded-2xl shadow-2xl overflow-hidden mb-8 relative">
          <div className="absolute inset-0 opacity-10">
            <Image
              src={business.image}
              alt={business.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10 px-8 py-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3">
                  <Sparkles className="w-10 h-10" />
                  {business.name}
                </h1>
                <p className="text-lg md:text-xl opacity-90 mb-4">
                  {business.description}
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {business.hours}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {business.address}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`tel:${business.phone}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  Llamar
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Categorías</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === cat.name
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat.name.replace(/-/g, ' ')} ({cat.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sección de Categorías */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              Explora por categoría
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.name}
                  category={cat.name}
                  count={cat.count}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setShowFilters(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ofertas especiales */}
        {discountedProducts.length > 0 && (
          <ProductCarousel
            title="🔥 Ofertas Especiales"
            products={discountedProducts}
            icon={Tag}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Productos destacados */}
        {featuredProducts.length > 0 && (
          <ProductCarousel
            title="⭐ Productos Destacados"
            products={featuredProducts}
            icon={Star}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Productos nuevos */}
        {newProducts.length > 0 && (
          <ProductCarousel
            title="🆕 Recién Llegados"
            products={newProducts}
            icon={Sparkles}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Grid de todos los productos */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            {selectedCategory === 'all' ? 'Todos los productos' : `Categoría: ${selectedCategory.replace(/-/g, ' ')}`}
            <span className="text-lg text-gray-500 dark:text-gray-400">
              ({filteredProducts.length})
            </span>
          </h2>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No se encontraron productos
              </p>
            </div>
          )}
        </div>

        {/* Banner de información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <Gift className="w-12 h-12 mb-3" />
            <h3 className="text-xl font-bold mb-2">Envío Gratis</h3>
            <p className="text-sm opacity-90">En compras superiores a $50.000</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <Zap className="w-12 h-12 mb-3" />
            <h3 className="text-xl font-bold mb-2">Entrega Rápida</h3>
            <p className="text-sm opacity-90">Recibe tu pedido en 24-48 horas</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <Star className="w-12 h-12 mb-3" />
            <h3 className="text-xl font-bold mb-2">Calidad Garantizada</h3>
            <p className="text-sm opacity-90">Productos de la mejor calidad</p>
          </div>
        </div>
      </div>
    </main>
  );
}
