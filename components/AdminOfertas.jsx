"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
  Calendar,
  Percent,
  Package,
  X,
  Check,
  Filter,
  Layers,
} from "lucide-react";

export default function AdminOfertas() {
  const [ofertas, setOfertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOferta, setEditingOferta] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    porcentaje_descuento: "",
    productos_ids: [],
    fecha_inicio: "",
    fecha_fin: "",
    activa: true,
    tipo_oferta: "individual", // "individual" o "combo"
  });

  const [searchProducto, setSearchProducto] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar ofertas
      const resOfertas = await fetch("/api/ofertas");
      const dataOfertas = await resOfertas.json();
      setOfertas(dataOfertas.ofertas || []);

      // Cargar productos
      const resProductos = await fetch("/api/productos");
      const dataProductos = await resProductos.json();
      const prods = dataProductos.productos || [];

      console.log("🔍 Productos cargados:", prods.length);
      if (prods.length > 0) {
        console.log("📦 Ejemplo de producto:", prods[0]);
      }

      setProductos(prods);

      // Extraer categorías únicas de los productos
      const categoriasUnicas = [
        ...new Set(prods.map((p) => p.categoria).filter(Boolean)),
      ];
      setCategorias(categoriasUnicas.sort());
      console.log("📂 Categorías encontradas:", categoriasUnicas);

      // Cargar estadísticas
      const resStats = await fetch("/api/ofertas/estadisticas");
      const dataStats = await resStats.json();
      setEstadisticas(dataStats);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (oferta = null) => {
    if (oferta) {
      setEditingOferta(oferta);
      setFormData({
        nombre: oferta.nombre,
        descripcion: oferta.descripcion || "",
        porcentaje_descuento: oferta.porcentaje_descuento,
        productos_ids: oferta.productos_ids || [],
        fecha_inicio: oferta.fecha_inicio
          ? new Date(oferta.fecha_inicio).toISOString().slice(0, 16)
          : "",
        fecha_fin: oferta.fecha_fin
          ? new Date(oferta.fecha_fin).toISOString().slice(0, 16)
          : "",
        activa: oferta.activa,
        tipo_oferta: oferta.tipo_oferta || "individual",
      });
      setSelectedProducts(
        productos.filter((p) => oferta.productos_ids?.includes(p.id)),
      );
    } else {
      setEditingOferta(null);
      setFormData({
        nombre: "",
        descripcion: "",
        porcentaje_descuento: "",
        productos_ids: [],
        fecha_inicio: "",
        fecha_fin: "",
        activa: true,
        tipo_oferta: "individual",
      });
      setSelectedProducts([]);
    }
    setCategoriaFiltro("todas");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingOferta(null);
    setSearchProducto("");
    setCategoriaFiltro("todas");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      productos_ids: selectedProducts.map((p) => p.id),
      porcentaje_descuento: parseFloat(formData.porcentaje_descuento),
    };

    try {
      const url = editingOferta
        ? `/api/ofertas/${editingOferta.id}`
        : "/api/ofertas";

      const method = editingOferta ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        await cargarDatos();
        cerrarModal();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error guardando oferta:", error);
      alert("Error guardando oferta");
    }
  };

  const eliminarOferta = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta oferta?")) return;

    try {
      const res = await fetch(`/api/ofertas/${id}`, { method: "DELETE" });
      if (res.ok) {
        await cargarDatos();
      }
    } catch (error) {
      console.error("Error eliminando oferta:", error);
    }
  };

  const toggleOferta = async (id, activa) => {
    try {
      const res = await fetch(`/api/ofertas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !activa }),
      });

      if (res.ok) {
        await cargarDatos();
      }
    } catch (error) {
      console.error("Error cambiando estado de oferta:", error);
    }
  };

  const agregarProducto = (producto) => {
    if (!selectedProducts.find((p) => p.id === producto.id)) {
      setSelectedProducts([...selectedProducts, producto]);
    }
    setSearchProducto("");
  };

  const quitarProducto = (productoId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productoId));
  };

  const agregarTodaCategoria = () => {
    if (categoriaFiltro === "todas") {
      alert("Selecciona una categoría específica primero");
      return;
    }

    const productosCategoria = productos.filter(
      (p) => p.categoria === categoriaFiltro,
    );
    const nuevosProductos = productosCategoria.filter(
      (pc) => !selectedProducts.find((sp) => sp.id === pc.id),
    );

    setSelectedProducts([...selectedProducts, ...nuevosProductos]);
  };

  // Filtrar productos por búsqueda y categoría
  const productosFiltrados = productos
    .filter((p) => {
      // Filtro de categoría
      if (categoriaFiltro !== "todas" && p.categoria !== categoriaFiltro) {
        return false;
      }
      // Filtro de búsqueda
      if (searchProducto) {
        const busqueda = searchProducto.toLowerCase();
        const match =
          p.title?.toLowerCase().includes(busqueda) ||
          p.nombre?.toLowerCase().includes(busqueda) ||
          p.sku?.toLowerCase().includes(busqueda) ||
          p.descripcion?.toLowerCase().includes(busqueda);

        // Debug temporal
        if (searchProducto.length <= 3 && match) {
          console.log("✅ Match encontrado:", {
            title: p.title,
            nombre: p.nombre,
            sku: p.sku,
          });
        }

        return match;
      }
      return true;
    })
    .slice(0, 20);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const esVigente = (oferta) => {
    const ahora = new Date();
    const inicio = new Date(oferta.fecha_inicio);
    const fin = new Date(oferta.fecha_fin);
    return oferta.activa && ahora >= inicio && ahora <= fin;
  };

  // Obtener imagen del producto
  const getProductoImagen = (producto) => {
    // Intentar obtener la primera imagen del producto
    const imagen =
      producto.imagen ||
      producto.image ||
      producto.images?.[0] ||
      producto.imagenes?.[0] ||
      null;

    return imagen;
  };

  // Obtener emoji de categoría (fallback)
  const getEmojiCategoria = (categoria) => {
    const emojis = {
      celulares: "📱",
      computadoras: "💻",
      generales: "🔧",
      belleza: "💄",
      "libros-nuevos": "📚",
      "libros-usados": "📖",
      damas: "👗",
    };
    return emojis[categoria] || "📦";
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando ofertas...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Ofertas</h1>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Oferta
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold text-gray-800">
              {estadisticas.total}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-green-600 text-sm">Vigentes</p>
            <p className="text-2xl font-bold text-green-700">
              {estadisticas.vigentes}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <p className="text-blue-600 text-sm">Activas</p>
            <p className="text-2xl font-bold text-blue-700">
              {estadisticas.activas}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-yellow-600 text-sm">Futuras</p>
            <p className="text-2xl font-bold text-yellow-700">
              {estadisticas.futuras}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-red-600 text-sm">Expiradas</p>
            <p className="text-2xl font-bold text-red-700">
              {estadisticas.expiradas}
            </p>
          </div>
        </div>
      )}

      {/* Lista de ofertas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Descuento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Productos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vigencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ofertas.map((oferta) => (
              <tr
                key={oferta.id}
                className={!oferta.activa ? "opacity-50" : ""}
              >
                <td className="px-6 py-4">
                  {esVigente(oferta) ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Vigente
                    </span>
                  ) : oferta.activa &&
                    new Date(oferta.fecha_inicio) > new Date() ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Próxima
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      Inactiva
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {oferta.nombre}
                    </p>
                    {oferta.descripcion && (
                      <p className="text-sm text-gray-500">
                        {oferta.descripcion}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {oferta.tipo_oferta === "combo" ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 flex items-center gap-1 w-fit">
                      <Layers size={12} />
                      Combo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Individual
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-green-600">
                    {oferta.porcentaje_descuento}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">
                    {oferta.productos_ids?.length || 0} productos
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex flex-col gap-1">
                    <span>Inicio: {formatearFecha(oferta.fecha_inicio)}</span>
                    <span>Fin: {formatearFecha(oferta.fecha_fin)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleOferta(oferta.id, oferta.activa)}
                      className={`p-2 rounded ${oferta.activa ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                      title={oferta.activa ? "Desactivar" : "Activar"}
                    >
                      {oferta.activa ? <X size={16} /> : <Check size={16} />}
                    </button>
                    <button
                      onClick={() => abrirModal(oferta)}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => eliminarOferta(oferta.id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ofertas.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hay ofertas creadas. Crea una nueva oferta para comenzar.
          </div>
        )}
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm pt-8">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingOferta ? "Editar Oferta" : "Nueva Oferta"}
                </h2>
                <button
                  onClick={cerrarModal}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de oferta */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Oferta
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipo_oferta"
                        value="individual"
                        checked={formData.tipo_oferta === "individual"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tipo_oferta: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <span className="font-medium">Individual</span>
                        <p className="text-xs text-gray-600">
                          Descuento aplicado a productos individuales
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipo_oferta"
                        value="combo"
                        checked={formData.tipo_oferta === "combo"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tipo_oferta: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-purple-600"
                      />
                      <div>
                        <span className="font-medium flex items-center gap-1">
                          <Layers size={16} />
                          Combo/Agrupado
                        </span>
                        <p className="text-xs text-gray-600">
                          Descuento al comprar productos juntos (ej: Mouse +
                          Teclado)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Oferta *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      formData.tipo_oferta === "combo"
                        ? "Ej: Combo Mouse + Teclado 15%"
                        : "Ej: Descuento de Verano"
                    }
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder={
                      formData.tipo_oferta === "combo"
                        ? "Ej: Compra el mouse y teclado juntos y ahorra 15%"
                        : "Descripción opcional de la oferta"
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Porcentaje de descuento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porcentaje de Descuento * (1-100)
                    </label>
                    <div className="relative">
                      <Percent
                        className="absolute left-3 top-3 text-gray-400"
                        size={20}
                      />
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        step="0.01"
                        value={formData.porcentaje_descuento}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            porcentaje_descuento: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="15"
                      />
                    </div>
                  </div>

                  {/* Estado activa */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="activa"
                      checked={formData.activa}
                      onChange={(e) =>
                        setFormData({ ...formData, activa: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="activa"
                      className="text-sm font-medium text-gray-700"
                    >
                      Oferta activa
                    </label>
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Inicio *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.fecha_inicio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fecha_inicio: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Fin *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.fecha_fin}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha_fin: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Selección de productos */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {formData.tipo_oferta === "combo" ? (
                      <span className="flex items-center gap-2">
                        <Layers size={18} />
                        Productos del Combo *
                        <span className="text-xs text-purple-600 font-normal">
                          (Selecciona los productos que deben comprarse juntos)
                        </span>
                      </span>
                    ) : (
                      <span>Productos en Oferta *</span>
                    )}
                  </label>

                  {/* Filtro por categoría */}
                  <div className="mb-3 flex gap-2 items-center">
                    <Filter size={18} className="text-gray-400" />
                    <select
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="todas">📦 Todas las categorías</option>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                          {getEmojiCategoria(cat)} {cat}
                        </option>
                      ))}
                    </select>

                    {categoriaFiltro !== "todas" && (
                      <button
                        type="button"
                        onClick={agregarTodaCategoria}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        + Agregar toda categoría
                      </button>
                    )}
                  </div>

                  {/* Buscador de productos */}
                  <div className="relative mb-2">
                    <Package
                      className="absolute left-3 top-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      value={searchProducto}
                      onChange={(e) => setSearchProducto(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Buscar producto por nombre o SKU..."
                    />
                  </div>

                  {/* Lista de resultados */}
                  {searchProducto && (
                    <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto mb-3 bg-white">
                      {productosFiltrados.length > 0 ? (
                        productosFiltrados.map((producto) => (
                          <div
                            key={producto.id}
                            onClick={() => agregarProducto(producto)}
                            className={`p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors text-black ${
                              selectedProducts.find(
                                (sp) => sp.id === producto.id,
                              )
                                ? "bg-green-50"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                {/* Imagen del producto */}
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                  {getProductoImagen(producto) ? (
                                    <img
                                      src={getProductoImagen(producto)}
                                      alt={producto.title || producto.nombre || 'Producto'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="w-full h-full flex items-center justify-center text-2xl"
                                    style={{ display: getProductoImagen(producto) ? 'none' : 'flex' }}
                                  >
                                    {getEmojiCategoria(producto.categoria)}
                                  </div>
                                </div>

                                {/* Info del producto */}
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-black">
                                    {producto.title || producto.nombre || producto.name || 'Sin nombre'}
                                  </p>
                                  <div className="flex gap-3 text-xs text-black mt-1">
                                    <span>SKU: {producto.sku || 'N/A'}</span>
                                    <span>Categoría: {producto.categoria || 'N/A'}</span>
                                    <span className="font-semibold text-green-600">
                                      ${(producto.price || producto.precio || 0).toLocaleString("es-CO")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {selectedProducts.find(
                                (sp) => sp.id === producto.id,
                              ) && (
                                <Check size={18} className="text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-gray-500 text-center">
                          No se encontraron productos con "{searchProducto}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Productos seleccionados */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[120px] bg-gray-50">
                    {selectedProducts.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        {formData.tipo_oferta === "combo"
                          ? "No hay productos en el combo. Selecciona los productos que formarán el combo."
                          : "No hay productos seleccionados. Busca y selecciona productos arriba."}
                      </p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">
                            {formData.tipo_oferta === "combo"
                              ? `Productos del Combo (${selectedProducts.length})`
                              : `Productos Seleccionados (${selectedProducts.length})`}
                          </p>
                          {formData.tipo_oferta === "combo" &&
                            selectedProducts.length > 0 && (
                              <p className="text-xs text-purple-600">
                                💡 Estos productos deben comprarse juntos para
                                obtener el descuento
                              </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedProducts.map((producto) => (
                            <div
                              key={producto.id}
                              className="bg-white border border-gray-200 px-3 py-2 rounded-lg flex items-center justify-between text-sm hover:shadow-sm"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {/* Imagen del producto */}
                                <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                  {getProductoImagen(producto) ? (
                                    <img
                                      src={getProductoImagen(producto)}
                                      alt={producto.title || producto.nombre || 'Producto'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="w-full h-full flex items-center justify-center text-lg"
                                    style={{ display: getProductoImagen(producto) ? 'none' : 'flex' }}
                                  >
                                    {getEmojiCategoria(producto.categoria)}
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {producto.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ${producto.price?.toLocaleString("es-CO")}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => quitarProducto(producto.id)}
                                className="ml-2 p-1 hover:bg-red-100 rounded-full text-red-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Resumen del descuento */}
                        {formData.porcentaje_descuento &&
                          selectedProducts.length > 0 && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm font-medium text-green-800 mb-1">
                                {formData.tipo_oferta === "combo"
                                  ? "Resumen del Combo:"
                                  : "Resumen de Descuentos:"}
                              </p>
                              <div className="text-xs space-y-1">
                                {formData.tipo_oferta === "combo" ? (
                                  <>
                                    <p className="text-gray-700">
                                      Precio total: $
                                      {selectedProducts
                                        .reduce(
                                          (sum, p) => sum + (p.price || 0),
                                          0,
                                        )
                                        .toLocaleString("es-CO")}
                                    </p>
                                    <p className="text-green-700 font-semibold">
                                      Con {formData.porcentaje_descuento}% OFF:
                                      $
                                      {(
                                        selectedProducts.reduce(
                                          (sum, p) => sum + (p.price || 0),
                                          0,
                                        ) *
                                        (1 -
                                          formData.porcentaje_descuento / 100)
                                      ).toLocaleString("es-CO")}
                                    </p>
                                    <p className="text-green-600">
                                      Ahorro total: $
                                      {(
                                        selectedProducts.reduce(
                                          (sum, p) => sum + (p.price || 0),
                                          0,
                                        ) *
                                        (formData.porcentaje_descuento / 100)
                                      ).toLocaleString("es-CO")}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-gray-700">
                                    {selectedProducts.length} producto(s) con{" "}
                                    {formData.porcentaje_descuento}% de
                                    descuento
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={selectedProducts.length === 0}
                  >
                    {editingOferta ? "Actualizar Oferta" : "Crear Oferta"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
