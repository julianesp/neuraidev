"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Star,
} from "lucide-react";

const AnunciosPage = ({ anuncios = [], onEdit, showAdminActions = false }) => {
  const [anunciosList, setAnunciosList] = useState([]);
  const [filteredAnuncios, setFilteredAnuncios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' o 'list'
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "general", label: "General" },
    { value: "restaurant", label: "Restaurante" },
    { value: "shop", label: "Tienda" },
    { value: "service", label: "Servicio" },
    { value: "technology", label: "Tecnología" },
    { value: "health", label: "Salud" },
    { value: "education", label: "Educación" },
    { value: "entertainment", label: "Entretenimiento" },
  ];

  useEffect(() => {
    // Filtrar solo anuncios activos para usuarios normales
    const activeAnuncios = showAdminActions
      ? anuncios
      : anuncios.filter((anuncio) => anuncio.active);

    setAnunciosList(activeAnuncios);
  }, [anuncios, showAdminActions]);

  useEffect(() => {
    let filtered = anunciosList;

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (anuncio) =>
          anuncio.businessName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          anuncio.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (anuncio) => anuncio.category === selectedCategory,
      );
    }

    // Filtrar por destacados
    if (showFeaturedOnly) {
      filtered = filtered.filter((anuncio) => anuncio.featured);
    }

    // Ordenar: destacados primero, luego por fecha
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredAnuncios(filtered);
  }, [anunciosList, searchTerm, selectedCategory, showFeaturedOnly]);

  const handleImageError = (anuncioId) => {
    setImageErrors((prev) => ({
      ...prev,
      [anuncioId]: true,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const AnuncioCard = ({ anuncio }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-100">
        {anuncio.imageUrl && !imageErrors[anuncio.id] ? (
          <Image
            src={anuncio.imageUrl}
            alt={anuncio.businessName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            loading="lazy"
            quality={85}
            onError={() => handleImageError(anuncio.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🏪</div>
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {anuncio.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
              <Star size={12} className="mr-1" />
              Destacado
            </span>
          )}
          {!anuncio.active && showAdminActions && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Inactivo
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {anuncio.businessName}
          </h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {categories.find((cat) => cat.value === anuncio.category)?.label}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden leading-relaxed">
          {anuncio.description}
        </p>

        {/* Información de contacto */}
        <div className="space-y-2 mb-4">
          {anuncio.contactInfo?.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone size={14} className="mr-2 text-green-600" />
              <span>{anuncio.contactInfo.phone}</span>
            </div>
          )}
          {anuncio.contactInfo?.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail size={14} className="mr-2 text-blue-600" />
              <span className="truncate">{anuncio.contactInfo.email}</span>
            </div>
          )}
          {anuncio.contactInfo?.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={14} className="mr-2 text-red-600" />
              <span className="truncate">{anuncio.contactInfo.address}</span>
            </div>
          )}
        </div>

        {/* Fecha */}
        <p className="text-xs text-gray-500 mb-4">
          Publicado: {formatDate(anuncio.createdAt)}
        </p>

        {/* Botones de acción */}
        <div className="flex gap-2">
          {anuncio.linkUrl && (
            <Link
              href={anuncio.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
            >
              <ExternalLink size={14} className="mr-1" />
              Visitar
            </Link>
          )}

          <Link
            href={`/anuncios/${anuncio.id}`}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
          >
            <Eye size={14} className="mr-1" />
            Ver más
          </Link>

          {showAdminActions && onEdit && (
            <button
              onClick={() => onEdit(anuncio)}
              className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center"
            >
              <Edit size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const AnuncioListItem = ({ anuncio }) => (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex gap-6">
        {/* Imagen */}
        <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {anuncio.imageUrl && !imageErrors[anuncio.id] ? (
            <Image
              src={anuncio.imageUrl}
              alt={anuncio.businessName}
              fill
              className="object-cover"
              sizes="128px"
              priority={false}
              loading="lazy"
              quality={85}
              onError={() => handleImageError(anuncio.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-2xl mb-1">🏪</div>
                <p className="text-xs">Sin imagen</p>
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-800">
              {anuncio.businessName}
            </h3>
            <div className="flex gap-2">
              {anuncio.featured && (
                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
                  <Star size={12} className="mr-1" />
                  Destacado
                </span>
              )}
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {
                  categories.find((cat) => cat.value === anuncio.category)
                    ?.label
                }
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{anuncio.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {anuncio.contactInfo?.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone size={14} className="mr-2 text-green-600" />
                <span>{anuncio.contactInfo.phone}</span>
              </div>
            )}
            {anuncio.contactInfo?.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail size={14} className="mr-2 text-blue-600" />
                <span>{anuncio.contactInfo.email}</span>
              </div>
            )}
            {anuncio.contactInfo?.address && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-2 text-red-600" />
                <span>{anuncio.contactInfo.address}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Publicado: {formatDate(anuncio.createdAt)}
            </p>

            <div className="flex gap-2">
              {anuncio.linkUrl && (
                <Link
                  href={anuncio.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                >
                  <ExternalLink size={14} className="mr-1" />
                  Visitar
                </Link>
              )}

              <Link
                href={`/anuncios/${anuncio.id}`}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm"
              >
                <Eye size={14} className="mr-1" />
                Ver más
              </Link>

              {showAdminActions && onEdit && (
                <button
                  onClick={() => onEdit(anuncio)}
                  className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center"
                >
                  <Edit size={14} className="mr-1" />
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (anunciosList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-gray-50 rounded-lg shadow-inner">
          <div className="text-gray-400 text-6xl mb-4">📢</div>
          <p className="text-gray-600 text-xl font-light">
            No hay anuncios disponibles
          </p>
          <p className="text-gray-500 mt-2">
            Vuelve más tarde para ver nuevas publicaciones
          </p>
          {showAdminActions && (
            <Link
              href="/admin/anuncios/crear"
              className="inline-flex items-center mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Crear primer anuncio
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Directorio de Negocios
          <div className="h-1 w-20 bg-blue-600 mx-auto mt-2 rounded-full"></div>
        </h1>

        {showAdminActions && (
          <div className="flex justify-center mb-6">
            <Link
              href="/admin/anuncios/crear"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Nuevo Anuncio
            </Link>
          </div>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar negocios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <label className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={showFeaturedOnly}
              onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Solo destacados
            </span>
          </label>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 flex items-center justify-center py-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              <Grid size={16} className="mr-1" />
              Tarjetas
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 flex items-center justify-center py-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              <List size={16} className="mr-1" />
              Lista
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Mostrando {filteredAnuncios.length} de {anunciosList.length} anuncios
        </p>
      </div>

      {/* Lista de anuncios */}
      {filteredAnuncios.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Filter className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">
            No se encontraron anuncios con los filtros seleccionados
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAnuncios.map((anuncio) => (
            <AnuncioCard key={anuncio.id} anuncio={anuncio} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAnuncios.map((anuncio) => (
            <AnuncioListItem key={anuncio.id} anuncio={anuncio} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnunciosPage;
