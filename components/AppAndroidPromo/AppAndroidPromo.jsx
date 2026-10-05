"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

// localStorage: el usuario pidió no volver a ver el anuncio (o fue a instalarla)
const STORAGE_KEY = "neurai-app-android-anuncio-oculto";
// sessionStorage: ya se mostró en esta sesión, no repetir en cada visita al home
const SESSION_KEY = "neurai-app-android-anuncio-sesion";

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
 * Anuncio emergente de la app. Se muestra una vez por sesión de navegación
 * hasta que el usuario marca "No volver a mostrar" o pulsa para ir a Play
 * Store. Se renderiza en un portal sobre document.body para quedar por
 * encima de carruseles y demás capas del home.
 */
export function AppAndroidModal() {
  const [visible, setVisible] = useState(false);
  const [noVolver, setNoVolver] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // Sin acceso al almacenamiento (modo privado estricto): no molestamos
      return;
    }

    // Pequeño retraso para no competir con la carga inicial del home
    const t = setTimeout(() => {
      setVisible(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const cerrar = (ocultarSiempre) => {
    if (ocultarSiempre) {
      try {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      } catch {}
    }
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => e.key === "Escape" && cerrar(noVolver);
    window.addEventListener("keydown", onKey);
    // Evita que el home se desplace por detrás del anuncio
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [visible, noVolver]);

  if (!visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      style={{ zIndex: 2147483000 }}
      onClick={() => cerrar(noVolver)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-android-titulo"
    >
      <div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 to-purple-700 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => cerrar(noVolver)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          aria-label="Cerrar anuncio"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Toda la tarjeta lleva a Play Store; quien va a instalarla no
            necesita volver a ver el anuncio */}
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => cerrar(true)}
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

        <div className="flex items-center justify-between gap-4 px-6 pb-5">
          <label className="flex items-center gap-2 text-sm text-white/85 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={noVolver}
              onChange={(e) => setNoVolver(e.target.checked)}
              className="w-4 h-4 rounded accent-white cursor-pointer"
            />
            No volver a mostrar
          </label>
          <button
            onClick={() => cerrar(noVolver)}
            className="text-sm font-semibold bg-white/15 hover:bg-white/25 rounded-lg px-4 py-2 transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>,
    document.body,
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
