"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  ShoppingCart,
  Search,
  Filter,
  Star,
  Heart,
  TrendingUp,
  Package,
  Tag,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Gift,
  Zap,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
  Building2,
} from "lucide-react";

// Productos de ejemplo para cada negocio
const businessProducts = {
  "tienda-local": [
    // Productos de Mercado
    { id: "tl-001", nombre: "Arroz Diana x 500g", categoria: "mercado", precio: 3500, stock: 50, descripcion: "Arroz blanco premium", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, marca: "Diana", createdAt: "2024-01-15" },
    { id: "tl-002", nombre: "Aceite Gourmet x 900ml", categoria: "mercado", precio: 12500, precioAnterior: 15000, stock: 30, descripcion: "Aceite vegetal premium", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, marca: "Gourmet", createdAt: "2024-01-16" },
    { id: "tl-003", nombre: "Pasta Doria x 250g", categoria: "mercado", precio: 2800, stock: 100, descripcion: "Pasta espaguetti", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Doria", createdAt: "2024-01-17" },
    { id: "tl-004", nombre: "Leche Colanta x 1L", categoria: "lacteos", precio: 4200, stock: 40, descripcion: "Leche entera pasteurizada", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Colanta", createdAt: "2024-01-18" },
    { id: "tl-005", nombre: "Huevos AA x 30 unidades", categoria: "mercado", precio: 18500, stock: 25, descripcion: "Huevos frescos tamaño AA", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, createdAt: "2024-01-19" },

    // Productos de Aseo
    { id: "tl-006", nombre: "Jabón en Polvo Ariel x 500g", categoria: "aseo", precio: 8900, precioAnterior: 10500, stock: 45, descripcion: "Detergente en polvo concentrado", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, marca: "Ariel", createdAt: "2024-01-20" },
    { id: "tl-007", nombre: "Suavizante Suavitel x 900ml", categoria: "aseo", precio: 7500, stock: 35, descripcion: "Suavizante de ropa aroma primavera", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Suavitel", createdAt: "2024-01-21" },
    { id: "tl-008", nombre: "Papel Higiénico Familia x 12 rollos", categoria: "aseo", precio: 15900, stock: 60, descripcion: "Papel higiénico triple hoja", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Familia", createdAt: "2024-01-22" },

    // Mecato y Dulces
    { id: "tl-009", nombre: "Papas Margarita x 150g", categoria: "mecato", precio: 3200, stock: 80, descripcion: "Papas fritas sabor natural", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Margarita", createdAt: "2024-01-23" },
    { id: "tl-010", nombre: "Chocolatina Jet x 35g", categoria: "dulces", precio: 1500, precioAnterior: 2000, stock: 120, descripcion: "Chocolate con leche", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, marca: "Jet", createdAt: "2024-01-24" },
    { id: "tl-011", nombre: "Galletas Festival x 200g", categoria: "mecato", precio: 4500, stock: 55, descripcion: "Galletas con chips de chocolate", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Festival", createdAt: "2024-01-25" },

    // Bebidas
    { id: "tl-012", nombre: "Gaseosa Coca-Cola x 1.5L", categoria: "bebidas", precio: 5800, stock: 70, descripcion: "Bebida gaseosa sabor original", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Coca-Cola", createdAt: "2024-01-26" },
    { id: "tl-013", nombre: "Jugo Hit Mora x 200ml", categoria: "bebidas", precio: 2100, stock: 90, descripcion: "Jugo de mora", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Hit", createdAt: "2024-01-27" },

    // Cuidado Personal
    { id: "tl-014", nombre: "Shampoo Sedal x 350ml", categoria: "cuidado-personal", precio: 11900, stock: 40, descripcion: "Shampoo hidratación instantánea", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Sedal", createdAt: "2024-01-28" },
    { id: "tl-015", nombre: "Crema Dental Colgate x 100ml", categoria: "cuidado-personal", precio: 6500, precioAnterior: 7500, stock: 65, descripcion: "Pasta dental triple acción", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, marca: "Colgate", createdAt: "2024-01-29" },

    // Productos con bajo stock
    { id: "tl-016", nombre: "Pan Tajado Bimbo x 450g", categoria: "panaderia", precio: 5200, stock: 3, descripcion: "Pan de molde blanco", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, marca: "Bimbo", createdAt: "2024-01-30" },
  ],
  "panaderia-el-trigal": [
    // Panes
    { id: "pt-001", nombre: "Pan Francés", categoria: "panaderia", precio: 500, stock: 150, descripcion: "Pan recién horneado, crujiente por fuera", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, createdAt: "2024-01-15" },
    { id: "pt-002", nombre: "Pan Integral", categoria: "panaderia", precio: 800, stock: 80, descripcion: "Pan integral con semillas", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, createdAt: "2024-01-16" },
    { id: "pt-003", nombre: "Pan de Queso", categoria: "panaderia", precio: 1200, stock: 100, descripcion: "Pan artesanal relleno de queso", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, createdAt: "2024-01-17" },
    { id: "pt-004", nombre: "Pan de Aguacate", categoria: "panaderia", precio: 1500, precioAnterior: 1800, stock: 60, descripcion: "Pan especial con aguacate", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, createdAt: "2024-01-18" },

    // Tortas
    { id: "pt-005", nombre: "Torta de Chocolate", categoria: "tortas", precio: 35000, stock: 5, descripcion: "Torta de chocolate para 8 personas", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, createdAt: "2024-01-19" },
    { id: "pt-006", nombre: "Torta de Vainilla", categoria: "tortas", precio: 32000, stock: 4, descripcion: "Torta de vainilla con crema", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, createdAt: "2024-01-20" },
    { id: "pt-007", nombre: "Torta Personalizada", categoria: "tortas", precio: 85000, precioAnterior: 100000, stock: 2, descripcion: "Torta personalizada para 15 personas", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, createdAt: "2024-01-21" },

    // Pastelería
    { id: "pt-008", nombre: "Croissant", categoria: "pasteleria", precio: 2500, stock: 45, descripcion: "Croissant de mantequilla", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, createdAt: "2024-01-22" },
    { id: "pt-009", nombre: "Donas Glaseadas x 6", categoria: "pasteleria", precio: 8500, stock: 30, descripcion: "Paquete de 6 donas glaseadas", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, createdAt: "2024-01-23" },
    { id: "pt-010", nombre: "Rollos de Canela x 4", categoria: "pasteleria", precio: 7000, precioAnterior: 8500, stock: 25, descripcion: "Rollos de canela frescos", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, createdAt: "2024-01-24" },

    // Desayunos
    { id: "pt-011", nombre: "Desayuno Completo", categoria: "desayunos", precio: 12000, stock: 20, descripcion: "Incluye pan, huevos, café y jugo", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, createdAt: "2024-01-25" },
    { id: "pt-012", nombre: "Combo Café + Croissant", categoria: "desayunos", precio: 5500, stock: 50, descripcion: "Café caliente con croissant", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, createdAt: "2024-01-26" },
  ],
  "ferreteria-martinez": [
    // Herramientas
    { id: "fm-001", nombre: "Taladro Eléctrico Black & Decker", categoria: "herramientas", precio: 185000, precioAnterior: 220000, stock: 8, descripcion: "Taladro percutor 550W con accesorios", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, destacado: true, marca: "Black & Decker", createdAt: "2024-01-15" },
    { id: "fm-002", nombre: "Martillo de Carpintero", categoria: "herramientas", precio: 25000, stock: 30, descripcion: "Martillo 16 oz con mango de fibra", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, createdAt: "2024-01-16" },
    { id: "fm-003", nombre: "Destornilladores Set x 6", categoria: "herramientas", precio: 35000, stock: 20, descripcion: "Set de destornilladores profesionales", imagenPrincipal: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png", disponible: true, createdAt: "2024-01-17" },
  ],
};

// Base de datos simulada de negocios
const businessDatabase = {
  "tienda-local": {
    id: "tienda-local",
    name: "Tienda Local - Tu Súper Completo",
    description:
      "La tienda más completa del sector. Miles de productos en un solo lugar: mercado, aseo, mecato, tecnología, ropa y mucho más. Tu aliado de confianza para todas las necesidades del hogar y la familia.",
    image:
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png",
    address: "Calle 15 #23-45, Barrio Centro",
    phone: "+57 3174503604",
    hours: "Lunes a Domingo: 6:00 AM - 10:00 PM",
    whatsapp: "573174503604",
    services: [
      "🛒 Mercado completo: Frutas, verduras, carnes, lácteos, panadería",
      "🧼 Productos de aseo: Para el hogar, cuidado personal y lavandería",
      "🍬 Mecato y dulces: Snacks, galletas, chocolates y golosinas",
      "📱 Tecnología y accesorios: Celulares, computadoras, gadgets",
      "👗 Ropa y calzado: Para toda la familia, damas, caballeros y niños",
      "📚 Librería y papelería: Libros, útiles escolares, material de oficina",
      "🏠 Artículos para el hogar: Decoración, cocina, organización",
      "⚽ Deportes y juguetes: Equipos deportivos, juegos y entretenimiento",
      "💄 Belleza y cosméticos: Maquillaje, cuidado de la piel, perfumería",
      "🔧 Ferretería básica: Herramientas y elementos para el hogar",
      "🎉 Fiestas y celebraciones: Decoración, piñatería, regalos",
      "🚚 Domicilios GRATIS en compras superiores a $50.000",
      "💳 Aceptamos todas las formas de pago: Efectivo, tarjetas, transferencias",
      "⚡ Entregas rápidas en 24-48 horas",
      "📦 Programa de puntos y descuentos para clientes frecuentes",
      "🎁 Promociones y ofertas semanales",
    ],
    coordinates: { lat: 4.6097, lng: -74.0817 },
    products: businessProducts["tienda-local"],
    // Configuración de métodos de pago
    paymentMethods: {
      nequi: {
        enabled: true,
        phoneNumber: "3174503604",
        accountName: "Tienda Local",
        // Opcional: Si el negocio tiene un QR estático de Nequi, puede ponerlo aquí
        qrImageUrl: null,
      },
      cash: {
        enabled: true,
        description: "Pago en efectivo al recibir tu pedido",
      },
      bankTransfer: {
        enabled: true,
        bankName: "Bancolombia",
        accountType: "Ahorros",
        accountNumber: "12345678901",
        accountName: "Tienda Local SAS",
      },
    },
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
      "🥖 Pan fresco diario: Variedad de panes artesanales recién horneados",
      "🎂 Tortas personalizadas: Diseños únicos para tus celebraciones",
      "🥐 Productos de pastelería: Croissants, donas, pasteles y más",
      "☕ Desayunos completos: Combos especiales para comenzar tu día",
      "🍰 Repostería fina: Postres elaborados con ingredientes premium",
      "🎉 Eventos especiales: Catering para cumpleaños, bodas y más",
    ],
    coordinates: { lat: 4.615, lng: -74.09 },
    products: businessProducts["panaderia-el-trigal"],
    paymentMethods: {
      nequi: {
        enabled: true,
        phoneNumber: "3174503604",
        accountName: "Panadería El Trigal",
        qrImageUrl: null,
      },
      cash: {
        enabled: true,
        description: "Pago en efectivo en tienda o al recibir",
      },
    },
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
      "🏗️ Materiales de construcción: Cemento, arena, ladrillos y más",
      "🔌 Herramientas eléctricas: Taladros, sierras, amoladoras de marca",
      "🚿 Plomería y electricidad: Tubería, cables, accesorios completos",
      "🔧 Asesoría técnica: Te ayudamos a elegir lo que necesitas",
      "🎨 Pinturas y acabados: Variedad de colores y marcas",
      "🔩 Ferretería en general: Tornillos, clavos, pegantes y más",
    ],
    coordinates: { lat: 4.62, lng: -74.095 },
    products: businessProducts["ferreteria-martinez"],
    paymentMethods: {
      nequi: {
        enabled: true,
        phoneNumber: "3174503604",
        accountName: "Ferretería Martínez",
        qrImageUrl: null,
      },
      cash: {
        enabled: true,
        description: "Pago en efectivo en tienda",
      },
      bankTransfer: {
        enabled: true,
        bankName: "Davivienda",
        accountType: "Corriente",
        accountNumber: "98765432101",
        accountName: "Ferretería Martínez LTDA",
      },
    },
  },
};

// Componente Modal de Checkout
function CheckoutModal({ isOpen, onClose, product, business }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalAmount = product.precio * quantity;
  const paymentMethods = business?.paymentMethods || {};

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handlePayWithNequi = () => {
    const amount = totalAmount;
    const phoneNumber = paymentMethods.nequi?.phoneNumber;

    // Intentar abrir la app de Nequi con deep link
    // Formato: nequi://send?phoneNumber=3XXXXXXXXX&amount=XXXX&concept=texto
    const deepLink = `nequi://send?phoneNumber=${phoneNumber}&amount=${amount}&concept=${encodeURIComponent(product.nombre)}`;

    // Crear el mensaje de instrucciones
    const instructions = `
💜 Pago con Nequi

Monto: ${formatPrice(amount)}
Para: ${paymentMethods.nequi.accountName}
Nequi: ${phoneNumber}
Concepto: ${product.nombre} (${quantity} unidades)

Opciones de pago:
1️⃣ Click en "Abrir Nequi" para pagar desde la app
2️⃣ O envía el pago manualmente desde tu app Nequi

¡Envía el comprobante por WhatsApp!
    `.trim();

    if (confirm(instructions + "\n\n¿Abrir app de Nequi ahora?")) {
      // Intentar abrir la app de Nequi
      window.location.href = deepLink;

      // Fallback: Si no abre, mostrar alternativas después de 2 segundos
      setTimeout(() => {
        alert(`Si la app no se abrió, transfiere manualmente:\n\n💜 Nequi: ${phoneNumber}\n💰 Monto: ${formatPrice(amount)}\n📝 Concepto: ${product.nombre}`);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Finalizar Compra
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Producto */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {product.nombre}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {product.descripcion}
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(product.precio)}
                </p>
              </div>
            </div>

            {/* Cantidad */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cantidad:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                Stock: {product.stock}
              </span>
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total:
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Selecciona tu método de pago
            </h3>

            <div className="space-y-3">
              {/* Nequi */}
              {paymentMethods.nequi?.enabled && (
                <button
                  onClick={() => handlePaymentMethodSelect("nequi")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPaymentMethod === "nequi"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-7 h-7 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Pagar con Nequi
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Pago instantáneo desde tu app Nequi
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        {paymentMethods.nequi.accountName} •{" "}
                        {paymentMethods.nequi.phoneNumber}
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Efectivo */}
              {paymentMethods.cash?.enabled && (
                <button
                  onClick={() => handlePaymentMethodSelect("cash")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPaymentMethod === "cash"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Banknote className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Pago en Efectivo
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {paymentMethods.cash.description}
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Transferencia Bancaria */}
              {paymentMethods.bankTransfer?.enabled && (
                <button
                  onClick={() => handlePaymentMethodSelect("bankTransfer")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPaymentMethod === "bankTransfer"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Transferencia Bancaria
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {paymentMethods.bankTransfer.bankName} •{" "}
                        {paymentMethods.bankTransfer.accountType}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {paymentMethods.bankTransfer.accountNumber}
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Botón de Pago */}
          {selectedPaymentMethod && (
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4 border-t border-gray-200 dark:border-gray-700 -mx-6 px-6 -mb-6 pb-6">
              {selectedPaymentMethod === "nequi" && (
                <div className="space-y-3">
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      Instrucciones de pago con Nequi
                    </h4>

                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          1
                        </div>
                        <p>Abre tu app de <span className="font-semibold text-purple-600 dark:text-purple-400">Nequi</span></p>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          2
                        </div>
                        <p>Selecciona <span className="font-semibold">"Enviar plata"</span> o <span className="font-semibold">"Enviar dinero"</span></p>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          3
                        </div>
                        <div className="flex-1">
                          <p className="mb-1">Ingresa los siguientes datos:</p>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-1 text-xs border border-purple-200 dark:border-purple-700">
                            <p>📱 <span className="font-medium">Número:</span> <span className="font-bold text-purple-600 dark:text-purple-400">{paymentMethods.nequi.phoneNumber}</span></p>
                            <p>💰 <span className="font-medium">Monto:</span> <span className="font-bold text-purple-600 dark:text-purple-400">{formatPrice(totalAmount)}</span></p>
                            <p>👤 <span className="font-medium">Destinatario:</span> {paymentMethods.nequi.accountName}</p>
                            <p>📝 <span className="font-medium">Concepto:</span> {product.nombre}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          4
                        </div>
                        <p>Confirma el pago y envía el comprobante al WhatsApp del negocio</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePayWithNequi}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                    Abrir Nequi para Pagar {formatPrice(totalAmount)}
                  </button>
                </div>
              )}

              {selectedPaymentMethod === "cash" && (
                <div className="space-y-3">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Tu pedido quedará registrado. Paga en efectivo al recibirlo.
                    </p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      Total a pagar: {formatPrice(totalAmount)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      alert("Pedido registrado! El negocio se contactará contigo.");
                      onClose();
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              )}

              {selectedPaymentMethod === "bankTransfer" && (
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      Datos para transferencia:
                    </p>
                    <div className="space-y-1 text-gray-700 dark:text-gray-300">
                      <p>
                        <span className="font-medium">Banco:</span>{" "}
                        {paymentMethods.bankTransfer.bankName}
                      </p>
                      <p>
                        <span className="font-medium">Tipo:</span>{" "}
                        {paymentMethods.bankTransfer.accountType}
                      </p>
                      <p>
                        <span className="font-medium">Cuenta:</span>{" "}
                        {paymentMethods.bankTransfer.accountNumber}
                      </p>
                      <p>
                        <span className="font-medium">Titular:</span>{" "}
                        {paymentMethods.bankTransfer.accountName}
                      </p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                        Monto: {formatPrice(totalAmount)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      alert("Realiza la transferencia y envía el comprobante al WhatsApp del negocio.");
                      onClose();
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de Producto Individual
function ProductCard({ product, onAddToCart }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasDiscount =
    product.precioAnterior && product.precioAnterior > product.precio;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.precioAnterior - product.precio) / product.precioAnterior) *
          100,
      )
    : 0;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
        {hasDiscount && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />-{discountPercent}%
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
          className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {product.marca}
          </p>
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
              ? "bg-primary hover:bg-primary-dark text-white"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.disponible ? "Agregar al carrito" : "No disponible"}
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
              style={{
                width: `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) * 16) / itemsPerView}px)`,
              }}
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
    accesorios: "📱",
    celulares: "📱",
    computadoras: "💻",
    "libros-nuevos": "📚",
    "libros-usados": "📖",
    generales: "🛍️",
    damas: "👗",
    caballeros: "👔",
    electronica: "⚡",
    hogar: "🏠",
    deportes: "⚽",
    juguetes: "🎮",
    aseo: "🧼",
    mercado: "🛒",
    mecato: "🍬",
    belleza: "💄",
    tecnologia: "💻",
    ropa: "👕",
    calzado: "👟",
    alimentos: "🍎",
    bebidas: "🥤",
    lacteos: "🥛",
    carnes: "🥩",
    frutas: "🍓",
    verduras: "🥬",
    panaderia: "🥖",
    dulces: "🍭",
    snacks: "🍿",
    limpieza: "🧹",
    "cuidado-personal": "🧴",
    papeleria: "✏️",
    ferreteria: "🔧",
    decoracion: "🎨",
    cocina: "🍳",
    bebe: "👶",
    mascotas: "🐾",
    salud: "💊",
    fitness: "💪",
    musica: "🎵",
    jardineria: "🌱",
    automotriz: "🚗",
    oficina: "📎",
    fiestas: "🎉",
  };

  const icon = categoryIcons[category] || "📦";

  return (
    <button
      onClick={onClick}
      className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 text-center">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="font-bold text-gray-900 dark:text-white capitalize mb-1">
          {category.replace(/-/g, " ")}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState({
    isOpen: false,
    product: null,
  });

  useEffect(() => {
    const businessId = params.id;
    const businessData = businessDatabase[businessId];

    if (businessData) {
      setBusiness(businessData);
      // Cargar productos del negocio
      loadProducts(businessData);
    } else {
      setLoading(false);
    }
  }, [params.id]);

  const loadProducts = (businessData) => {
    try {
      // Usar productos del negocio si existen
      if (businessData.products && businessData.products.length > 0) {
        setProducts(businessData.products);

        // Obtener categorías únicas con conteo
        const categoryCount = {};
        businessData.products.forEach((product) => {
          categoryCount[product.categoria] =
            (categoryCount[product.categoria] || 0) + 1;
        });

        const categoriesArray = Object.entries(categoryCount).map(
          ([name, count]) => ({
            name,
            count,
          }),
        );

        setCategories(categoriesArray);
        setLoading(false);
      } else {
        // Fallback: intentar cargar desde la API si no hay productos en el negocio
        fetchProductsFromAPI();
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setLoading(false);
    }
  };

  const fetchProductsFromAPI = async () => {
    try {
      const response = await fetch("/api/productos");
      const data = await response.json();

      if (data.productos) {
        setProducts(data.productos);

        // Obtener categorías únicas con conteo
        const categoryCount = {};
        data.productos.forEach((product) => {
          categoryCount[product.categoria] =
            (categoryCount[product.categoria] || 0) + 1;
        });

        const categoriesArray = Object.entries(categoryCount).map(
          ([name, count]) => ({
            name,
            count,
          }),
        );

        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    setCheckoutModal({
      isOpen: true,
      product: product,
    });
  };

  const handleCloseCheckout = () => {
    setCheckoutModal({
      isOpen: false,
      product: null,
    });
  };

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.descripcion &&
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Productos destacados
  const featuredProducts = products.filter((p) => p.destacado).slice(0, 8);

  // Productos con descuento
  const discountedProducts = products
    .filter((p) => p.precioAnterior && p.precioAnterior > p.precio)
    .slice(0, 8);

  // Productos más nuevos
  const newProducts = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  if (loading) {
    return (
      <main className="min-h-screen py-14">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Cargando tienda...
            </p>
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
      <div className="max-w-7xl mx-auto px-4 pt-12">
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
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
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

        {/* Métodos de Pago Aceptados */}
        {business.paymentMethods && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Métodos de pago aceptados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {business.paymentMethods.nequi?.enabled && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      Nequi
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Pago instantáneo
                    </div>
                  </div>
                </div>
              )}

              {business.paymentMethods.cash?.enabled && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Banknote className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      Efectivo
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Al recibir
                    </div>
                  </div>
                </div>
              )}

              {business.paymentMethods.bankTransfer?.enabled && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      Transferencia
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {business.paymentMethods.bankTransfer.bankName}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                Categorías
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {cat.name.replace(/-/g, " ")} ({cat.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sección de Servicios y Categorías del Negocio */}
        {business.services && business.services.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Gift className="w-8 h-8 text-primary" />
              Todo lo que ofrecemos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {business.services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-primary"
                >
                  <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    {service}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    window.scrollTo({ top: 0, behavior: "smooth" });
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
            {selectedCategory === "all"
              ? "Todos los productos"
              : `Categoría: ${selectedCategory.replace(/-/g, " ")}`}
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
            <p className="text-sm opacity-90">
              En compras superiores a $50.000
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <Zap className="w-12 h-12 mb-3" />
            <h3 className="text-xl font-bold mb-2">Entrega Rápida</h3>
            <p className="text-sm opacity-90">
              Recibe tu pedido en 24-48 horas
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <Star className="w-12 h-12 mb-3" />
            <h3 className="text-xl font-bold mb-2">Calidad Garantizada</h3>
            <p className="text-sm opacity-90">Productos de la mejor calidad</p>
          </div>
        </div>

        {/* Banner de llamado a la acción para otros negocios */}
        {/* <div className="bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="relative px-8 py-12 text-white">
            <div className="text-center max-w-4xl mx-auto">
              <Sparkles className="w-16 h-16 mx-auto mb-4 animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Tienes un negocio? ¡Únete a NeuraIdev!
              </h2>
              <p className="text-lg md:text-xl opacity-95 mb-6">
                Llega a miles de clientes potenciales en tu zona. Tu tienda
                online profesional con catálogo completo, carrito de compras y
                sistema de pagos integrado.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <TrendingUp className="w-8 h-8 mb-2" />
                  <h4 className="font-bold mb-1">Mayor Visibilidad</h4>
                  <p className="text-sm opacity-90">
                    Aparece en búsquedas de Google y redes sociales
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <ShoppingCart className="w-8 h-8 mb-2" />
                  <h4 className="font-bold mb-1">Ventas 24/7</h4>
                  <p className="text-sm opacity-90">
                    Tu tienda abierta las 24 horas, los 7 días
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Zap className="w-8 h-8 mb-2" />
                  <h4 className="font-bold mb-1">Fácil de Usar</h4>
                  <p className="text-sm opacity-90">
                    Administra tus productos desde tu celular
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href={`https://wa.me/573174503604?text=${encodeURIComponent("Hola, quiero registrar mi negocio en NeuraIdev y tener mi propia tienda online")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                  </svg>
                  Contactar por WhatsApp
                </a>
                <a
                  href="tel:+573174503604"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <Phone className="w-6 h-6" />
                  Llamar Ahora
                </a>
              </div>

              <p className="mt-6 text-sm opacity-80">
                Planes desde $50.000/mes • Sin costos ocultos • Soporte técnico
                incluido
              </p>
            </div>
          </div>
        </div> */}

        {/* Modal de Checkout */}
        {checkoutModal.isOpen && checkoutModal.product && (
          <CheckoutModal
            isOpen={checkoutModal.isOpen}
            onClose={handleCloseCheckout}
            product={checkoutModal.product}
            business={business}
          />
        )}
      </div>
    </main>
  );
}
