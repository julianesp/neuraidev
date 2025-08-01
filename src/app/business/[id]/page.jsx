"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, ExternalLink, ArrowLeft } from "lucide-react";

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

export default function BusinessPage() {
  const params = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const businessId = params.id;
    const businessData = businessDatabase[businessId];

    if (businessData) {
      setBusiness(businessData);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen py-14">
        <div className="max-w-4xl mx-auto px-4 flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <main className="min-h-screen py-14">
      <div className="max-w-4xl mx-auto px-4">
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

        {/* Header del negocio */}
        <div className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-64 md:h-80">
            <Image
              src={business.image}
              alt={business.name}
              fill
              className="object-cover"
              onError={(e) => {
                e.target.src =
                  "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/Others/store.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {business.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            <div className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Acerca del negocio
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {business.description}
              </p>
            </div>

            {/* Servicios */}
            <div className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Servicios ofrecidos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {business.services.map((service, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-6">
            {/* Información básica */}
            <div className="bg-white/30 backdrop-blur-md dark:bg-black/20 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Información de contacto
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {business.address}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <a
                    href={`tel:${business.phone}`}
                    className="text-gray-700 dark:text-gray-300 text-sm hover:text-primary transition-colors"
                  >
                    {business.phone}
                  </a>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {business.hours}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                </svg>
                Contactar por WhatsApp
              </a>

              <a
                href={`tel:${business.phone}`}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Llamar ahora
              </a>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                ¿Tienes un negocio?
              </p>
              <Link
                href="https://wa.me/573174503604"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium text-sm hover:underline inline-flex items-center"
              >
                Solicita tu espacio aquí
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
