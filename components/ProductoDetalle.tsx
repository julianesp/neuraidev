'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: { toString(): string };
  precioAnterior?: { toString(): string } | null;
  categoria: string;
  imagenPrincipal: string | null;
  disponible: boolean;
  stock: number;
  marca?: string | null;
  condicion: string;
  sku?: string | null;
  tags: string[];
  metadata?: {
    payment_link?: string;
    [key: string]: unknown;
  };
  imagenes: Array<{
    id: string;
    url: string;
    alt: string | null;
    orden: number;
  }>;
  tienda: {
    id: string;
    nombre: string;
    descripcion: string | null;
    createdAt: Date;
    updatedAt: Date;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    logo: string | null;
    activa: boolean;
  } | null;
}

interface Props {
  producto: Producto;
}

export default function ProductoDetalle({ producto }: Props) {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(producto.imagenPrincipal || '');

  const precio = parseFloat(producto.precio.toString());
  const precioAnterior = producto.precioAnterior ? parseFloat(producto.precioAnterior.toString()) : null;
  const descuento = precioAnterior ? Math.round(((precioAnterior - precio) / precioAnterior) * 100) : 0;

  const handleWhatsApp = () => {
    const mensaje = `Hola! Me interesa este producto:\n\n*${producto.nombre}*\nPrecio: $${precio.toLocaleString()} COP\nLink: ${window.location.href}`;
    const url = `https://wa.me/57${(producto.tienda?.telefono || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleCompartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: producto.nombre,
          text: `${producto.nombre} - $${precio.toLocaleString()} COP`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-3">
          <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {imagenSeleccionada ? (
              <Image
                src={imagenSeleccionada}
                alt={producto.nombre}
                className="w-full h-full object-contain"
                width={400}
                height={400}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                Sin imagen
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {producto.imagenes && producto.imagenes.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {producto.imagenPrincipal && (
                <button
                  onClick={() => setImagenSeleccionada(producto.imagenPrincipal!)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 ${
                    imagenSeleccionada === producto.imagenPrincipal ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <img
                    src={producto.imagenPrincipal}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                </button>
              )}
              {producto.imagenes.map((imagen) => (
                <button
                  key={imagen.id}
                  onClick={() => setImagenSeleccionada(imagen.url)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 ${
                    imagenSeleccionada === imagen.url ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <img
                    src={imagen.url}
                    alt={imagen.alt || producto.nombre}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href={`/accesorios/${producto.categoria}`} className="hover:text-blue-600 dark:hover:text-blue-400 capitalize">
              {producto.categoria.replace('-', ' ')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{producto.nombre}</span>
          </nav>

          {/* Título y precio */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex-1">{producto.nombre}</h1>
              <FavoriteButton producto={producto} size="large" />
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
              <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-500">
                ${precio.toLocaleString()} COP
              </span>
            {precioAnterior && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  ${precioAnterior.toLocaleString()}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                  -{descuento}%
                </span>
              </>
            )}
          </div>

            {/* Stock y disponibilidad */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
              <span className={`px-3 py-1 rounded-full ${
                producto.disponible ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {producto.disponible ? '✅ Disponible' : '❌ No disponible'}
              </span>
              {producto.stock > 0 && (
                <span className="text-gray-600 dark:text-gray-400">Stock: {producto.stock}</span>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Categoría:</span>
              <span className="ml-2 capitalize text-gray-900 dark:text-white">{producto.categoria.replace('-', ' ')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Condición:</span>
              <span className="ml-2 capitalize text-gray-900 dark:text-white">{producto.condicion}</span>
            </div>
            {producto.marca && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Marca:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{producto.marca}</span>
              </div>
            )}
            {producto.sku && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">SKU:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{producto.sku}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white ">Descripción</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed w-2/4">{producto.descripcion || 'Sin descripción disponible'}</p>
          </div>

          {/* Tags */}
          {producto.tags && producto.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Características</h3>
              <div className="flex flex-wrap gap-2">
                {producto.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Garantía */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-blue-900 dark:text-blue-200">Garantía de 1 mes</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Todos nuestros productos cuentan con garantía de 1 mes contra defectos de fabricación.
                  Compra con confianza y seguridad.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            {producto.tienda?.telefono && (
              <button
                onClick={handleWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                💬 Contactar por WhatsApp
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCompartir}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                📤 Compartir
              </button>
              {producto.tienda?.email && (
                <a
                  href={`mailto:${producto.tienda.email}?subject=Consulta sobre ${producto.nombre}&body=Hola, me interesa obtener más información sobre: ${producto.nombre}%0A%0APrecio: $${precio.toLocaleString()} COP%0ALink: ${typeof window !== 'undefined' ? window.location.href : ''}`}
                  className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors text-center text-sm sm:text-base"
                >
                  📧 Email
                </a>
              )}
            </div>
          </div>

          {/* Información de la tienda */}
          {producto.tienda && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Vendido por</h3>
              <p className="text-gray-700 dark:text-gray-300">{producto.tienda.nombre}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{producto.tienda.telefono || 'No disponible'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}