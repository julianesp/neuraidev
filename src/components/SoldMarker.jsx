"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Settings, Save, X } from "lucide-react";

const SoldMarker = ({ producto, onToggleSold, showAdmin = true }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customStyles, setCustomStyles] = useState({
    textoVendido: "VENDIDO",
    colorTextoVendido: "#ff4444",
    fondoTextoVendido: "#000000",
    opacidad: 0.6,
    filtro: "grayscale(100%)"
  });

  // Cargar configuración desde localStorage
  useEffect(() => {
    const adminStatus = localStorage.getItem("neuraidev_admin_mode");
    const savedStyles = localStorage.getItem("neuraidev_sold_styles");
    
    if (adminStatus === "true") {
      setIsAdmin(true);
    }
    
    if (savedStyles) {
      setCustomStyles(JSON.parse(savedStyles));
    }
  }, []);

  // Funciones de administrador
  const toggleAdminMode = () => {
    const newAdminStatus = !isAdmin;
    setIsAdmin(newAdminStatus);
    localStorage.setItem("neuraidev_admin_mode", newAdminStatus.toString());
  };

  const handleStyleChange = (field, value) => {
    setCustomStyles(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveStyles = () => {
    localStorage.setItem("neuraidev_sold_styles", JSON.stringify(customStyles));
    setShowSettings(false);
    // Actualizar el producto con los nuevos estilos
    if (producto.vendido) {
      onToggleSold(producto.id, true, customStyles);
    }
  };

  const toggleSoldStatus = () => {
    const newSoldStatus = !producto.vendido;
    const styles = newSoldStatus ? customStyles : null;
    onToggleSold(producto.id, newSoldStatus, styles);
  };

  if (!showAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón para activar/desactivar modo admin */}
      <div className="flex flex-col gap-2">
        {!isAdmin && (
          <button
            onClick={toggleAdminMode}
            className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Activar modo administrador"
          >
            <EyeOff size={20} />
          </button>
        )}

        {isAdmin && (
          <>
            {/* Panel de administrador */}
            <div className="bg-white rounded-lg shadow-xl p-4 mb-2 min-w-[250px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">Panel Admin</h3>
                <button
                  onClick={toggleAdminMode}
                  className="text-gray-500 hover:text-gray-700"
                  title="Desactivar modo administrador"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Información del producto */}
              <div className="mb-3 p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-700">
                  {producto.nombre || producto.title || "Producto sin nombre"}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {producto.id}
                </p>
              </div>

              {/* Toggle de vendido */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Estado: {producto.vendido ? "VENDIDO" : "DISPONIBLE"}
                </span>
                <button
                  onClick={toggleSoldStatus}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    producto.vendido
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {producto.vendido ? "Marcar disponible" : "Marcar vendido"}
                </button>
              </div>

              {/* Botón de configuración */}
              <button
                onClick={() => setShowSettings(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-2"
              >
                <Settings size={16} />
                Configurar estilos
              </button>
            </div>

            {/* Botón de visibilidad */}
            <button
              onClick={toggleAdminMode}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors self-end"
              title="Panel de administrador activo"
            >
              <Eye size={20} />
            </button>
          </>
        )}
      </div>

      {/* Modal de configuración de estilos */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Configurar Estilos de Vendido</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Texto del vendido */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Texto de vendido:
                </label>
                <input
                  type="text"
                  value={customStyles.textoVendido}
                  onChange={(e) => handleStyleChange("textoVendido", e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="VENDIDO"
                />
              </div>

              {/* Color del texto */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Color del texto:
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customStyles.colorTextoVendido}
                    onChange={(e) => handleStyleChange("colorTextoVendido", e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customStyles.colorTextoVendido}
                    onChange={(e) => handleStyleChange("colorTextoVendido", e.target.value)}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Color de fondo */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Color de fondo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customStyles.fondoTextoVendido}
                    onChange={(e) => handleStyleChange("fondoTextoVendido", e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customStyles.fondoTextoVendido}
                    onChange={(e) => handleStyleChange("fondoTextoVendido", e.target.value)}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Opacidad */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Opacidad: {customStyles.opacidad}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={customStyles.opacidad}
                  onChange={(e) => handleStyleChange("opacidad", parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Filtro */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Efecto visual:
                </label>
                <select
                  value={customStyles.filtro}
                  onChange={(e) => handleStyleChange("filtro", e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Sin efecto</option>
                  <option value="grayscale(100%)">Escala de grises</option>
                  <option value="blur(2px)">Desenfoque</option>
                  <option value="sepia(100%)">Sepia</option>
                  <option value="brightness(0.7)">Oscurecer</option>
                  <option value="contrast(0.5)">Bajo contraste</option>
                </select>
              </div>

              {/* Vista previa */}
              <div className="border p-4 rounded bg-gray-50">
                <p className="text-sm font-medium mb-2">Vista previa:</p>
                <div 
                  className="relative inline-block bg-white p-2 rounded"
                  style={{
                    opacity: customStyles.opacidad,
                    filter: customStyles.filtro
                  }}
                >
                  <div
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: customStyles.fondoTextoVendido,
                      color: customStyles.colorTextoVendido
                    }}
                  >
                    {customStyles.textoVendido}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveStyles}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoldMarker;