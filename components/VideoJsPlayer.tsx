'use client';

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@/styles/videojs-theme.css';

interface VideoJsPlayerProps {
  videoUrl: string;
  videoType?: 'youtube' | 'vimeo' | 'direct';
  productName: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  poster?: string;
}

/**
 * Componente Video.js para reproducción de videos
 * Soporta YouTube, Vimeo y videos directos (MP4, WebM)
 */
export default function VideoJsPlayer({
  videoUrl,
  videoType = 'direct',
  productName,
  className = '',
  autoPlay = false,
  controls = true,
  poster,
}: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

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

  const actualVideoType = videoType || detectVideoType(videoUrl);

  useEffect(() => {
    // Asegurarse de que el ref está disponible
    if (!videoRef.current) return;

    // Configuración del reproductor según el tipo de video
    let playerOptions: any = {
      controls: controls,
      autoplay: autoPlay,
      preload: 'auto',
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 1, 1.5, 2],
      controlBar: {
        volumePanel: {
          inline: false,
        },
      },
    };

    // Agregar poster si existe
    if (poster) {
      playerOptions.poster = poster;
    }

    // Configurar fuente según el tipo
    if (actualVideoType === 'youtube') {
      const youtubeId = getYouTubeId(videoUrl);
      if (youtubeId) {
        playerOptions.techOrder = ['youtube'];
        playerOptions.sources = [{
          type: 'video/youtube',
          src: `https://www.youtube.com/watch?v=${youtubeId}`,
        }];
        playerOptions.youtube = {
          iv_load_policy: 1,
          modestbranding: 1,
        };
      }
    } else if (actualVideoType === 'vimeo') {
      const vimeoId = getVimeoId(videoUrl);
      if (vimeoId) {
        playerOptions.techOrder = ['vimeo'];
        playerOptions.sources = [{
          type: 'video/vimeo',
          src: `https://vimeo.com/${vimeoId}`,
        }];
      }
    } else {
      // Video directo (MP4, WebM, etc.)
      playerOptions.sources = [{
        src: videoUrl,
        type: 'video/mp4',
      }];
    }

    // Crear el reproductor
    const videoElement = document.createElement('video');
    videoElement.className = 'video-js vjs-big-play-centered';
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, playerOptions, function onPlayerReady() {
      console.log('Video.js player is ready!');
    });

    playerRef.current = player;

    // Limpiar el reproductor cuando el componente se desmonte
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoUrl, actualVideoType, autoPlay, controls, poster]);

  return (
    <div className={className}>
      <div ref={videoRef} />
    </div>
  );
}
