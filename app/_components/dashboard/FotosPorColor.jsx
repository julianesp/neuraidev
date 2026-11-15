"use client";

const urlDe = (img) => (typeof img === "object" && img ? img.url : img) || "";

/**
 * A cada color del producto se le asigna una de sus fotos y sus unidades.
 * En la ficha pública, al elegir el color, la galería salta a esa foto (y el
 * carrito la usa); un color sin unidades sale agotado. Al venderse se
 * descuenta del color vendido.
 */
export default function FotosPorColor({
  colores = [],
  imagenes = [],
  value = {},
  onChange,
  stock = {}, // { color: unidades }
  onStockChange,
}) {
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Unidades y foto de cada color</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Escribe cuántas unidades hay de cada color (el stock total será la suma) y toca la foto
          que corresponde. Cuando el cliente elija ese color, verá esa foto; si llega a 0, sale agotado.
        </p>
      </div>

      {colores.map((color) => (
          <div key={color}>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {color}
                {fotos.length > 0 && !value[color] && (
                  <span className="text-gray-400 font-normal"> · sin foto asignada</span>
                )}
              </p>
              {onStockChange && (
                <label className="ml-auto flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  Unidades
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={stock[color] ?? ""}
                    placeholder="—"
                    onChange={(e) => {
                      const nuevo = { ...stock };
                      if (e.target.value === "") delete nuevo[color];
                      else nuevo[color] = Math.max(parseInt(e.target.value, 10) || 0, 0);
                      onStockChange(nuevo);
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </label>
              )}
            </div>
            {fotos.length === 0 ? (
              color === colores[0] && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sube las fotos del producto en «Imágenes adicionales» para asignar una a cada color.
                </p>
              )
            ) : (
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
            )}
          </div>
      ))}
    </div>
  );
}
