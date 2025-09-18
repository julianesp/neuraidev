"use client";

import { useState } from 'react';
import { useCart } from '../contexts/CartContext';

export const AddToCartButton = ({
  producto,
  cantidad = 1,
  variantes = null,
  className = "",
  children,
  variant = "primary", // primary, secondary, icon
  size = "md", // sm, md, lg
  disabled = false,
  onSuccess,
}) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!producto || !producto.id) return;

    setIsAdding(true);
    const result = await addToCart(producto.id, cantidad, variantes);
    setIsAdding(false);

    // Opcional: callback de éxito
    if (result.success && onSuccess) {
      onSuccess(result.item);
    }
  };

  const isDisabled = disabled || isAdding || !producto?.disponible || producto?.stock <= 0;

  const getButtonClasses = () => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const variantClasses = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
      icon: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500",
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getButtonText = () => {
    if (isAdding) return "Agregando...";
    if (!producto?.disponible) return "No disponible";
    if (producto?.stock <= 0) return "Sin stock";
    return children || "Agregar al carrito";
  };

  const showIcon = variant === "icon" || !children;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={getButtonClasses()}
      title={getButtonText()}
    >
      {isAdding ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {variant !== "icon" && "Agregando..."}
        </div>
      ) : (
        <div className="flex items-center">
          {showIcon && (
            <svg
              className={`h-4 w-4 ${children && variant !== "icon" ? "mr-2" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L3 3H1m6 10v6a2 2 0 002 2h8a2 2 0 002-2v-6m-10 0V7a2 2 0 012-2h4a2 2 0 012 2v6"
              />
            </svg>
          )}
          {variant !== "icon" && getButtonText()}
        </div>
      )}
    </button>
  );
};

// Componente específico para productos en cards/grids
export const QuickAddButton = ({ producto, className = "" }) => (
  <AddToCartButton
    producto={producto}
    variant="icon"
    size="sm"
    className={`rounded-full w-8 h-8 ${className}`}
  />
);

// Componente para páginas de detalle de producto
export const DetailedAddButton = ({ producto, cantidad, className = "" }) => (
  <AddToCartButton
    producto={producto}
    cantidad={cantidad}
    variant="primary"
    size="lg"
    className={`w-full ${className}`}
  >
    Agregar al carrito
  </AddToCartButton>
);