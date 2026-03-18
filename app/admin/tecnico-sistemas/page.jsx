"use client";

import { useState, useEffect, useRef } from "react";
import { GripVertical, Save, RotateCcw, Images, CheckCircle, Eye } from "lucide-react";
import Link from "next/link";

// ── Fotos originales por sección ──────────────────────────────────────────────

const FOTOS_ORIGINALES = {
  computer_1: [
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_092927.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_094612.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_094843.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_101702.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_101707.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_110601.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_111738.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_111741.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_114122.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174452.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174459.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174506.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174519.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174524.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_174531.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_1/IMG_20260117_175456.jpg",
  ],
  computer_2: [
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_100716.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_100731.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_113531.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_115352.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_115404.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_115637.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_115656.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_120552.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_120739.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_124002.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20250612_124011.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20251106_194446.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20251106_194524.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20251106_194608.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_2/IMG_20251106_194612.jpg",
  ],
  computer_3: [
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194617.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194624.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194857.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194903.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194918.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194931.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_194938.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200633.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200643.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200707.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200734.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_200745.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_201100.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_201135.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_201139.jpg",
    "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/images/computer_3/IMG_20251106_202001.jpg",
  ],
};

const STORAGE_KEY = "tecnico_sistemas_orden_fotos";
const SECCIONES = [
  { key: "computer_1", label: "Caso 1 — Computador 1", color: "from-blue-500 to-blue-600" },
  { key: "computer_2", label: "Caso 2 — Computador 2", color: "from-purple-500 to-purple-600" },
  { key: "computer_3", label: "Caso 3 — Computador 3", color: "from-indigo-500 to-indigo-600" },
];

// ── Componente de una foto arrastrable ────────────────────────────────────────

