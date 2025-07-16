"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, X, Save, Eye, ImageIcon } from "lucide-react";

const AnuncioForm = ({ onSubmit, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    businessName: initialData?.businessName || "",
    description: initialData?.description || "",
    linkUrl: initialData?.linkUrl || "",
    imageUrl: initialData?.imageUrl || "",
    category: initialData?.category || "general",
    active: initialData?.active !== undefined ? initialData.active : true,
    featured: initialData?.featured || false,
    contactInfo: {
      phone: initialData?.contactInfo?.phone || "",
      email: initialData?.contactInfo?.email || "",
      address: initialData?.contactInfo?.address || "",
    },
  });

  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { value: "general", label: "General" },
    { value: "restaurant", label: "Restaurante" },
    { value: "shop", label: "Tienda" },
    { value: "service", label: "Servicio" },
    { value: "technology", label: "Tecnología" },
    { value: "health", label: "Salud" },
    { value: "education", label: "Educación" },
    { value: "entertainment", label: "Entretenimiento" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones básicas
      if (!formData.businessName.trim()) {
        alert("El nombre del negocio es requerido");
        return;
      }

      if (!formData.description.trim()) {
        alert("La descripción es requerida");
        return;
      }

      const anuncioData = {
        ...formData,
        id: isEditing ? initialData.id : Date.now().toString(),
        createdAt: isEditing ? initialData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSubmit(anuncioData);

      if (!isEditing) {
        // Limpiar formulario después de crear
        setFormData({
          businessName: "",
          description: "",
          linkUrl: "",
          imageUrl: "",
          category: "general",
          active: true,
          featured: false,
          contactInfo: { phone: "", email: "", address: "" },
        });
        setImagePreview("");
      }
    } catch (error) {
      console.error("Error al guardar anuncio:", error);
      alert("Error al guardar el anuncio. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const AnuncioPreview = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm">
      <div className="relative h-48 bg-gray-100">
        {imagePreview && !imageError ? (
          <Image
            src={imagePreview}
            alt={formData.businessName || "Preview"}
            fill
            className="object-cover p-2"
            onError={handleImageError}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="text-gray-400" size={48} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          {formData.businessName || "Nombre del negocio"}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          {formData.description || "Descripción del anuncio..."}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {categories.find((cat) => cat.value === formData.category)?.label}
          </span>
          {formData.featured && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Destacado
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Upload className="mr-3" size={24} />
            {isEditing ? "Editar Anuncio" : "Crear Nuevo Anuncio"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información Principal */}
            <div className="space-y-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Negocio *
                </label>
                <input
                  id="businessName"
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Restaurante El Buen Sabor"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe tu negocio, productos o servicios..."
                  required
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.description.length}/500
                </div>
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Imagen
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleImageUrlChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace Web (Opcional)
                </label>
                <input
                  id="linkUrl"
                  type="url"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://tu-sitio-web.com"
                />
              </div>
            </div>

            {/* Información de Contacto y Vista Previa */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Información de Contacto
                </h3>

                <div className="space-y-4">
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Teléfono"
                  />

                  <input
                    type="email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email"
                  />

                  <input
                    type="text"
                    name="contactInfo.address"
                    value={formData.contactInfo.address}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Dirección"
                  />
                </div>
              </div>

              {/* Opciones */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Opciones
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Anuncio activo
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Anuncio destacado
                    </span>
                  </label>
                </div>
              </div>

              {/* Vista Previa */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Vista Previa
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <Eye size={16} className="mr-1" />
                    {showPreview ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                {showPreview && <AnuncioPreview />}
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {isEditing ? "Actualizar" : "Crear"} Anuncio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnuncioForm;
