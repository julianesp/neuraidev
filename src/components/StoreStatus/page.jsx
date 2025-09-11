"use client";

import { useState, useEffect } from 'react';
import styles from './StoreStatus.module.scss';

export default function StoreStatus() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const savedStatus = localStorage.getItem('storeStatus');
    if (savedStatus !== null) {
      setIsOpen(JSON.parse(savedStatus));
    }
  }, []);

  const toggleStatus = () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    localStorage.setItem('storeStatus', JSON.stringify(newStatus));
  };

  return (
    <div className={styles.storeStatusContainer}>
      <button 
        onClick={toggleStatus}
        className={`${styles.storeButton} ${isOpen ? styles.open : styles.closed}`}
        aria-label={isOpen ? "Tienda abierta" : "Tienda cerrada"}
      >
        <div className={styles.statusIcon}>
          <span className={styles.dot}></span>
        </div>
        <span className={styles.statusText}>
          {isOpen ? "Tienda Abierta" : "Tienda Cerrada"}
        </span>
      </button>
    </div>
  );
}