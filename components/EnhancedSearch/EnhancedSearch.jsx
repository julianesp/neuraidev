"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "./EnhancedSearch.module.scss";

export default function EnhancedSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();
  const debounceTimer = useRef(null);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Búsqueda con debounce
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Buscar en productos
      const { searchProducts } = await import("@/lib/productService");
      const products = await searchProducts(searchQuery, 6);

      setResults(products.map(product => ({
        type: 'product',
        id: product.id,
        name: product.nombre,
        slug: product.slug,
        price: product.precio,
        image: Array.isArray(product.imagenes) ? product.imagenes[0] : product.imagenes,
        category: product.categoria
      })));
    } catch (error) {
      console.error("Error en búsqueda:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Manejar cambios en el input con debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Establecer nuevo timer
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleResultClick = (result) => {
    setShowResults(false);
    setQuery("");
    router.push(`/accesorios/${result.category}/${result.slug}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div ref={searchRef} className={styles.searchContainer}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Buscar productos, categorías..."
            className={styles.searchInput}
            onFocus={() => query && setShowResults(true)}
          />
          {isSearching && (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>
      </form>

      {/* Resultados de búsqueda */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.resultsDropdown}
          >
            <div className={styles.resultsHeader}>
              <span className={styles.resultsCount}>
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ul className={styles.resultsList}>
              {results.map((result) => (
                <li
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={styles.resultItem}
                >
                  <div className={styles.resultImage}>
                    <Image
                      src={result.image || '/placeholder.png'}
                      alt={result.name}
                      width={40}
                      height={40}
                      className={styles.productImage}
                    />
                  </div>
                  <div className={styles.resultInfo}>
                    <span className={styles.resultName}>{result.name}</span>
                    <span className={styles.resultCategory}>{result.category}</span>
                  </div>
                  <span className={styles.resultPrice}>
                    ${result.price?.toLocaleString('es-CO')}
                  </span>
                </li>
              ))}
            </ul>
            <div className={styles.resultsFooter}>
              <button
                onClick={handleSearchSubmit}
                className={styles.viewAllButton}
              >
                Ver todos los resultados →
              </button>
            </div>
          </motion.div>
        )}
        {showResults && !isSearching && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.resultsDropdown}
          >
            <p className={styles.noResults}>
              No se encontraron resultados para "{query}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
