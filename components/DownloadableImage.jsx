"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, X, ZoomIn } from "lucide-react";

/**
 * Componente de imagen con funcionalidad de descarga y vista ampliada
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} filename - Nombre del archivo al descargar (opcional)
 * @param {number} width - Ancho de la imagen
 * @param {number} height - Alto de la imagen
 * @param {string} className - Clases CSS adicionales
 * @param {object} ...props - Otras props de Next Image
 */
export default function DownloadableImage({
  src,
  alt,
  filename,
  width,
  height,
  className = "",
  priority = false,
  ...props
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Generar nombre de archivo si no se proporciona
  const getFilename = () => {
    if (filename) return filename;

    // Extraer nombre del archivo de la URL
    const urlParts = src.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    const filenamePart = lastPart.split('?')[0]; // Remover query params

    return filenamePart || 'imagen-descargada.jpg';
  };

  // Función para descargar la imagen
  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Fetch de la imagen
      const response = await fetch(src);
      const blob = await response.blob();

      // Crear URL temporal
      const url = window.URL.createObjectURL(blob);

      // Crear elemento <a> temporal para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = getFilename();
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsDownloading(false);
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* Imagen con overlay hover */}
      <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} transition-opacity`}
          priority={priority}
          {...props}
        />

        {/* Overlay con botones al hacer hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
              title="Ver imagen completa"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={isDownloading}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-400"
              title="Descargar imagen"
            >
              <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de vista ampliada */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[99999] flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Botón cerrar - superior derecha */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg z-10"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Botón descargar - inferior derecha */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={isDownloading}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-400 z-10 text-sm font-medium"
              title="Descargar imagen"
            >
              <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
              {isDownloading ? 'Descargando...' : 'Descargar'}
            </button>

            {/* Imagen ampliada */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                sizes="(max-width: 1400px) 100vw, 1400px"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
