"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./ProductSearch.module.scss";

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [total, setTotal] = useState(0);

  // Busca en el catálogo real (D1) con una pausa corta entre teclas.
  // Antes leía JSON viejos de /public con ids que ya no existen (enlaces 404).
  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSearchResults([]);
      setTotal(0);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const control = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/productos/buscar?q=${encodeURIComponent(term)}`, {
          signal: control.signal,
        });
        const data = await res.json();
        setSearchResults(Array.isArray(data.productos) ? data.productos : []);
        setTotal(data.total || 0);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSearchResults([]);
          setTotal(0);
        }
      } finally {
        if (!control.signal.aborted) setIsSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      control.abort();
    };
  }, [searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setShowResults(term.trim().length >= 2);
  };

  // Función para solicitar producto no encontrado
  const handleRequestProduct = () => {
    const message = `Hola, estoy buscando: "${searchTerm}" pero no lo encontré en el catálogo. ¿Podrían ayudarme a conseguirlo?`;
    const whatsappUrl = `https://wa.me/573174503604?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchInput}
        />
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
      </div>

      {showResults && (
        <div className={styles.resultsContainer}>
          <button
            className={styles.closeButton}
            onClick={() => {
              setShowResults(false);
              setSearchResults([]);
              setSearchTerm("");
            }}
            aria-label="Cerrar resultados"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {isSearching ? (
            <div className={styles.loading}>Buscando...</div>
          ) : searchResults.length > 0 ? (
            <div className={styles.results}>
              <div className={styles.resultsHeader}>
                Encontrados {total} producto{total !== 1 ? 's' : ''}
              </div>
              {searchResults.slice(0, 5).map((product, index) => (
                <div key={product.id} className={styles.resultItem}>
                  <div className={styles.productImage}>
                    <Image
                      src={product.imagen || 'https://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen'}
                      alt={product.nombre}
                      width={80}
                      height={80}
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h4 className={styles.productName}>{product.nombre}</h4>
                    <p className={styles.productDescription}>
                      {product.descripcion?.substring(0, 100)}...
                    </p>
                    <div className={styles.productMeta}>
                      <span className={styles.productCategory}>
                        {product.categoria}
                      </span>
                      {product.precio && (
                        <span className={styles.productPrice}>
                          ${product.precio.toLocaleString('es-CO')}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={product.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewButton}
                  >
                    Ver producto
                    <svg
                      className={styles.externalIcon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              ))}
              {total > 5 && (
                <div className={styles.moreResults}>
                  Y {total - 5} producto{total - 5 !== 1 ? 's' : ''} más...
                </div>
              )}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4>No encontramos &quot;{searchTerm}&quot;</h4>
              <p>No se encontró ningún producto con ese nombre o descripción.</p>
              <button
                onClick={handleRequestProduct}
                className={styles.requestButton}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Solicitar este producto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
