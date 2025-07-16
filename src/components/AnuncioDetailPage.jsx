"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Star,
  Calendar,
  Tag,
  Share2,
  Copy,
  Check,
} from "lucide-react";

const AnuncioDetailPage = ({ anuncio, onBack }) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!anuncio) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <p className="text-gray-600 text-xl font-light">
            Anuncio no encontrado
          </p>
          <Link
            href="/anuncios"
            className="inline-flex items-center mt-6 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver a anuncios
          </Link>
        </div>
      </div>
    );
  }

  const categories = {
    general: "General",
    restaurant: "Restaurante",
    shop: "Tienda",
    service: "Servicio",
    technology: "Tecnología",
    health: "Salud",
    education: "Educación",
    entertainment: "Entretenimiento",
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: anuncio.businessName,
          text: anuncio.description,
          url: window.location.href,
        });
      } catch (error) {
        // Si falla el share nativo, copiar al portapapeles
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver
            </button>

            <button
              onClick={handleShare}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={20} className="mr-2 text-green-600" />
                  <span className="text-green-600">Copiado</span>
                </>
              ) : (
                <>
                  <Share2 size={20} className="mr-2" />
                  Compartir
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Imagen principal */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="relative h-64 md:h-96 bg-gray-100">
              {anuncio.imageUrl && !imageError ? (
                <Image
                  src={anuncio.imageUrl}
                  alt={anuncio.businessName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                  quality={90}
                  onError={handleImageError}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏪</div>
                    <p className="text-lg">Sin imagen disponible</p>
                  </div>
                </div>
              )}

              {/* Badges superpuestos */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {anuncio.featured && (
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star size={14} className="mr-1" />
                    Destacado
                  </span>
                )}
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  <Tag size={14} className="mr-1" />
                  {categories[anuncio.category] || anuncio.category}
                </span>
              </div>
            </div>
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenido principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {anuncio.businessName}
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {anuncio.description}
                </p>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={20} className="mr-3 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Publicado</p>
                      <p className="text-sm">{formatDate(anuncio.createdAt)}</p>
                    </div>
                  </div>

                  {anuncio.updatedAt !== anuncio.createdAt && (
                    <div className="flex items-center text-gray-600">
                      <Calendar size={20} className="mr-3 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Actualizado</p>
                        <p className="text-sm">
                          {formatDate(anuncio.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón principal de acción */}
                {anuncio.linkUrl && (
                  <div className="mb-8">
                    <Link
                      href={anuncio.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                    >
                      <ExternalLink size={20} className="mr-2" />
                      Visitar sitio web
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar con información de contacto */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Información de Contacto
                </h2>

                <div className="space-y-4">
                  {anuncio.contactInfo?.phone && (
                    <div className="flex items-start">
                      <div className="bg-green-100 p-2 rounded-lg mr-4">
                        <Phone size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Teléfono
                        </p>
                        <a
                          href={`tel:${anuncio.contactInfo.phone}`}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          {anuncio.contactInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {anuncio.contactInfo?.email && (
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg mr-4">
                        <Mail size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Email
                        </p>
                        <a
                          href={`mailto:${anuncio.contactInfo.email}`}
                          className="text-blue-600 hover:text-blue-700 font-medium break-all"
                        >
                          {anuncio.contactInfo.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {anuncio.contactInfo?.address && (
                    <div className="flex items-start">
                      <div className="bg-red-100 p-2 rounded-lg mr-4">
                        <MapPin size={20} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Dirección
                        </p>
                        <p className="text-gray-600">
                          {anuncio.contactInfo.address}
                        </p>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(anuncio.contactInfo.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center mt-2"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          Ver en mapa
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción adicionales */}
                <div className="mt-8 space-y-3">
                  {anuncio.contactInfo?.phone && (
                    <a
                      href={`https://wa.me/${anuncio.contactInfo.phone.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center font-medium"
                    >
                      📱 WhatsApp
                    </a>
                  )}

                  <button
                    onClick={copyToClipboard}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center font-medium"
                  >
                    <Copy size={16} className="mr-2" />
                    Copiar enlace
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de navegación inferior */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-600">¿Interesado en este negocio?</p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/anuncios"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Ver más anuncios
                </Link>

                {anuncio.linkUrl && (
                  <Link
                    href={anuncio.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Visitar sitio
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnuncioDetailPage;
