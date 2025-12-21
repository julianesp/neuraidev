"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon, Plus, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Componente para cada imagen ordenable
function SortableImage({ id, url, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden"
    >
      {/* Indicador de posición */}
      <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
        {index + 1}
      </div>

      {/* Handle para arrastrar */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 bg-gray-800/80 hover:bg-gray-900 text-white p-2 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        title="Arrastra para reordenar"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Imagen */}
      <div className="aspect-square">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`Imagen ${index + 1}`}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Botón para eliminar */}
      <button
        type="button"
        onClick={() => onRemove(url)}
        className="absolute bottom-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        title="Eliminar imagen"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function SortableImageUploader({
  value,
  onChange,
  label = "Imagen",
  multiple = false,
  compact = false, // Nueva prop para mostrar versión compacta
}) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error subiendo imagen");
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (multiple) {
        onChange(value ? [...value, ...uploadedUrls] : uploadedUrls);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error subiendo imagen: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput || urlInput.trim() === "") {
      alert("Por favor ingresa una URL válida");
      return;
    }

    if (multiple) {
      onChange(value ? [...value, urlInput.trim()] : [urlInput.trim()]);
    } else {
      onChange(urlInput.trim());
    }

    setUrlInput("");
  };

  const removeImage = (urlToRemove) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((url) => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const imageUrls = multiple ? value || [] : value ? [value] : [];
      const oldIndex = imageUrls.indexOf(active.id);
      const newIndex = imageUrls.indexOf(over.id);

      const newOrder = arrayMove(imageUrls, oldIndex, newIndex);
      onChange(newOrder);
    }
  };

  const imageUrls = multiple ? value || [] : value ? [value] : [];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Botón de subida */}
      <div className="flex items-center gap-3">
        <label
          className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {multiple ? "Subir imágenes" : "Subir imagen"}
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {multiple && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Máximo 5 imágenes, 4MB cada una
          </span>
        )}
      </div>

      {/* Vista previa de imágenes con drag and drop */}
      {imageUrls.length > 0 && (
        <>
          {multiple && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                Arrastra las imágenes para cambiar su orden. La primera imagen será la principal.
              </p>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={imageUrls} strategy={verticalListSortingStrategy}>
              <div
                className={`grid ${
                  multiple
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : compact
                      ? "grid-cols-2 md:grid-cols-3"
                      : "grid-cols-1"
                } gap-4 ${compact && !multiple ? "max-w-md" : ""}`}
              >
                {imageUrls.map((url, index) => (
                  <SortableImage
                    key={url}
                    id={url}
                    url={url}
                    index={index}
                    onRemove={removeImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      {/* Input manual de URL */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <label
          htmlFor="manual-url-input"
          className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400"
        >
          O ingresa URL manualmente:
        </label>
        <div className="flex gap-2">
          <input
            id="manual-url-input"
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Presiona Enter o clic en &quot;Agregar&quot; para{" "}
          {multiple ? "agregar más imágenes" : "confirmar la URL"}
        </p>
      </div>
    </div>
  );
}
