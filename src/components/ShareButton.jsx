"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

const ShareButton = ({ 
  product,
  variant = 'primary', // 'primary', 'secondary', 'minimal'
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  showText = true
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  // Verificar si el navegador soporta Web Share API
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  // Configuración de tamaños
  const sizes = {
    small: { 
      icon: 16, 
      padding: 'px-2 py-1', 
      text: 'text-xs',
      button: 'text-xs' 
    },
    medium: { 
      icon: 20, 
      padding: 'px-3 py-2', 
      text: 'text-sm',
      button: 'text-sm' 
    },
    large: { 
      icon: 24, 
      padding: 'px-4 py-3', 
      text: 'text-base',
      button: 'text-base' 
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  // Configuración de variantes
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    minimal: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
  };

  const currentVariant = variants[variant] || variants.primary;

  // Generar datos para compartir
  const getShareData = () => {
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const productName = product?.nombre || 'Producto';
    const productPrice = product?.precio 
      ? (typeof product.precio === 'number' 
          ? `$${product.precio.toLocaleString('es-CO')}` 
          : `$${product.precio}`)
      : '';

    return {
      title: `🛍️ ${productName}`,
      text: `¡Mira este producto! ${productName}${productPrice ? ` - ${productPrice}` : ''}\n\n📱 Ver detalles:`,
      url: productUrl
    };
  };

  // Función para compartir usando Web Share API
  const handleNativeShare = async () => {
    if (!canShare || isSharing) return;

    setIsSharing(true);
    
    try {
      const shareData = getShareData();
      await navigator.share(shareData);
    } catch (error) {
      // Si el usuario cancela, no mostrar error
      if (error.name !== 'AbortError') {
        console.warn('Error al compartir:', error);
        // Fallback a copiar al portapapeles
        handleCopyToClipboard();
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Función fallback para copiar al portapapeles
  const handleCopyToClipboard = async () => {
    if (copied) return;

    try {
      const shareData = getShareData();
      const textToShare = `${shareData.text}\n${shareData.url}`;
      
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Error al copiar al portapapeles:', error);
    }
  };

  // Función principal de compartir
  const handleShare = () => {
    if (canShare) {
      handleNativeShare();
    } else {
      handleCopyToClipboard();
    }
  };

  const IconComponent = copied ? Check : Share2;
  const buttonText = copied ? 'Copiado!' : (canShare ? 'Compartir' : 'Copiar enlace');

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`
        ${currentSize.padding} ${currentSize.button}
        ${currentVariant}
        rounded-lg font-medium
        flex items-center justify-center gap-2
        transition-all duration-200 ease-in-out
        hover:scale-105 active:scale-95
        disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${className}
      `}
      aria-label={buttonText}
    >
      <IconComponent 
        size={currentSize.icon} 
        className={`
          ${isSharing ? 'animate-pulse' : ''}
          ${copied ? 'text-green-500' : ''}
        `}
      />
      
      {showText && (
        <span className={`
          ${currentSize.text}
          ${isSharing ? 'animate-pulse' : ''}
        `}>
          {isSharing ? 'Compartiendo...' : buttonText}
        </span>
      )}
    </button>
  );
};

export default ShareButton;