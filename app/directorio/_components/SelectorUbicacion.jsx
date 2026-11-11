"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin, Trash2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { CENTRO_MUNICIPIO } from "@/lib/directorio/constantes";

const CENTRO_PUTUMAYO = [1.0, -76.65];

// Mapa para marcar la ubicación exacta del negocio: toca el mapa, arrastra el
// pin o usa "mi ubicación actual". Devuelve { lat, lng } con onChange.
export default function SelectorUbicacion({ municipio, lat, lng, onChange }) {
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const pin = useRef(null);
  const L = useRef(null);
  const alCambiar = useRef(onChange);
  alCambiar.current = onChange;
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState("");

  const colocar = (la, ln, centrar = true) => {
    if (!L.current || !mapa.current) return;
    const punto = [la, ln];
    if (!pin.current) {
      const icono = L.current.divIcon({
        className: "",
        html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.45);transform:rotate(-45deg)"></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });
      pin.current = L.current.marker(punto, { draggable: true, icon: icono }).addTo(mapa.current);
      pin.current.on("dragend", () => {
        const p = pin.current.getLatLng();
        alCambiar.current({ lat: p.lat, lng: p.lng });
      });
    } else {
      pin.current.setLatLng(punto);
    }
    if (centrar) mapa.current.setView(punto, Math.max(mapa.current.getZoom(), 17));
  };

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const leaflet = (await import("leaflet")).default;
      if (cancelado || !contenedor.current || mapa.current) return;
      L.current = leaflet;
      const centro = lat != null && lng != null ? [lat, lng] : CENTRO_MUNICIPIO[municipio] || CENTRO_PUTUMAYO;
      const m = leaflet.map(contenedor.current, { scrollWheelZoom: false }).setView(centro, lat != null ? 17 : 15);
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        })
        .addTo(m);
      mapa.current = m;
      if (lat != null && lng != null) colocar(lat, lng, false);
      m.on("click", (e) => {
        colocar(e.latlng.lat, e.latlng.lng, false);
        alCambiar.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    })();
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      pin.current = null;
    };
    // El mapa se crea una sola vez; los cambios posteriores se manejan abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si cambia el municipio y aún no hay pin, el mapa se acerca al nuevo municipio.
  useEffect(() => {
    if (mapa.current && lat == null && CENTRO_MUNICIPIO[municipio]) {
      mapa.current.setView(CENTRO_MUNICIPIO[municipio], 15);
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
    pin.current?.remove();
    pin.current = null;
    onChange({ lat: null, lng: null });
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={usarMiUbicacion}
          disabled={buscando}
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
      <div
        ref={contenedor}
        className="relative z-0 h-72 w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700"
        aria-label="Mapa para marcar la ubicación del negocio"
      />
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
