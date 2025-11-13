'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Galería de imágenes */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {imagenSeleccionada ? (
            <img
              src={imagenSeleccionada}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Sin imagen
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {producto.imagenes && producto.imagenes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {producto.imagenPrincipal && (
              <button
                onClick={() => setImagenSeleccionada(producto.imagenPrincipal!)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  imagenSeleccionada === producto.imagenPrincipal ? 'border-blue-500' : 'border-gray-200'
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
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  imagenSeleccionada === imagen.url ? 'border-blue-500' : 'border-gray-200'
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
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href={`/accesorios/${producto.categoria}`} className="hover:text-blue-600 capitalize">
            {producto.categoria.replace('-', ' ')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{producto.nombre}</span>
        </nav>

        {/* Título y precio */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{producto.nombre}</h1>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold text-green-600">
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
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-3 py-1 rounded-full ${
              producto.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {producto.disponible ? '✅ Disponible' : '❌ No disponible'}
            </span>
            {producto.stock > 0 && (
              <span className="text-gray-600">Stock: {producto.stock}</span>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Categoría:</span>
            <span className="ml-2 capitalize">{producto.categoria.replace('-', ' ')}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Condición:</span>
            <span className="ml-2 capitalize">{producto.condicion}</span>
          </div>
          {producto.marca && (
            <div>
              <span className="font-medium text-gray-700">Marca:</span>
              <span className="ml-2">{producto.marca}</span>
            </div>
          )}
          {producto.sku && (
            <div>
              <span className="font-medium text-gray-700">SKU:</span>
              <span className="ml-2">{producto.sku}</span>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Descripción</h3>
          <p className="text-gray-700 leading-relaxed">{producto.descripcion || 'Sin descripción disponible'}</p>
        </div>

        {/* Tags */}
        {producto.tags && producto.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Características</h3>
            <div className="flex flex-wrap gap-2">
              {producto.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}


        {/* Botones de acción */}
        <div className="space-y-3">
          {producto.tienda?.telefono && (
            <button
              onClick={handleWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              💬 Contactar por WhatsApp
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCompartir}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              📤 Compartir
            </button>
            {producto.tienda?.email && (
              <a
                href={`mailto:${producto.tienda.email}?subject=Consulta sobre ${producto.nombre}&body=Hola, me interesa obtener más información sobre: ${producto.nombre}%0A%0APrecio: $${precio.toLocaleString()} COP%0ALink: ${typeof window !== 'undefined' ? window.location.href : ''}`}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
              >
                📧 Email
              </a>
            )}
          </div>
        </div>

        {/* Información de la tienda */}
        {producto.tienda && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Vendido por</h3>
            <p className="text-gray-700">{producto.tienda.nombre}</p>
            <p className="text-sm text-gray-600">{producto.tienda.telefono || 'No disponible'}</p>
          </div>
        )}
      </div>
    </div>
  );
}