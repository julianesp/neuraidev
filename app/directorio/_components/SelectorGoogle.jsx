"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin, Trash2 } from "lucide-react";
import { CENTRO_MUNICIPIO } from "@/lib/directorio/constantes";

const CENTRO_PUTUMAYO = { lat: 1.0, lng: -76.65 };
let promesaGoogle = null;

// Carga la API de Google Maps una sola vez para toda la página.
function cargarGoogleMaps(clave) {
  if (typeof window === "undefined") return Promise.reject(new Error("sin ventana"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (promesaGoogle) return promesaGoogle;
  promesaGoogle = new Promise((resolve, reject) => {
    window.__gmapsListo = () => resolve(window.google.maps);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(clave)}&v=weekly&language=es&region=CO&callback=__gmapsListo`;
    script.async = true;
    script.onerror = () => {
      promesaGoogle = null;
      reject(new Error("No se pudo cargar Google Maps"));
    };
    document.head.appendChild(script);
  });
  return promesaGoogle;
}

// Mapa de Google para marcar la ubicación exacta del negocio: toca el mapa,
// arrastra el pin o usa "mi ubicación actual". Devuelve { lat, lng } con onChange.
export default function SelectorGoogle({ clave, municipio, lat, lng, onChange }) {
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const pin = useRef(null);
  const alCambiar = useRef(onChange);
  alCambiar.current = onChange;
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState("");

  const colocar = (la, ln, centrar = true) => {
    const punto = { lat: la, lng: ln };
    if (!pin.current) {
      pin.current = new window.google.maps.Marker({ position: punto, map: mapa.current, draggable: true });
      pin.current.addListener("dragend", () => {
        const p = pin.current.getPosition();
        alCambiar.current({ lat: p.lat(), lng: p.lng() });
      });
    } else {
      pin.current.setPosition(punto);
      pin.current.setMap(mapa.current);
    }
    if (centrar) {
      mapa.current.panTo(punto);
      if (mapa.current.getZoom() < 17) mapa.current.setZoom(17);
    }
  };

  useEffect(() => {
    let cancelado = false;
    // Si la clave es inválida o la API no está habilitada, Google llama a esta función.
    window.gm_authFailure = () => !cancelado && setEstado("error");
    cargarGoogleMaps(clave)
      .then((maps) => {
        if (cancelado || !contenedor.current) return;
        const [cla, clo] = CENTRO_MUNICIPIO[municipio] || [CENTRO_PUTUMAYO.lat, CENTRO_PUTUMAYO.lng];
        const centro = lat != null && lng != null ? { lat, lng } : { lat: cla, lng: clo };
        mapa.current = new maps.Map(contenedor.current, {
          center: centro,
          zoom: lat != null ? 17 : 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: "cooperative",
        });
        if (lat != null && lng != null) colocar(lat, lng, false);
        mapa.current.addListener("click", (e) => {
          colocar(e.latLng.lat(), e.latLng.lng(), false);
          alCambiar.current({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
        setEstado("listo");
      })
      .catch(() => !cancelado && setEstado("error"));
    return () => {
      cancelado = true;
      mapa.current = null;
      pin.current = null;
    };
    // El mapa se crea una sola vez; los cambios posteriores se manejan abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si cambia el municipio y aún no hay pin, el mapa se acerca al nuevo municipio.
  useEffect(() => {
    if (mapa.current && lat == null && CENTRO_MUNICIPIO[municipio]) {
      const [cla, clo] = CENTRO_MUNICIPIO[municipio];
      mapa.current.setCenter({ lat: cla, lng: clo });
      mapa.current.setZoom(15);
    }
  }, [municipio, lat]);

  const usarMiUbicacion = () => {
    setAviso("");
    if (!navigator.geolocation) return setAviso("Tu navegador no permite obtener la ubicación.");
    setBuscando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscando(false);
        colocar(pos.coords.latitude, pos.coords.longitude);
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setBuscando(false);
        setAviso("No pudimos obtener tu ubicación. Toca el mapa para marcar el lugar.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const quitar = () => {
    pin.current?.setMap(null);
    pin.current = null;
    onChange({ lat: null, lng: null });
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={usarMiUbicacion}
          disabled={buscando || estado !== "listo"}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium !text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
          Usar mi ubicación actual
        </button>
        {lat != null && (
          <button
            type="button"
            onClick={quitar}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:border-gray-900 dark:border-gray-700 dark:text-gray-200"
          >
            <Trash2 className="h-4 w-4" /> Quitar pin
          </button>
        )}
      </div>
      <div className="relative h-72 w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
        <div ref={contenedor} className="h-full w-full" aria-label="Mapa de Google para marcar la ubicación del negocio" />
        {estado === "cargando" && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando mapa…
          </div>
        )}
        {estado === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-gray-700 dark:text-gray-300">
            No se pudo cargar Google Maps. Guarda el negocio sin el pin y vuelve a intentarlo más tarde.
          </div>
        )}
      </div>
      <p className="mt-1.5 flex items-start gap-1 text-xs text-gray-600 dark:text-gray-400">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {lat != null
          ? "Pin colocado. Puedes arrastrarlo para ajustarlo."
          : "Toca el mapa en el lugar de tu negocio para colocar el pin."}
      </p>
      {aviso && <p className="mt-1 text-xs text-red-700">{aviso}</p>}
    </div>
  );
}
