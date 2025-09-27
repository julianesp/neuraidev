"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Star,
  Clock,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  Users,
  Award,
} from "lucide-react";

const productos = [
  {
    id: 1,
    categoria: "Alimentos",
    nombre: "Productos de Primera Necesidad",
    descripcion: "Arroz, aceite, azúcar, sal y productos básicos para el hogar",
    icono: <Package className="w-8 h-8" />,
    color: "bg-green-500",
  },
  {
    id: 2,
    categoria: "Bebidas",
    nombre: "Refrescos y Bebidas",
    descripcion: "Gaseosas, jugos, agua y bebidas para toda la familia",
    icono: <ShoppingCart className="w-8 h-8" />,
    color: "bg-blue-500",
  },
  {
    id: 3,
    categoria: "Snacks",
    nombre: "Mecatos y Dulces",
    descripcion: "Galletas, dulces, chocolates y snacks variados",
    icono: <Star className="w-8 h-8" />,
    color: "bg-orange-500",
  },
  {
    id: 4,
    categoria: "Hogar",
    nombre: "Artículos para el Hogar",
    descripcion: "Productos de limpieza, aseo personal y cuidado del hogar",
    icono: <Package className="w-8 h-8" />,
    color: "bg-purple-500",
  },
];

const servicios = [
  {
    titulo: "Atención Personalizada",
    descripcion: "Servicio amable y familiar que conoce a sus clientes",
    icono: <Users className="w-6 h-6" />,
  },
  {
    titulo: "Productos Frescos",
    descripcion: "Renovación constante de inventario para mayor frescura",
    icono: <Award className="w-6 h-6" />,
  },
  {
    titulo: "Precios Justos",
    descripcion: "Precios competitivos para toda la comunidad",
    icono: <CreditCard className="w-6 h-6" />,
  },
  {
    titulo: "Domicilios",
    descripcion: "Servicio de entrega a domicilio en la zona",
    icono: <Truck className="w-6 h-6" />,
  },
];

export default function TiendaJoseLuis() {
  return (
    <main className="min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full">
              <ShoppingCart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🛒 Tienda José Luis
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-green-600 dark:text-green-400 mb-4">
            Tu Tienda de Barrio de Confianza
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Más de 15 años sirviendo a la comunidad con productos de calidad,
            precios justos y la atención familiar que nos caracteriza.
          </p>
        </div>

        {/* Products Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Nuestros Productos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`${producto.color} p-4 rounded-full text-white mb-4 transition-transform duration-300`}
                  >
                    {producto.icono}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {producto.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            ¿Por qué elegir Tienda José Luis?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicios.map((servicio, index) => (
              <div
                key={index}
                className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg"
              >
                <div className="bg-green-500 p-3 rounded-full inline-flex mb-4">
                  {servicio.icono}
                  <span className="text-white"></span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {servicio.titulo}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {servicio.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            ¡Visítanos o Solicita tu Domicilio!
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Estamos aquí para atenderte con la mejor calidad y servicio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://wa.me/573174503604?text=Hola, necesito información sobre productos en Tienda José Luis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
              </svg>
              Solicitar Domicilio
            </Link>
            <Link
              href="tel:+573174503604"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              Llamar Directamente
            </Link>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            📍 Información de la Tienda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-500 p-4 rounded-full inline-flex mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Horarios de Atención
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Lunes a Sábado:</strong> 6:00 AM - 8:00 PM<br />
                <strong>Domingos:</strong> 7:00 AM - 6:00 PM
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500 p-4 rounded-full inline-flex mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Contacto
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Teléfono:</strong> +57 317 450 3604<br />
                <strong>WhatsApp:</strong> Disponible
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 p-4 rounded-full inline-flex mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Ubicación y Servicios
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Zona de Cobertura:</strong> Local y alrededores<br />
                <strong>Domicilios:</strong> Disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-12 text-center bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl p-8">
          <div className="mb-4">
            <Star className="w-8 h-8 text-yellow-500 mx-auto" />
          </div>
          <blockquote className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">
            &ldquo;Más que una tienda, somos parte de la familia del barrio.
            Nos enorgullece servir a nuestra comunidad con productos de calidad
            y el trato familiar que nos ha caracterizado por años.&rdquo;
          </blockquote>
          <cite className="text-green-600 dark:text-green-400 font-semibold">
            - José Luis, Propietario
          </cite>
        </div>
      </div>
    </main>
  );
}