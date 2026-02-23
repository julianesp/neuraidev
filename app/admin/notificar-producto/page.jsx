"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Search, Bell, CheckCircle, XCircle, Loader } from "lucide-react";

export default function NotificarProductoPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [result, setResult] = useState(null);

  // Cargar productos disponibles
  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/productos?disponible=true');
      const data = await response.json();
      setProductos(data.productos || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendNotification = async () => {
    if (!selectedProduct) return;

    try {
      setSending(true);
      setResult(null);

      const response = await fetch('/api/notifications/send-new-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producto: {
            id: selectedProduct.id,
            nombre: selectedProduct.nombre,
            descripcion: selectedProduct.descripcion,
            precio: selectedProduct.precio,
            categoria: selectedProduct.categoria,
            imagenes: selectedProduct.imagenes,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          enviadas: data.notificaciones_enviadas,
          fallidas: data.notificaciones_fallidas,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Error al enviar notificaciones',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error de conexión: ' + error.message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-12">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver al panel
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center">
              <Bell className="mr-3" size={36} />
              Enviar Notificación de Producto
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Notifica a tus suscriptores sobre un producto específico
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <Bell className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                ℹ️ Acerca de las Notificaciones
              </h3>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                <li>• Los productos nuevos envían notificaciones <strong>automáticamente</strong> al crearse</li>
                <li>• Usa esta herramienta para notificar sobre productos <strong>ya existentes</strong></li>
                <li>• Solo se notificará a suscriptores <strong>activos y confirmados</strong></li>
                <li>• Se respetarán las preferencias de categoría de cada suscriptor</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buscador de productos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Selecciona un Producto
          </h2>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar producto por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Lista de productos */}
          {loading ? (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto mb-2" size={32} />
              <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredProductos.map((producto) => (
                <div
                  key={producto.id}
                  onClick={() => setSelectedProduct(producto)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedProduct?.id === producto.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex gap-3">
                    {producto.imagenes?.[0] && (
                      <img
                        src={producto.imagenes[0]}
                        alt={producto.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {producto.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {producto.categoria}
                      </p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        ${parseFloat(producto.precio).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview y botón de envío */}
        {selectedProduct && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Previsualización del Email
            </h2>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  ¡Nuevo Producto Disponible!
                </h3>

                {selectedProduct.imagenes?.[0] && (
                  <img
                    src={selectedProduct.imagenes[0]}
                    alt={selectedProduct.nombre}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}

                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedProduct.nombre}
                </h4>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {selectedProduct.descripcion || 'Sin descripción'}
                </p>

                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                  ${parseFloat(selectedProduct.precio).toLocaleString('es-CO')}
                </p>

                <div className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Ver Producto →
                </div>
              </div>
            </div>

            {/* Resultado */}
            {result && (
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0" size={24} />
                  )}
                  <div>
                    <p className={`font-semibold ${
                      result.success ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'
                    }`}>
                      {result.message}
                    </p>
                    {result.success && (
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        Enviadas: {result.enviadas} | Fallidas: {result.fallidas}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <button
              onClick={handleSendNotification}
              disabled={sending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {sending ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Enviando Notificaciones...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Notificaciones a Suscriptores
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              Las notificaciones se enviarán solo a suscriptores activos y confirmados que hayan elegido
              recibir notificaciones de todas las categorías o específicamente de "{selectedProduct.categoria}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
