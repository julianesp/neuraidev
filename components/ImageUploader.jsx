"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";

export default function ImageUploader({
  value,
  onChange,
  label = "Imagen",
  multiple = false
}) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

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

        // Verificar si la respuesta es JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Error de autenticación. Por favor, recarga la página e inicia sesión nuevamente.");
        }

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

      // Mostrar mensaje de error más amigable
      const errorMessage = error.message || "Error desconocido";
      if (errorMessage.includes("autenticación") || errorMessage.includes("sesión")) {
        alert(
          "⚠️ Error de sesión\n\n" +
          "No se pudo verificar tu sesión. Esto puede pasar en dispositivos móviles.\n\n" +
          "Soluciones:\n" +
          "1. Recarga la página (desliza hacia abajo)\n" +
          "2. Cierra sesión y vuelve a iniciar\n" +
          "3. Si persiste, usa una computadora\n" +
          "4. También puedes agregar la URL de la imagen manualmente abajo"
        );
      } else {
        alert("❌ Error subiendo imagen\n\n" + errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput || urlInput.trim() === '') {
      alert("Por favor ingresa una URL válida");
      return;
    }

    if (multiple) {
      onChange(value ? [...value, urlInput.trim()] : [urlInput.trim()]);
    } else {
      onChange(urlInput.trim());
    }

    setUrlInput(""); // Limpiar el input después de agregar
  };

  const removeImage = (urlToRemove) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(url => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  const imageUrls = multiple ? (value || []) : (value ? [value] : []);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Botón de subida */}
      <div className="flex items-center gap-3">
        <label className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

      {/* Vista previa de imágenes */}
      {imageUrls.length > 0 && (
        <div className={`grid ${multiple ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-3`}>
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input manual de URL */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <label htmlFor="manual-url-input" className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
          O ingresa URL manualmente:
        </label>
        <div className="flex gap-2">
          <input
            id="manual-url-input"
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
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
          Presiona Enter o clic en &quot;Agregar&quot; para {multiple ? "agregar más imágenes" : "confirmar la URL"}
        </p>
      </div>
    </div>
  );
}
