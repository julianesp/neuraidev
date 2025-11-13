"use client";

import { useState, useEffect, useCallback } from "react";

export const useSoldProducts = () => {
  const [soldProducts, setSoldProducts] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar productos vendidos desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neuraidev_sold_products");
      if (saved) {
        setSoldProducts(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error al cargar productos vendidos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar en localStorage cuando cambie el estado
  const saveToStorage = useCallback((products) => {
    try {
      localStorage.setItem("neuraidev_sold_products", JSON.stringify(products));
    } catch (error) {
      console.error("Error al guardar productos vendidos:", error);
    }
  }, []);

  // Marcar/desmarcar producto como vendido
  const toggleSoldStatus = useCallback((productId, isVendido, customStyles = null) => {
    setSoldProducts(prev => {
      const updated = { ...prev };
      
      if (isVendido) {
        updated[productId] = {
          vendido: true,
          fechaVendido: new Date().toISOString(),
          estilos: customStyles || {
            textoVendido: "VENDIDO",
            colorTextoVendido: "#ff4444",
            fondoTextoVendido: "#000000",
            opacidad: 0.6,
            filtro: "grayscale(100%)"
          }
        };
      } else {
        delete updated[productId];
      }
      
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Verificar si un producto está vendido
  const isProductSold = useCallback((productId) => {
    return soldProducts[productId]?.vendido || false;
  }, [soldProducts]);

  // Obtener estilos de un producto vendido
  const getProductSoldStyles = useCallback((productId) => {
    return soldProducts[productId]?.estilos || null;
  }, [soldProducts]);

  // Aplicar estado de vendido a una lista de productos
  const applySoldStatus = useCallback((products) => {
    if (!Array.isArray(products)) return products;
    
    return products.map(product => ({
      ...product,
      vendido: isProductSold(product.id),
      estilos: getProductSoldStyles(product.id)
    }));
  }, [isProductSold, getProductSoldStyles]);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const totalSold = Object.keys(soldProducts).length;
    const recentlySold = Object.values(soldProducts).filter(item => {
      const soldDate = new Date(item.fechaVendido);
      const daysDiff = (new Date() - soldDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Vendidos en los últimos 7 días
    }).length;

    return { totalSold, recentlySold };
  }, [soldProducts]);

  // Limpiar productos vendidos (función de mantenimiento)
  const clearSoldProducts = useCallback(() => {
    setSoldProducts({});
    saveToStorage({});
  }, [saveToStorage]);

  // Exportar datos para backup
  const exportSoldData = useCallback(() => {
    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: soldProducts
    };
  }, [soldProducts]);

  // Importar datos desde backup
  const importSoldData = useCallback((data) => {
    try {
      if (data.version === "1.0" && data.data) {
        setSoldProducts(data.data);
        saveToStorage(data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al importar datos:", error);
      return false;
    }
  }, [saveToStorage]);

  return {
    soldProducts,
    loading,
    toggleSoldStatus,
    isProductSold,
    getProductSoldStyles,
    applySoldStatus,
    getStats,
    clearSoldProducts,
    exportSoldData,
    importSoldData
  };
};