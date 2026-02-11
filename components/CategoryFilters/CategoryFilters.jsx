"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CategoryFilters.module.scss";

const categories = [
  {
    name: "Celulares",
    slug: "celulares",
    icon: "📱",
    subcategories: ["Cargadores", "Auriculares", "Fundas", "Cables"]
  },
  {
    name: "Computadores",
    slug: "computadoras",
    icon: "💻",
    subcategories: ["Mouse", "Teclados", "Webcam", "Memorias USB"]
  },
  {
    name: "Libros Nuevos",
    slug: "libros-nuevos",
    icon: "📚",
    subcategories: ["Ficción", "No Ficción", "Educación", "Técnicos"]
  },
  {
    name: "Libros Usados",
    slug: "libros-usados",
    icon: "📖",
    subcategories: ["Ficción", "No Ficción", "Educación", "Técnicos"]
  },
  {
    name: "Generales",
    slug: "generales",
    icon: "🎯",
    subcategories: ["Gadgets", "Hogar", "Deportes", "Otros"]
  }
];

const priceRanges = [
  { label: "Menos de $50.000", min: 0, max: 50000 },
  { label: "$50.000 - $100.000", min: 50000, max: 100000 },
  { label: "$100.000 - $200.000", min: 100000, max: 200000 },
  { label: "$200.000 - $500.000", min: 200000, max: 500000 },
  { label: "Más de $500.000", min: 500000, max: Infinity }
];

const filters = [
  { id: "disponibilidad", label: "Solo disponibles", icon: "✓" },
  { id: "envio-gratis", label: "Envío gratis", icon: "🚚" },
  { id: "descuento", label: "Con descuento", icon: "🏷️" },
  { id: "destacado", label: "Destacados", icon: "⭐" }
];

export default function CategoryFilters() {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const router = useRouter();

  const toggleCategory = (slug) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  const handleCategoryClick = (slug) => {
    router.push(`/accesorios/${slug}`);
  };

  const handleSubcategoryClick = (categorySlug, subcategory) => {
    router.push(`/accesorios/${categorySlug}?subcategoria=${encodeURIComponent(subcategory)}`);
  };

  const toggleFilter = (filterId) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handlePriceRangeClick = (range) => {
    setSelectedPriceRange(
      selectedPriceRange?.label === range.label ? null : range
    );
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (selectedFilters.length > 0) {
      selectedFilters.forEach(filter => params.append('filter', filter));
    }

    if (selectedPriceRange) {
      params.append('min', selectedPriceRange.min);
      params.append('max', selectedPriceRange.max);
    }

    router.push(`/accesorios?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setSelectedPriceRange(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Categorías</h3>
      </div>

      {/* Categorías */}
      <div className={styles.categoriesList}>
        {categories.map((category) => (
          <div key={category.slug} className={styles.categoryItem}>
            <div className={styles.categoryHeader}>
              <button
                onClick={() => handleCategoryClick(category.slug)}
                className={styles.categoryButton}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>{category.name}</span>
              </button>
              {category.subcategories && (
                <button
                  onClick={() => toggleCategory(category.slug)}
                  className={styles.expandButton}
                >
                  <svg
                    className={`${styles.expandIcon} ${
                      expandedCategory === category.slug ? styles.expanded : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Subcategorías */}
            <AnimatePresence>
              {expandedCategory === category.slug && category.subcategories && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={styles.subcategoriesList}
                >
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => handleSubcategoryClick(category.slug, subcategory)}
                      className={styles.subcategoryButton}
                    >
                      {subcategory}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className={styles.filtersSection}>
        <h4 className={styles.filterTitle}>Filtros</h4>
        <div className={styles.filtersList}>
          {filters.map((filter) => (
            <label key={filter.id} className={styles.filterItem}>
              <input
                type="checkbox"
                checked={selectedFilters.includes(filter.id)}
                onChange={() => toggleFilter(filter.id)}
                className={styles.filterCheckbox}
              />
              <span className={styles.filterIcon}>{filter.icon}</span>
              <span className={styles.filterLabel}>{filter.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rango de precio */}
      <div className={styles.priceSection}>
        <h4 className={styles.filterTitle}>Precio</h4>
        <div className={styles.priceRanges}>
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => handlePriceRangeClick(range)}
              className={`${styles.priceButton} ${
                selectedPriceRange?.label === range.label ? styles.active : ""
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      {(selectedFilters.length > 0 || selectedPriceRange) && (
        <div className={styles.actionsSection}>
          <button onClick={handleApplyFilters} className={styles.applyButton}>
            Aplicar filtros
          </button>
          <button onClick={clearFilters} className={styles.clearButton}>
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
