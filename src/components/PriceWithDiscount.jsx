import React from 'react';
import styles from '../styles/components/PriceWithDiscount.module.scss';

const PriceWithDiscount = ({ 
  precio, 
  discountPercentage = 15, 
  showBadge = true,
  className = '' 
}) => {
  // Verificar si es septiembre para aplicar el descuento
  const currentMonth = new Date().getMonth(); // 0 = enero, 8 = septiembre
  const isSeptember = currentMonth === 8;
  
  if (!isSeptember || !precio) {
    // Si no es septiembre o no hay precio, mostrar precio normal
    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    };
    
    return <p className={className}>{formatPrice(precio)}</p>;
  }

  const originalPrice = precio;
  const discountedPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className={`${styles.priceContainer} ${className}`}>
      {showBadge && (
        <span className={styles.discountBadge}>-{discountPercentage}%</span>
      )}
      <p className={styles.originalPrice}>{formatPrice(originalPrice)}</p>
      <p className={styles.discountedPrice}>{formatPrice(discountedPrice)}</p>
    </div>
  );
};

export default PriceWithDiscount;