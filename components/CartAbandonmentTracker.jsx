"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Componente para detectar y notificar carritos abandonados
 *
 * Este componente debe ser incluido en el layout principal o en la página del carrito
 * para detectar cuando un usuario tiene productos en el carrito pero se va sin completar la compra.
 */
export default function CartAbandonmentTracker() {
  const hasNotified = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Función para obtener el carrito del localStorage
    const getCart = () => {
      try {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : [];
      } catch (error) {
        console.error('Error leyendo carrito:', error);
        return [];
      }
    };

    // Función para obtener datos del usuario (si está autenticado)
    const getUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        return null;
      }
    };

    // Función para generar un session ID único
    const getSessionId = () => {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('session_id', sessionId);
      }
      return sessionId;
    };

    // Función para notificar carrito abandonado
    const notifyAbandonedCart = async () => {
      const cart = getCart();

      // Solo notificar si hay productos en el carrito
      if (cart.length === 0) return;

      // No notificar múltiples veces en la misma sesión
      if (hasNotified.current) return;

      const user = getUserData();
      const sessionId = getSessionId();

      // Calcular total del carrito
      const total = cart.reduce((sum, item) => {
        const price = item.precio || item.price || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0);

      const cartData = {
        sessionId,
        email: user?.email || null,
        name: user?.name || user?.firstName || null,
        products: cart.map(item => ({
          id: item.id,
          nombre: item.nombre || item.name,
          precio: item.precio || item.price,
          quantity: item.quantity || 1,
          imagen: item.imagen || item.image,
        })),
        total,
      };

      try {
        const response = await fetch('/api/n8n/cart-abandoned', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartData),
        });

        if (response.ok) {
          console.log('Carrito abandonado notificado');
          hasNotified.current = true;

          // Marcar en sessionStorage que ya se notificó
          sessionStorage.setItem('cart_abandonment_notified', 'true');
        }
      } catch (error) {
        console.error('Error notificando carrito abandonado:', error);
      }
    };

    // Detectar cuando el usuario está por salir de la página
    const handleBeforeUnload = (e) => {
      const cart = getCart();
      const wasNotified = sessionStorage.getItem('cart_abandonment_notified');

      // Si hay carrito y no se ha notificado, intentar notificar
      if (cart.length > 0 && !wasNotified && !hasNotified.current) {
        // Usar sendBeacon para enviar datos de manera confiable
        // incluso cuando el usuario está cerrando la página
        const user = getUserData();
        const sessionId = getSessionId();

        const total = cart.reduce((sum, item) => {
          return sum + ((item.precio || item.price || 0) * (item.quantity || 1));
        }, 0);

        const data = JSON.stringify({
          sessionId,
          email: user?.email || null,
          name: user?.name || user?.firstName || null,
          products: cart.map(item => ({
            id: item.id,
            nombre: item.nombre || item.name,
            precio: item.precio || item.price,
            quantity: item.quantity || 1,
          })),
          total,
        });

        // sendBeacon es más confiable que fetch cuando el usuario cierra la página
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/n8n/cart-abandoned', data);
          hasNotified.current = true;
          sessionStorage.setItem('cart_abandonment_notified', 'true');
        }
      }
    };

    // Detectar inactividad (usuario no interactúa por 2 minutos)
    let inactivityTimer;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        notifyAbandonedCart();
      }, 2 * 60 * 1000); // 2 minutos
    };

    // Eventos de actividad del usuario
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);

    // Evento antes de cerrar la página
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Iniciar timer de inactividad
    resetInactivityTimer();

    // Limpiar eventos al desmontar
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('scroll', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Este componente no renderiza nada visible
  return null;
}
