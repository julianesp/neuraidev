"use client";

import { useEffect, useState } from "react";
import { Search, Link as LinkIcon, Save, X, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function PaymentLinksPage() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [paymentLinkTemporal, setPaymentLinkTemporal] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (busqueda.trim() === "") {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.id.toLowerCase().includes(busqueda.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    }
  }, [busqueda, productos]);

  async function cargarProductos() {
    try {
      setLoading(true);
      const response = await fetch("/api/productos/payment-links");
      const data = await response.json();

      if (response.ok) {
        setProductos(data.productos);
        setProductosFiltrados(data.productos);
      } else {
        mostrarMensaje("Error al cargar productos", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error al cargar productos", "error");
    } finally {
      setLoading(false);
    }
  }

  function iniciarEdicion(producto) {
    setEditando(producto.id);
    setPaymentLinkTemporal(producto.payment_link || "");
  }

  function cancelarEdicion() {
    setEditando(null);
    setPaymentLinkTemporal("");
  }

  async function guardarPaymentLink(productoId) {
    try {
      setGuardando(true);
      const response = await fetch("/api/productos/payment-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productoId,
          paymentLink: paymentLinkTemporal.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar el producto en el estado local
        setProductos((prev) =>
          prev.map((p) =>
            p.id === productoId
              ? { ...p, payment_link: paymentLinkTemporal.trim() || null }
              : p
          )
        );
        mostrarMensaje(data.message, "success");
        cancelarEdicion();
      } else {
        mostrarMensaje(data.error || "Error al guardar", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error al guardar el payment link", "error");
    } finally {
      setGuardando(false);
    }
  }

  function mostrarMensaje(texto, tipo) {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 5000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const productosConLink = productos.filter((p) => p.payment_link);
  const productosSinLink = productos.filter((p) => !p.payment_link);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestionar Payment Links
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configura los enlaces de pago de Nequi/Wompi para cada producto
        </p>
      </div>

      {/* Mensaje de éxito/error */}
      {mensaje && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            mensaje.tipo === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {mensaje.tipo === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Productos</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {productos.length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm p-4">
          <div className="text-sm text-green-600 dark:text-green-400">Con Payment Link</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {productosConLink.length}
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-sm p-4">
          <div className="text-sm text-orange-600 dark:text-orange-400">Sin Payment Link</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {productosSinLink.length}
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Link
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {productosFiltrados.map((producto) => (
                <tr
                  key={producto.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Producto */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {producto.imagen_url && (
                        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {producto.nombre}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {producto.categoria}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
                          {producto.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Precio */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${producto.precio?.toLocaleString("es-CO")}
                    </div>
                  </td>

                  {/* Payment Link */}
                  <td className="px-4 py-4">
                    {editando === producto.id ? (
                      <input
                        type="url"
                        value={paymentLinkTemporal}
                        onChange={(e) => setPaymentLinkTemporal(e.target.value)}
                        placeholder="https://checkout.nequi.wompi.co/l/..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={guardando}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {producto.payment_link ? (
                          <>
                            <LinkIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <a
                              href={producto.payment_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate dark:text-blue-400"
                            >
                              {producto.payment_link}
                            </a>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            Sin configurar
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editando === producto.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => guardarPaymentLink(producto.id)}
                          disabled={guardando}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 dark:hover:bg-green-900/20"
                          title="Guardar"
                        >
                          {guardando ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          disabled={guardando}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 dark:hover:bg-gray-700"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => iniciarEdicion(producto)}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {producto.payment_link ? "Editar" : "Agregar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron productos con esos criterios de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Ayuda */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          ℹ️ Cómo funciona
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Los payment links se obtienen desde tu panel de Wompi/Nequi Negocios</li>
          <li>• Puedes usar el mismo link para productos con el mismo precio</li>
          <li>• Los clientes verán el botón de Nequi solo si todos los productos del carrito tienen el mismo payment link</li>
          <li>• Puedes eliminar un payment link dejando el campo vacío y guardando</li>
        </ul>
      </div>
    </div>
  );
}
