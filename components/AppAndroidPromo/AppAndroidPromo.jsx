"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  Smartphone,
  ShoppingCart,
  Bell,
  MessageCircle,
  Zap,
} from "lucide-react";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.neurai";

// Clave en localStorage: si existe, el anuncio emergente ya se mostró una vez
const STORAGE_KEY = "neurai-app-android-anuncio-visto";

const beneficios = [
  {
    icono: <ShoppingCart className="w-5 h-5" />,
    texto: "Compra accesorios y productos en pocos toques",
  },
  {
    icono: <Bell className="w-5 h-5" />,
    texto: "Recibe avisos de ofertas y del estado de tus pedidos",
  },
  {
    icono: <MessageCircle className="w-5 h-5" />,
    texto: "Habla con soporte directamente desde tu celular",
  },
  {
    icono: <Zap className="w-5 h-5" />,
    texto: "Más rápida y cómoda que el navegador",
  },
];

function ContenidoBadge() {
  return (
    <>
      <svg className="w-7 h-7" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#34A853"
          d="M3.6 1.8 13.8 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1Z"
        />
        <path
          fill="#FBBC04"
          d="m17.2 8.6-3.4 3.4 3.4 3.4 3.9-2.2c.8-.5.8-1.7 0-2.2l-3.9-2.4Z"
        />
        <path
          fill="#4285F4"
          d="M3.6 22.2 13.8 12l3.4 3.4L5.1 22.3c-.5.3-1.1.2-1.5-.1Z"
        />
        <path
          fill="#EA4335"
          d="M3.6 1.8c.4-.3 1-.4 1.5-.1l12.1 6.9-3.4 3.4L3.6 1.8Z"
        />
      </svg>
      <span className="flex flex-col leading-tight text-left">
        <span className="text-[10px] uppercase tracking-wide opacity-80">
          Disponible en
        </span>
        <span className="text-lg font-semibold">Google Play</span>
      </span>
    </>
  );
}

function BotonPlayStore({ className = "", onClick }) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center gap-3 bg-black hover:bg-gray-900 text-white rounded-xl px-5 py-3 transition-colors border border-white/20 ${className}`}
      aria-label="Descargar la app de Neurai en Google Play"
    >
      <ContenidoBadge />
    </a>
  );
}

/**
 * Anuncio emergente: se muestra solo la primera vez que el usuario entra al
 * home. Al pulsarlo lleva a Play Store; al cerrarlo no vuelve a aparecer.
 */
export function AppAndroidModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let yaVisto = false;
    try {
      yaVisto = !!localStorage.getItem(STORAGE_KEY);
    } catch {
      // Sin acceso a localStorage (modo privado estricto): no molestamos
      return;
    }
    if (yaVisto) return;

    // Pequeño retraso para no competir con la carga inicial del home
    const t = setTimeout(() => {
      setVisible(true);
      try {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      } catch {}
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => e.key === "Escape" && setVisible(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  const cerrar = () => setVisible(false);

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={cerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-android-titulo"
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-600 to-purple-700 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={cerrar}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          aria-label="Cerrar anuncio"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Toda la tarjeta lleva a Play Store */}
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={cerrar}
          className="block p-6 pt-8 text-center"
        >
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white p-2 shadow-lg">
            <Image
              src="/apple-touch-icon.png"
              alt="App Neurai"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide bg-white/20 rounded-full px-3 py-1 mb-3">
            <Smartphone className="w-3.5 h-3.5" /> ¡Nuevo!
          </span>
          <h2 id="app-android-titulo" className="text-2xl font-bold mb-2">
            Ya está disponible la app de Neurai para Android
          </h2>
          <p className="text-white/90 mb-6">
            Lleva la tienda en tu bolsillo: compra, sigue tus pedidos y recibe
            ofertas al instante.
          </p>
          <span className="inline-flex items-center gap-3 bg-black text-white rounded-xl px-5 py-3 border border-white/20">
            <ContenidoBadge />
          </span>
        </a>

        <button
          onClick={cerrar}
          className="block w-full pb-5 text-sm text-white/75 hover:text-white underline-offset-2 hover:underline"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}

/**
 * Sección fija del home con la descripción de la app, para quien no la
 * instaló desde el anuncio emergente.
 */
export function AppAndroidSection() {
  return (
    <section
      className="w-full px-4 my-12"
      aria-labelledby="app-android-seccion"
    >
      <div className="max-w-5xl mx-auto rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center p-8">
          <div className="mx-auto w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-white p-3 shadow-xl">
            <Image
              src="/apple-touch-icon.png"
              alt="App Neurai para Android"
              width={144}
              height={144}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide bg-white/20 rounded-full px-3 py-1 mb-3">
              <Smartphone className="w-3.5 h-3.5" /> App móvil
            </span>
            <h2
              id="app-android-seccion"
              className="text-2xl md:text-3xl font-bold mb-2"
            >
              Descarga la app de Neurai para Android
            </h2>
            <p className="text-white/90 mb-5 max-w-2xl">
              Toda la tienda de Neurai en tu celular: explora el catálogo de
              accesorios, compra de forma segura y lleva el control de tus
              pedidos sin abrir el navegador.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3 mb-6 text-left">
              {beneficios.map((b) => (
                <li key={b.texto} className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5 p-1 rounded-md bg-white/15">
                    {b.icono}
                  </span>
                  <span className="text-sm text-white/95">{b.texto}</span>
                </li>
              ))}
            </ul>

            <BotonPlayStore />
          </div>
        </div>
      </div>
    </section>
  );
}
