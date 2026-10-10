"use client";

import { useEffect, useRef, useState } from "react";
import { ScanBarcode, X } from "lucide-react";

const FORMATOS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf"];

// BarcodeDetector nativo (Chrome Android) o el polyfill zxing (Safari/iPhone).
// El WASM se sirve desde /zxing para no depender de un CDN externo (CSP).
async function crearDetector() {
  if (typeof window !== "undefined" && "BarcodeDetector" in window) {
    const soportados = await window.BarcodeDetector.getSupportedFormats();
    const formats = FORMATOS.filter((f) => soportados.includes(f));
    if (formats.length > 0) return new window.BarcodeDetector({ formats });
  }
  const { BarcodeDetector, prepareZXingModule } = await import("barcode-detector/ponyfill");
  prepareZXingModule({
    overrides: {
      locateFile: (path, prefix) =>
        path.endsWith(".wasm") ? "/zxing/zxing_reader.wasm" : prefix + path,
    },
  });
  return new BarcodeDetector({ formats: FORMATOS });
}

export default function BarcodeScannerInput({ id, name, value, onChange, className }) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!abierto) return;
    let stream = null;
    let timer = null;
    let cancelado = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelado) return;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        const detector = await crearDetector();
        const escanear = async () => {
          if (cancelado) return;
          try {
            const codigos = await detector.detect(video);
            if (codigos.length > 0) {
              navigator.vibrate?.(100);
              onChangeRef.current({ target: { name, value: codigos[0].rawValue } });
              setAbierto(false);
              return;
            }
          } catch {
            // Frame aún no listo; reintentar
          }
          timer = setTimeout(escanear, 250);
        };
        escanear();
      } catch (e) {
        setError(
          e?.name === "NotAllowedError"
            ? "Permiso de cámara denegado. Actívalo en la configuración del navegador."
            : "No se pudo abrir la cámara.",
        );
      }
    })();

    return () => {
      cancelado = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [abierto, name]);

  return (
    <>
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          name={name}
          value={value}
          onChange={onChange}
          placeholder="Ej: 7702004003454"
          className={className}
        />
        <button
          type="button"
          onClick={() => {
            setError("");
            setAbierto(true);
          }}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium whitespace-nowrap"
        >
          <ScanBarcode className="w-4 h-4" />
          Escanear
        </button>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white"
            aria-label="Cerrar escáner"
          >
            <X className="w-6 h-6" />
          </button>
          {error ? (
            <p className="text-white text-center max-w-sm">{error}</p>
          ) : (
            <>
              <div className="relative w-full max-w-md">
                <video ref={videoRef} playsInline muted className="w-full rounded-lg" />
                <div className="absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.7)]" />
              </div>
              <p className="mt-4 text-white/80 text-sm text-center">
                Apunta al código de barras del empaque
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