function FotoItem({ url, index, seccionKey, onDragStart, onDragOver, onDrop, isDraggingOver }) {
  const nombre = url.split("/").pop();
  const [previewPos, setPreviewPos] = useState(null);

  const PREVIEW_W = 380;
  const PREVIEW_H = 280;
  const GAP = 14;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceRight = vw - rect.right - GAP;
    const spaceLeft  = rect.left - GAP;

    // Elegir lado: derecha si cabe, izquierda si no
    let left, width;
    if (spaceRight >= PREVIEW_W) {
      left  = rect.right + GAP;
      width = PREVIEW_W;
    } else if (spaceLeft >= PREVIEW_W) {
      left  = rect.left - GAP - PREVIEW_W;
      width = PREVIEW_W;
    } else {
      // Encajar en el lado con más espacio, reduciendo el ancho
      if (spaceRight >= spaceLeft) {
        left  = rect.right + GAP;
        width = Math.max(180, spaceRight - GAP);
      } else {
        width = Math.max(180, spaceLeft - GAP);
        left  = rect.left - GAP - width;
      }
    }

    // Centrar verticalmente, sin salir del viewport
    const imgH = width * (PREVIEW_H / PREVIEW_W);
    let top = rect.top + rect.height / 2 - imgH / 2 - 24; // 24 = footer aprox
    top = Math.max(8, Math.min(top, vh - imgH - 48));

    setPreviewPos({ top, left, width });
  };

  const handleMouseLeave = () => setPreviewPos(null);

  return (
    <>
      <div
        draggable
        onDragStart={() => { handleMouseLeave(); onDragStart(seccionKey, index); }}
        onDragOver={(e) => { e.preventDefault(); onDragOver(seccionKey, index); }}
        onDrop={() => onDrop(seccionKey, index)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`flex items-center gap-3 bg-white dark:bg-gray-800 border rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all select-none
          ${isDraggingOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md scale-[1.01]"
            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-sm"
          }`}
      >
        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs font-bold text-gray-400 w-5 text-center flex-shrink-0">
          {index + 1}
        </span>
        <img
          src={url}
          alt={nombre}
          className="w-14 h-10 object-cover rounded flex-shrink-0"
          loading="lazy"
        />
        <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1 font-mono">
          {nombre}
        </span>
      </div>

      {/* Preview fija — posición y tamaño calculados dinámicamente */}
      {previewPos && (
        <div
          className="pointer-events-none fixed z-[9999]"
          style={{ top: previewPos.top, left: previewPos.left, width: previewPos.width }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden">
            <img
              src={url}
              alt={nombre}
              style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
            />
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                {nombre}
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0">
                #{index + 1}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sección con lista de fotos ────────────────────────────────────────────────

function SeccionFotos({ seccion, fotos, onDragStart, onDragOver, onDrop, draggingOver }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className={`h-2 bg-gradient-to-r ${seccion.color}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${seccion.color}`}>
              <Images className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{seccion.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{fotos.length} fotos — arrastra para reordenar</p>
            </div>
          </div>
        </div>

        {/* Lista de fotos */}
        <div className="flex flex-col gap-1.5 max-h-[480px] overflow-y-auto pr-1">
          {fotos.map((url, idx) => (
            <FotoItem
              key={url}
              url={url}
              index={idx}
              seccionKey={seccion.key}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              isDraggingOver={draggingOver?.seccion === seccion.key && draggingOver?.index === idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminTecnicoSistemas() {
  const [orden, setOrden] = useState(null); // null = cargando
  const [guardado, setGuardado] = useState(false);
  const dragging = useRef(null); // { seccion, index }
  const [draggingOver, setDraggingOver] = useState(null); // { seccion, index }

  // Cargar orden guardado o usar el original
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setOrden(JSON.parse(saved));
      } else {
        setOrden({ ...FOTOS_ORIGINALES });
      }
    } catch {
      setOrden({ ...FOTOS_ORIGINALES });
    }
  }, []);

  const handleDragStart = (seccion, index) => {
    dragging.current = { seccion, index };
  };

  const handleDragOver = (seccion, index) => {
    if (!dragging.current) return;
    setDraggingOver({ seccion, index });
  };

  const handleDrop = (seccion, targetIndex) => {
    if (!dragging.current) return;
    const { seccion: fromSeccion, index: fromIndex } = dragging.current;

    // Solo reordenar dentro de la misma sección
    if (fromSeccion !== seccion || fromIndex === targetIndex) {
      dragging.current = null;
      setDraggingOver(null);
      return;
    }

    setOrden((prev) => {
      const fotos = [...prev[seccion]];
      const [moved] = fotos.splice(fromIndex, 1);
      fotos.splice(targetIndex, 0, moved);
      return { ...prev, [seccion]: fotos };
    });

    dragging.current = null;
    setDraggingOver(null);
    setGuardado(false);
  };

  const handleGuardar = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orden));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const handleReset = (seccionKey) => {
    setOrden((prev) => ({ ...prev, [seccionKey]: [...FOTOS_ORIGINALES[seccionKey]] }));
    setGuardado(false);
  };

  if (!orden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Galería — Técnico en Sistemas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Arrastra las fotos para cambiar el orden en que aparecen en la página pública
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/servicios/tecnico-sistemas"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              Ver página
            </Link>

            <button
              onClick={handleGuardar}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all
                ${guardado
                  ? "bg-green-500 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                }`}
            >
              {guardado ? (
                <><CheckCircle className="w-4 h-4" /> Guardado</>
              ) : (
                <><Save className="w-4 h-4" /> Guardar orden</>
              )}
            </button>
          </div>
        </div>

        {/* Aviso */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
          <span className="text-lg leading-none">💡</span>
          <span>
            El orden que guardes aquí se aplicará inmediatamente en{" "}
            <strong>/servicios/tecnico-sistemas</strong>. Cada sección es independiente.
          </span>
        </div>
      </div>

      {/* Secciones */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {SECCIONES.map((seccion) => (
          <div key={seccion.key}>
            <SeccionFotos
              seccion={seccion}
              fotos={orden[seccion.key]}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              draggingOver={draggingOver}
            />
            {/* Reset individual */}
            <button
              onClick={() => handleReset(seccion.key)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer orden original
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
