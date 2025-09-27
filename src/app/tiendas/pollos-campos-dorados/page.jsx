"use client";

import React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Clock,
  Phone,
  MapPin,
  Truck,
  Star,
  Award,
  Heart,
  Users,
  ChefHat,
} from "lucide-react";

const productos = [
  {
    id: 1,
    nombre: "Pollo Entero",
    descripcion: "Pollo fresco de la mejor calidad, criado en campos dorados",
    precio: "Desde $18.000",
    icono: "🐔",
    color: "bg-yellow-500",
  },
  {
    id: 2,
    nombre: "Presas Selectas",
    descripcion: "Muslos, contramuslos, pechugas y alas frescas",
    precio: "Desde $8.000",
    icono: "🍗",
    color: "bg-orange-500",
  },
  {
    id: 3,
    nombre: "Pollo Rostizado",
    descripcion: "Pollo asado con especias especiales, listo para servir",
    precio: "Desde $22.000",
    icono: "🔥",
    color: "bg-red-500",
  },
  {
    id: 4,
    nombre: "Pollo Despresado",
    descripcion: "Pollo cortado y listo para cocinar según tus necesidades",
    precio: "Desde $20.000",
    icono: "🥩",
    color: "bg-amber-600",
  },
];

const servicios = [
  {
    titulo: "Frescura Garantizada",
    descripcion: "Pollo fresco diariamente, directo de nuestras granjas",
    icono: <Award className="w-6 h-6" />,
  },
  {
    titulo: "Calidad Premium",
    descripcion: "Pollos criados con alimentación natural en campos abiertos",
    icono: <Star className="w-6 h-6" />,
  },
  {
    titulo: "Cortes Personalizados",
    descripcion: "Despresamos el pollo según tus preferencias",
    icono: <ChefHat className="w-6 h-6" />,
  },
  {
    titulo: "Entrega a Domicilio",
    descripcion: "Llevamos frescura hasta tu puerta",
    icono: <Truck className="w-6 h-6" />,
  },
];

const horarios = [
  { dia: "Lunes a Viernes", horario: "6:00 AM - 7:00 PM" },
  { dia: "Sábados", horario: "6:00 AM - 8:00 PM" },
  { dia: "Domingos", horario: "7:00 AM - 6:00 PM" },
];

export default function PollosCamposDorados() {
  return (
    <main className="min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-full">
              <UtensilsCrossed className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🐔 Pollos Campos Dorados
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
            La Frescura que tu Familia Merece
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Especialistas en pollo fresco de la más alta calidad. Criados en
            campos abiertos con alimentación natural para garantizar el mejor
            sabor y frescura en cada producto.
          </p>
        </div>

        {/* Products Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Nuestros Productos Frescos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{producto.icono}</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                    {producto.descripcion}
                  </p>
                  <div className={`${producto.color} text-white px-3 py-1 rounded-full text-sm font-semibold inline-block`}>
                    {producto.precio}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-16 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            ¿Por qué elegir Pollos Campos Dorados?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicios.map((servicio, index) => (
              <div
                key={index}
                className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-yellow-500 p-3 rounded-full inline-flex mb-4">
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

        {/* Fresh Quality Banner */}
        <div className="mb-16 bg-gradient-to-r from-green-500 to-yellow-500 rounded-2xl p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Criados con Amor en Campos Naturales
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Nuestros pollos se crían en ambiente natural, sin hormonas ni químicos dañinos.
            Alimentación balanceada y cuidado especial para garantizar la mejor calidad.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl mb-2">🌾</div>
              <h4 className="font-semibold mb-1">Alimentación Natural</h4>
              <p className="text-sm opacity-90">Granos seleccionados y alimentación balanceada</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌿</div>
              <h4 className="font-semibold mb-1">Ambiente Libre</h4>
              <p className="text-sm opacity-90">Criados en campos abiertos y espacios amplios</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="font-semibold mb-1">Calidad Certificada</h4>
              <p className="text-sm opacity-90">Estándares de calidad y frescura garantizada</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            ¡Ordena tu Pollo Fresco Hoy!
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Disponible todos los días. Hacemos entregas a domicilio para tu comodidad
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://wa.me/573174503604?text=Hola, quiero ordenar pollo fresco de Pollos Campos Dorados"
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
              Ordenar por WhatsApp
            </Link>
            <Link
              href="tel:+573174503604"
              className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              Llamar para Ordenar
            </Link>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            📍 Información de la Pollería
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-yellow-500 p-4 rounded-full inline-flex mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Horarios de Atención
              </h4>
              <div className="space-y-2">
                {horarios.map((horario, index) => (
                  <div key={index} className="text-gray-600 dark:text-gray-300">
                    <strong>{horario.dia}:</strong> {horario.horario}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="bg-green-500 p-4 rounded-full inline-flex mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Contacto Directo
              </h4>
              <div className="text-gray-600 dark:text-gray-300 space-y-2">
                <p><strong>Teléfono:</strong><br />+57 317 450 3604</p>
                <p><strong>WhatsApp:</strong><br />Pedidos y consultas</p>
                <p><strong>Tiempo de entrega:</strong><br />30-45 minutos</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 p-4 rounded-full inline-flex mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Zona de Cobertura
              </h4>
              <div className="text-gray-600 dark:text-gray-300 space-y-2">
                <p><strong>Entregas:</strong><br />Toda la zona metropolitana</p>
                <p><strong>Pedido mínimo:</strong><br />$15.000</p>
                <p><strong>Frescura:</strong><br />Producto del día</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-12 text-center bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl p-8">
          <div className="mb-4">
            <Users className="w-8 h-8 text-yellow-600 mx-auto" />
          </div>
          <blockquote className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">
            &ldquo;En Pollos Campos Dorados nos enorgullece ofrecer la mejor calidad
            en pollo fresco. Nuestro compromiso es con la frescura, la calidad
            y la satisfacción de nuestros clientes. ¡Prueba la diferencia!&rdquo;
          </blockquote>
          <cite className="text-yellow-600 dark:text-yellow-400 font-semibold">
            - Familia Campos Dorados
          </cite>
        </div>
      </div>
    </main>
  );
}