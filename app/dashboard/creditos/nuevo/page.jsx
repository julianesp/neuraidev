"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function NuevoCreditoPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    nombre_cliente: "",
    email_cliente: "",
    telefono_cliente: "",
    cedula_cliente: "",
    cantidad: 1,
    dias_plazo: 30,
    notas: "",
  });

  useEffect(() => {
    if (user) {
      cargarProductos();
    }
  }, [user]);

  async function cargarProductos() {
    try {
      const response = await fetch("/api/productos");
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function seleccionarProducto(producto) {
    setProductoSeleccionado(producto);
    setBusquedaProducto("");
  }

  function calcularMontoTotal() {
    if (!productoSeleccionado) return 0;
    return productoSeleccionado.precio * formData.cantidad;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!productoSeleccionado) {
      Swal.fire({
        icon: "warning",
        title: "Producto requerido",
        text: "Debes seleccionar un producto",
      });
      return;
    }

    const montoTotal = calcularMontoTotal();

    const creditoData = {
      ...formData,
      producto_id: productoSeleccionado.id,
      producto_nombre: productoSeleccionado.nombre,
      producto_precio: productoSeleccionado.precio,
      cantidad: parseInt(formData.cantidad),
      monto_total: montoTotal,
      dias_plazo: parseInt(formData.dias_plazo),
    };

    try {
      setLoading(true);

      const response = await fetch("/api/creditos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creditoData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Crédito creado!",
          text: "El crédito se ha registrado exitosamente",
          timer: 2000,
        });
        router.push("/dashboard/creditos");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error creando crédito:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear el crédito",
      });
    } finally {
      setLoading(false);
    }
  }

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.sku?.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <Link
        href="/dashboard/creditos"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a créditos
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Registrar Nuevo Crédito
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información del Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre_cliente"
                  value={formData.nombre_cliente}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email_cliente"
                  value={formData.email_cliente}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="juan@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono_cliente"
                  value={formData.telefono_cliente}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="+57 300 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cédula
                </label>
                <input
                  type="text"
                  name="cedula_cliente"
                  value={formData.cedula_cliente}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="1234567890"
                />
              </div>
            </div>
          </div>

          {/* Selección de Producto */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Producto
            </h2>

            {!productoSeleccionado ? (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {busquedaProducto && (
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-60 overflow-y-auto">
                    {productosFiltrados.length === 0 ? (
                      <p className="p-4 text-center text-gray-500">
                        No se encontraron productos
                      </p>
                    ) : (
                      productosFiltrados.map((producto) => (
                        <button
                          key={producto.id}
                          type="button"
                          onClick={() => seleccionarProducto(producto)}
                          className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">
                            {producto.nombre}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            SKU: {producto.sku} | Precio: ${Number(producto.precio).toLocaleString('es-CO')}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {productoSeleccionado.nombre}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      SKU: {productoSeleccionado.sku}
                    </p>
                    <p className="text-lg font-semibold text-blue-600 mt-2">
                      ${Number(productoSeleccionado.precio).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductoSeleccionado(null)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cantidad y Plazo */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detalles del Crédito
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Días de plazo *
                </label>
                <input
                  type="number"
                  name="dias_plazo"
                  value={formData.dias_plazo}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fecha límite: {new Date(Date.now() + formData.dias_plazo * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>
          </div>

          {/* Monto Total */}
          {productoSeleccionado && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Monto Total:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ${calcularMontoTotal().toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas adicionales
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Información adicional sobre el crédito..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !productoSeleccionado}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Creando..." : "Crear Crédito"}
            </button>
            <Link
              href="/dashboard/creditos"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
