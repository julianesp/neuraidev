"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import styles from "./GlobalSearch.module.scss";
import Link from "next/link";

/**
 * Componente de búsqueda global contextual
 * Se adapta al contenido de cada página automáticamente
 */
export default function GlobalSearch() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Determinar el contexto de búsqueda según la ruta actual
  const getSearchContext = () => {
    // Página de blog - buscar en artículos
    if (pathname.includes("/blog")) {
      return {
        files: [],
        placeholder: "Buscar artículos del blog...",
        category: "blog",
        searchType: "blog",
      };
    }

    // Página de servicios - buscar en servicios
    if (pathname.includes("/servicios")) {
      return {
        files: [],
        placeholder: "Buscar servicios...",
        category: "servicios",
        searchType: "services",
      };
    }

    // Página de inicio - buscar en todo
    if (pathname === "/") {
      return {
        files: [
          "celulares.json",
          "computadoras.json",
          "damas.json",
          "libros-nuevos.json",
          "libros-usados.json",
          "generales.json",
          "accesoriosDestacados.json",
          "productosRecientes.json",
        ],
        placeholder: "Buscar productos, artículos, servicios...",
        category: "all",
        searchType: "all",
      };
    }

    // Páginas específicas de categorías
    if (pathname.includes("/celulares")) {
      return {
        files: ["celulares.json"],
        placeholder: "Buscar accesorios para celulares...",
        category: "celulares",
      };
    }

    if (pathname.includes("/computadoras")) {
      return {
        files: ["computadoras.json"],
        placeholder: "Buscar accesorios para computadoras...",
        category: "computadoras",
      };
    }

    if (pathname.includes("/damas")) {
      return {
        files: ["damas.json"],
        placeholder: "Buscar accesorios para damas...",
        category: "damas",
      };
    }

    if (pathname.includes("/belleza")) {
      return {
        files: ["belleza.json"],
        placeholder: "Buscar productos de belleza...",
        category: "belleza",
      };
    }

    if (pathname.includes("/libros-nuevos")) {
      return {
        files: ["libros-nuevos.json"],
        placeholder: "Buscar libros nuevos...",
        category: "libros-nuevos",
      };
    }

    if (pathname.includes("/libros-usados")) {
      return {
        files: ["libros-usados.json"],
        placeholder: "Buscar libros usados...",
        category: "libros-usados",
      };
    }

    if (pathname.includes("/generales")) {
      return {
        files: ["generales.json"],
        placeholder: "Buscar productos generales...",
        category: "generales",
      };
    }

    // Página de accesorios general
    if (pathname.includes("/accesorios")) {
      return {
        files: [
          "celulares.json",
          "computadoras.json",
          "damas.json",
          "libros-nuevos.json",
          "libros-usados.json",
          "generales.json",
        ],
        placeholder: "Buscar productos...",
        category: "accesorios",
      };
    }

    // Página de destacados
    if (pathname.includes("/destacados")) {
      return {
        files: ["accesoriosDestacados.json"],
        placeholder: "Buscar en destacados...",
        category: "destacados",
      };
    }

    // Página de nuevos
    if (pathname.includes("/nuevos")) {
      return {
        files: ["productosRecientes.json"],
        placeholder: "Buscar en nuevos productos...",
        category: "nuevos",
      };
    }

    // Por defecto, buscar en todo
    return {
      files: [
        "celulares.json",
        "computadoras.json",
        "damas.json",
        "libros-nuevos.json",
        "libros-usados.json",
        "generales.json",
      ],
      placeholder: "Buscar productos...",
      category: "all",
    };
  };

  const context = getSearchContext();

  // Cargar productos/artículos/servicios según el contexto
  useEffect(() => {
    const loadContent = async () => {
      const items = [];

      // Si es búsqueda de blog
      if (context.searchType === "blog" || context.searchType === "all") {
        try {
          const response = await fetch("/blog-articles.json");
          if (response.ok) {
            const data = await response.json();
            const articles = data.articles || [];
            const articlesWithType = articles.map((article) => ({
              ...article,
              itemType: "blog",
              nombre: article.title,
              descripcion: article.excerpt,
              categoria: article.category,
            }));
            items.push(...articlesWithType);
          }
        } catch (error) {
          console.error("Error cargando artículos del blog:", error);
        }
      }

      // Si es búsqueda de servicios
      if (context.searchType === "services" || context.searchType === "all") {
        try {
          const response = await fetch("/services.json");
          if (response.ok) {
            const data = await response.json();
            const services = data.services || [];
            const servicesWithType = services.map((service) => ({
              ...service,
              itemType: "service",
              nombre: service.title,
              descripcion: service.description,
            }));
            items.push(...servicesWithType);
          }
        } catch (error) {
          console.error("Error cargando servicios:", error);
        }
      }

      // Si es búsqueda de productos
      if (context.searchType !== "blog" && context.searchType !== "services") {
        for (const file of context.files) {
          try {
            const response = await fetch(`/${file}`);
            if (!response.ok) continue;

            const data = await response.json();
            const productList = data.accesorios || data.productos || [];

            const productsWithCategory = productList.map((product) => ({
              ...product,
              sourceFile: file.replace(".json", ""),
              itemType: "product",
            }));

            items.push(...productsWithCategory);
          } catch (error) {
            console.error(`Error cargando ${file}:`, error);
          }
        }
      }

      setAllProducts(items);
    };

    if (isOpen) {
      loadContent();
    }
  }, [isOpen, pathname]);

  // Función de búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);

    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    const results = allProducts.filter((product) => {
      const searchLower = term.toLowerCase();
      return (
        product.nombre?.toLowerCase().includes(searchLower) ||
        product.descripcion?.toLowerCase().includes(searchLower) ||
        product.categoria?.toLowerCase().includes(searchLower) ||
        (product.id && String(product.id).toLowerCase().includes(searchLower))
      );
    });

    setSearchResults(results.slice(0, 10)); // Limitar a 10 resultados
    setIsSearching(false);
  };

  // Obtener URL del item (producto, artículo o servicio)
  const getItemUrl = (item) => {
    // Si es artículo del blog
    if (item.itemType === "blog") {
      return `/blog/${item.slug}`;
    }

    // Si es servicio
    if (item.itemType === "service") {
      return item.url || `/servicios/${item.id}`;
    }

    // Si es producto
    let categoria = item.categoria || item.sourceFile;

    if (
      categoria === "accesoriosDestacados" ||
      categoria === "productosRecientes"
    ) {
      categoria = item.categoria || "celulares";
    }

    return `/accesorios/${categoria}/${item.id}`;
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Auto-focus cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Función para solicitar producto
  const handleRequestProduct = () => {
    const message = `Hola, estoy buscando: "${searchTerm}" pero no lo encontré en el catálogo. ¿Podrían ayudarme a conseguirlo?`;
    const whatsappUrl = `https://wa.me/573174503604?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className={styles.globalSearch} ref={searchRef}>
      {/* Botón de búsqueda con lupa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.searchButton}
        aria-label="Abrir búsqueda"
      >
        <Search className={`${styles.searchIcon} dark:bg-white`} size={30} />
      </button>

      {/* Modal de búsqueda */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />

          {/* Panel de búsqueda */}
          <div className={styles.searchPanel}>
            {/* Barra de búsqueda */}
            <div className={styles.searchInputWrapper}>
              <Search className={styles.inputIcon} size={20} />
              <input
                ref={inputRef}
                type="text"
                placeholder={context.placeholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                className={styles.closeButton}
                aria-label="Cerrar búsqueda"
              >
                <X size={20} />
              </button>
            </div>

            {/* Resultados */}
            <div className={styles.resultsContainer}>
              {isSearching ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <p>Buscando...</p>
                </div>
              ) : searchTerm && searchResults.length > 0 ? (
                <>
                  <div className={styles.resultsHeader}>
                    {searchResults.length} resultado
                    {searchResults.length !== 1 ? "s" : ""} encontrado
                    {searchResults.length !== 1 ? "s" : ""}
                  </div>
                  <div className={styles.resultsList}>
                    {searchResults.map((item, index) => {
                      const getItemImage = () => {
                        if (item.itemType === "blog") {
                          return (
                            item.image ||
                            "https://placehold.co/400x400/3b82f6/ffffff?text=Blog"
                          );
                        }
                        if (item.itemType === "service") {
                          return "https://placehold.co/400x400/8b5cf6/ffffff?text=Servicio";
                        }
                        return (
                          item.imagenPrincipal ||
                          item.imagenes?.[0]?.url ||
                          "https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"
                        );
                      };

                      const getItemTypeLabel = () => {
                        if (item.itemType === "blog") return "📝 Artículo";
                        if (item.itemType === "service") return "⚙️ Servicio";
                        return item.categoria || item.sourceFile;
                      };

                      return (
                        <Link
                          key={`${item.itemType}-${item.id || item.slug}-${index}`}
                          href={getItemUrl(item)}
                          className={styles.resultItem}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className={styles.productImage}>
                            <Image
                              src={getItemImage()}
                              alt={item.nombre}
                              width={60}
                              height={60}
                              className={styles.image}
                            />
                          </div>
                          <div className={styles.productInfo}>
                            <h4 className={styles.productName}>
                              {item.nombre}
                            </h4>
                            <p className={styles.productDescription}>
                              {item.descripcion?.substring(0, 80)}...
                            </p>
                            <div className={styles.productMeta}>
                              <span className={styles.productCategory}>
                                {getItemTypeLabel()}
                              </span>
                              {item.precio && (
                                <span className={styles.productPrice}>
                                  ${item.precio.toLocaleString("es-CO")}
                                </span>
                              )}
                              {item.readTime && (
                                <span className={styles.readTime}>
                                  {item.readTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : searchTerm && searchResults.length === 0 ? (
                <div className={styles.noResults}>
                  <div className={styles.noResultsIcon}>
                    <Search size={48} />
                  </div>
                  <h4>No se encontraron resultados</h4>
                  <p>
                    No encontramos &quot;{searchTerm}&quot; en{" "}
                    {context.category === "all"
                      ? "el catálogo"
                      : `la categoría de ${context.category}`}
                    .
                  </p>
                  <button
                    onClick={handleRequestProduct}
                    className={styles.requestButton}
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Solicitar este producto por WhatsApp
                  </button>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Search size={48} />
                  <p>Comienza a escribir para buscar productos...</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
