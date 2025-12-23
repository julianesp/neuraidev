"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, Radio, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

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
    facebook: "https://www.facebook.com/SelectaFMSibundoy",
    instagram: "https://www.instagram.com/selectafm933",
    whatsapp: "https://wa.me/573174503604",
    website: "https://selectafm.com",
  },
};

// Inicializar Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SelectaFMPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listeners, setListeners] = useState(0);
  const sessionIdRef = useRef<string | null>(null);

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

  // Tracking de oyentes en tiempo real con Supabase
  useEffect(() => {
    let listenerInterval: NodeJS.Timeout;

    const initializeSession = async () => {
      try {
        // Generar ID de sesión único
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionIdRef.current = sessionId;

        // Registrar nuevo oyente
        const { error } = await supabase
          .from('radio_listeners')
          .insert({
            session_id: sessionId,
            station: 'selecta_fm',
            connected_at: new Date().toISOString(),
            last_heartbeat: new Date().toISOString(),
          });

        if (error) {
          console.error('Error al registrar oyente:', error);
        }

        // Heartbeat cada 30 segundos para mantener sesión activa
        listenerInterval = setInterval(async () => {
          if (sessionIdRef.current) {
            await supabase
              .from('radio_listeners')
              .update({
                last_heartbeat: new Date().toISOString(),
              })
              .eq('session_id', sessionIdRef.current);
          }
        }, 30000);

      } catch (err) {
        console.error('Error inicializando sesión:', err);
      }
    };

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('radio_listeners_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'radio_listeners',
          filter: `station=eq.selecta_fm`,
        },
        () => {
          // Actualizar contador cuando hay cambios
          fetchListenerCount();
        }
      )
      .subscribe();

    // Obtener conteo inicial
    const fetchListenerCount = async () => {
      const { count, error } = await supabase
        .from('radio_listeners')
        .select('*', { count: 'exact', head: true })
        .eq('station', 'selecta_fm')
        .gte('last_heartbeat', new Date(Date.now() - 120000).toISOString()); // Últimos 2 minutos

      if (!error && count !== null) {
        setListeners(count);
      }
    };

    initializeSession();
    fetchListenerCount();

    // Cleanup al desmontar
    return () => {
      if (listenerInterval) clearInterval(listenerInterval);

      // Eliminar sesión al salir
      if (sessionIdRef.current) {
        supabase
          .from('radio_listeners')
          .delete()
          .eq('session_id', sessionIdRef.current)
          .then(() => {
            console.log('Sesión de oyente eliminada');
          });
      }

      channel.unsubscribe();
    };
  }, []);

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
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Card Principal del Reproductor */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 mb-8 shadow-2xl">
            {/* Albumart / Logo */}
            <div className="flex justify-center mb-10">
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 shadow-2xl flex items-center justify-center overflow-hidden relative group">
                <img
                  src={SELECTA_FM.image}
                  alt={SELECTA_FM.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
              {SELECTA_FM.social.instagram && (
                <a
                  href={SELECTA_FM.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  📷 Instagram
                </a>
              )}
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
              {SELECTA_FM.social.website && (
                <a
                  href={SELECTA_FM.social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  🌐 Sitio Web
                </a>
              )}
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
