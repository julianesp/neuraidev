"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, Radio, Users, Share2, Copy, Check } from "lucide-react";

interface StreamConfig {
  // Reemplaza estas URLs con las reales de Selecta FM
  hlsUrl?: string; // URL .m3u8
  mp3Url?: string; // URL MP3 stream
  rtmpUrl?: string; // URL RTMP
  name: string;
  frequency: string;
  description: string;
  image: string;
  social: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    website?: string;
  };
}

const SELECTA_FM: StreamConfig = {
  // URL con proxy para evitar CORS
  mp3Url: `/selecta/proxy?url=${encodeURIComponent("https://radio25.virtualtronics.com/proxy/selectafmsibundoy?mp=/stream")}`,
  name: "Selecta FM",
  frequency: "93.3 FM",
  description: "Valle de Sibundoy, Putumayo - Música en vivo 24/7",
  image: "https://selectafm.com/wp-content/uploads/2024/02/selecta-logo.jpg",
  social: {
    facebook: "https://www.facebook.com/selectaradiotv",
    instagram: "https://www.instagram.com/selectafm933",
    whatsapp: "https://wa.me/573174503604",
    website: "https://selectafm.com",
  },
};

export default function SelectaFMPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listeners, setListeners] = useState(0);
  const [copied, setCopied] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  const shareUrl = 'https://neurai.dev/selecta';
  const shareTitle = 'Escucha Selecta FM 93.3 en Vivo';
  const shareText = '🎵 Escucha Selecta FM 93.3 en vivo desde Valle de Sibundoy, Putumayo. ¡Música 24/7!';

  // Inicializar Media Session API para reproducción en segundo plano
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: SELECTA_FM.name,
        artist: SELECTA_FM.frequency,
        album: 'En Vivo',
        artwork: [
          {
            src: SELECTA_FM.image,
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      // Configurar controles de reproducción
      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
        setIsPlaying(true);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
    }
  }, []);

  // Listener tracking disabled — Supabase realtime removed, pending migration to D1-compatible solution
  useEffect(() => {
    // no-op: listener count tracking not yet implemented for D1
    return () => {};
  }, []);

  // Función para compartir usando Web Share API nativa
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      // Fallback: copiar enlace
      handleCopyLink();
    }
  };

  // Función para copiar enlace al portapapeles
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando enlace:', err);
    }
  };

  // Función para compartir en WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Función para abrir página de Facebook
  const handleShareFacebook = () => {
    window.open('https://www.facebook.com/selectaradiotv', '_blank');
  };

  // Función para compartir en Twitter/X
  const handleShareTwitter = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Intentar reproducir
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (err) {
      setError("No se pudo conectar a la transmisión. Intenta más tarde.");
      setIsPlaying(false);
      console.error("Error al reproducir:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 mt-14">
      {/* Fondo con patrón */}
      <div className="fixed inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #ff00ff, transparent 50%), radial-gradient(circle at 80% 80%, #00ffff, transparent 50%)",
          }}
        />
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/30 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Selecta FM</h1>
                <p className="text-sm text-gray-400">En vivo • 93.3 FM</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-green-400" />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-white">
                  {listeners} oyente{listeners !== 1 ? 's' : ''} en vivo
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-4">
          {/* Card Principal del Reproductor */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 mb-8 shadow-2xl">
            {/* Albumart / Logo */}
            <div className="flex justify-center mb-10">
              <div className="w-auto h-auto rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 shadow-2xl flex items-center justify-center overflow-hidden relative group">
                <img
                  src={SELECTA_FM.image}
                  alt={SELECTA_FM.name}
                  className="w-full h-full object-cover  transition-transform duration-300"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/30 animate-pulse" />
                )}
              </div>
            </div>

            {/* Información */}
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-2">
                {SELECTA_FM.name}
              </h2>
              <p className="text-lg text-purple-300 font-semibold mb-4">
                {SELECTA_FM.frequency}
              </p>
              <p className="text-gray-300 max-w-2xl mx-auto">
                {SELECTA_FM.description}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center">
                {error}
              </div>
            )}

            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={SELECTA_FM.mp3Url}
              crossOrigin="anonymous"
              onEnded={() => setIsPlaying(false)}
            />

            {/* Controles */}
            <div className="flex flex-col items-center gap-8">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="group relative w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />

                {isLoading ? (
                  <div className="animate-spin">
                    <Radio className="w-10 h-10 text-white" />
                  </div>
                ) : isPlaying ? (
                  <Pause className="w-10 h-10 text-white fill-white" />
                ) : (
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                )}
              </button>

              {/* Status */}
              <div className="text-center">
                <p className="text-white font-semibold text-lg">
                  {isLoading
                    ? "Conectando..."
                    : isPlaying
                      ? "▶ En reproducción"
                      : "⏸ Pausado"}
                </p>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4 w-full max-w-xs">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-gray-400 text-sm w-8 text-right">
                  {volume}%
                </span>
              </div>
            </div>
          </div>

          {/* Compartir */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 mb-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Comparte Selecta FM
            </h3>
            <p className="text-gray-300 text-center mb-6">
              Comparte esta página con tus amigos y familia para que también disfruten de nuestra música
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {/* Botón Compartir Nativo (móviles) */}
              {typeof window !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                  Compartir
                </button>
              )}

              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>

              {/* Twitter/X */}
              {/* <button
                onClick={handleShareTwitter}
                className="px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter)
              </button> */}

              {/* Copiar Enlace */}
              <button
                onClick={handleCopyLink}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Enlace
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Schedule */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">📅 Horario</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex justify-between">
                  <span>Lunes - Viernes:</span>
                  <span className="font-semibold text-white">
                    6:00 AM - 10:00 PM
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Sábado:</span>
                  <span className="font-semibold text-white">
                    8:00 AM - 12:00 AM
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Domingo:</span>
                  <span className="font-semibold text-white">
                    10:00 AM - 10:00 PM
                  </span>
                </li>
              </ul>
            </div>

            {/* Frecuencias */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                📻 Transmisión
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex justify-between">
                  <span>Frecuencia FM:</span>
                  <span className="font-semibold text-white">93.3 FM</span>
                </li>
                <li className="flex justify-between">
                  <span>Calidad Stream:</span>
                  <span className="font-semibold text-white">128 kbps</span>
                </li>
                <li className="flex justify-between">
                  <span>Cobertura:</span>
                  <span className="font-semibold text-white">Regional</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Síguenos en Redes Sociales
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {SELECTA_FM.social.facebook && (
                <a
                  href={SELECTA_FM.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  👍 Facebook
                </a>
              )}
              {/* {SELECTA_FM.social.instagram && (
                <a
                  href={SELECTA_FM.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  📷 Instagram
                </a>
              )} */}
              {SELECTA_FM.social.whatsapp && (
                <a
                  href={SELECTA_FM.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  💬 WhatsApp
                </a>
              )}
              {/* {SELECTA_FM.social.website && (
                <a
                  href={SELECTA_FM.social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  🌐 Sitio Web
                </a>
              )} */}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/30 backdrop-blur mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-400">
            <p>
              Transmisión de Selecta FM alojada en{" "}
              <span className="font-semibold text-white">neurai.dev</span>
            </p>
            <p className="text-sm mt-2">
              © 2025 Selecta FM • Todos los derechos reservados
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
