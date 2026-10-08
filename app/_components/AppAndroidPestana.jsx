"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.neurai";

// localStorage: fecha en que el usuario cerró el aviso con la X. El aviso
// vuelve a aparecer al día siguiente, hasta que se detecte la app instalada.
const STORAGE_KEY = "neurai-app-android-no-mostrar";
// localStorage: la app ya se detectó instalada; no se vuelve a mostrar.
const INSTALADA_KEY = "neurai-app-android-instalada";

const hoy = () => new Date().toLocaleDateString("en-CA"); // AAAA-MM-DD local

function cerradoHoy() {
  const valor = localStorage.getItem(STORAGE_KEY);
  if (!valor) return false;
  const fecha = new Date(valor);
  return !Number.isNaN(fecha.getTime()) && fecha.toLocaleDateString("en-CA") === hoy();
}

// Chrome Android: true si la app com.neurai está instalada (requiere
// related_applications en el manifest y asset_statements en la app).
async function appInstalada() {
  try {
    if (!("getInstalledRelatedApps" in navigator)) return false;
    const apps = await navigator.getInstalledRelatedApps();
    return apps.some((app) => app.id === "com.neurai");
  } catch {
    return false;
  }
}

function LogoPlay() {
  return (
    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#34A853" d="M3.6 1.8 13.8 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1Z" />
      <path fill="#FBBC04" d="m17.2 8.6-3.4 3.4 3.4 3.4 3.9-2.2c.8-.5.8-1.7 0-2.2l-3.9-2.4Z" />
      <path fill="#4285F4" d="M3.6 22.2 13.8 12l3.4 3.4L5.1 22.3c-.5.3-1.1.2-1.5-.1Z" />
      <path fill="#EA4335" d="M3.6 1.8c.4-.3 1-.4 1.5-.1l12.1 6.9-3.4 3.4L3.6 1.8Z" />
    </svg>
  );
}

/**
 * Aviso discreto de la app Android: una pestaña en el borde izquierdo donde
 * solo asoma medio logo. Al tocarla se despliega el botón de Google Play y una
 * X que oculta el aviso por el resto del día. Deja de mostrarse del todo
 * cuando se detecta la app instalada. Igual en todas las resoluciones.
 */
export default function AppAndroidPestana() {
  const [visible, setVisible] = useState(false);
  const [abierta, setAbierta] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        if (localStorage.getItem(INSTALADA_KEY) || cerradoHoy()) return;
        if (await appInstalada()) {
          localStorage.setItem(INSTALADA_KEY, new Date().toISOString());
          return;
        }
        if (!cancelado) setVisible(true);
      } catch {
        // Sin acceso al almacenamiento: no mostramos nada antes que molestar.
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  // Tocar fuera o Escape la vuelve a plegar (sin ocultarla para siempre).
  useEffect(() => {
    if (!abierta) return;
    const fuera = (e) => ref.current && !ref.current.contains(e.target) && setAbierta(false);
    const escape = (e) => e.key === "Escape" && setAbierta(false);
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierta]);

  const cerrarPorHoy = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div ref={ref} className="fixed left-0 top-1/2 -translate-y-1/2 z-[9990]">
      {/* Plegada: medio logo asomando desde el borde */}
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-expanded={abierta}
        aria-label="Ver la app de Neurai para Android"
        className={`block w-14 h-14 rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-black/10 -translate-x-1/2 transition-[transform,opacity] duration-300 hover:-translate-x-[40%] ${
          abierta ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Image src="/apple-touch-icon.png" alt="" width={56} height={56} className="w-full h-full object-contain" />
      </button>

      {/* Desplegada: botón de Google Play + X */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-r-2xl bg-white dark:bg-gray-900 py-2 pl-2 pr-2 shadow-xl ring-1 ring-black/10 dark:ring-white/10 transition-[transform,opacity] duration-300 ${
          abierta ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
        }`}
        aria-hidden={!abierta}
      >
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={abierta ? 0 : -1}
          aria-label="Descargar la app de Neurai en Google Play"
          className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white rounded-xl px-3 py-2 border border-white/20 whitespace-nowrap"
        >
          <LogoPlay />
          <span className="flex flex-col leading-tight text-left">
            <span className="text-[9px] uppercase tracking-wide opacity-80">Disponible en</span>
            <span className="text-sm font-semibold">Google Play</span>
          </span>
        </a>
        <button
          type="button"
          onClick={cerrarPorHoy}
          tabIndex={abierta ? 0 : -1}
          aria-label="Ocultar el aviso de la app por hoy"
          title="Ocultar por hoy"
          className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
