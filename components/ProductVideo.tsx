'use client';

import { useState } from 'react';

interface ProductVideoProps {
  videoUrl: string;
  videoType?: 'youtube' | 'vimeo' | 'direct';
  productName: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

/**
 * Componente para mostrar videos de productos
 * Soporta YouTube, Vimeo y videos directos (MP4, WebM)
 */
export default function ProductVideo({
  videoUrl,
  videoType = 'direct',
  productName,
  className = '',
  autoPlay = false,
  controls = true,
}: ProductVideoProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Detectar el tipo de video automáticamente si no se especifica
  const detectVideoType = (url: string): 'youtube' | 'vimeo' | 'direct' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    return 'direct';
  };

  const actualVideoType = videoType || detectVideoType(videoUrl);

  // Extraer ID de video de YouTube
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extraer ID de video de Vimeo
  const getVimeoId = (url: string): string | null => {
    const regExp = /vimeo.*\/(\d+)/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Renderizar según el tipo de video
  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="text-center p-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Error al cargar el video
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cargando video...
            </p>
          </div>
        </div>
      )}

      {/* YouTube */}
      {actualVideoType === 'youtube' && (
        <iframe
          src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?autoplay=${autoPlay ? 1 : 0}&controls=${controls ? 1 : 0}&rel=0`}
          title={`Video de ${productName}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoadComplete}
          onError={handleError}
        />
      )}

      {/* Vimeo */}
      {actualVideoType === 'vimeo' && (
        <iframe
          src={`https://player.vimeo.com/video/${getVimeoId(videoUrl)}?autoplay=${autoPlay ? 1 : 0}&controls=${controls ? 1 : 0}`}
          title={`Video de ${productName}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={handleLoadComplete}
          onError={handleError}
        />
      )}

      {/* Video Directo (MP4, WebM, etc.) */}
      {actualVideoType === 'direct' && (
        <video
          src={videoUrl}
          className="w-full h-full object-contain"
          controls={controls}
          autoPlay={autoPlay}
          loop
          muted={autoPlay}
          playsInline
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadComplete}
          onError={handleError}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          Tu navegador no soporta la reproducción de video.
        </video>
      )}
    </div>
  );
}
