"use client";

const urlDe = (img) => (typeof img === "object" && img ? img.url : img) || "";

/**
 * A cada color del producto se le asigna una de sus fotos. En la ficha
 * pública, al elegir el color, la galería salta a esa foto (y el carrito
 * muestra esa misma foto).
 */
export default function FotosPorColor({ colores = [], imagenes = [], value = {}, onChange }) {
  const fotos = [...new Set(imagenes.map(urlDe).filter((u) => u && u.trim()))];
  if (!colores.length) return null;

  const asignar = (color, url) => {
    const nuevo = { ...value };
    if (!url || nuevo[color] === url) delete nuevo[color];
    else nuevo[color] = url;
    onChange(nuevo);
  };

  return (
    <div className="mt-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Foto de cada color</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Toca la foto que corresponde a cada color. Cuando el cliente elija ese color, verá esa foto.
        </p>
      </div>

      {fotos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Primero sube las fotos del producto en «Imágenes adicionales».
        </p>
      ) : (
        colores.map((color) => (
          <div key={color}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {color}
              {!value[color] && <span className="text-gray-400 font-normal"> · sin foto asignada</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {fotos.map((url, i) => {
                const activa = value[color] === url;
                return (
                  <button
                    key={url}
                    type="button"
                    onClick={() => asignar(color, url)}
                    aria-pressed={activa}
                    aria-label={`Usar foto ${i + 1} para ${color}`}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      activa
                        ? "border-blue-600 ring-2 ring-blue-600 shadow-md"
                        : "border-gray-200 dark:border-gray-600 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
