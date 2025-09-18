"use client";

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useToast } from './ToastContext';
import { ecommerceEvents } from '../lib/analytics';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

// Reducer para manejar el estado del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        itemCount: action.payload.itemCount || 0,
        subtotal: parseFloat(action.payload.subtotal || 0),
        loading: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.productoId === action.payload.productoId
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = action.payload;
        return {
          ...state,
          items: updatedItems,
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        itemCount: 0,
        subtotal: 0,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  loading: true,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { success, error: showError } = useToast();

  // Cargar carrito inicial
  useEffect(() => {
    loadCart();
  }, []);

  // Recalcular totales cuando cambien los items
  useEffect(() => {
    const itemCount = state.items.reduce((sum, item) => sum + item.cantidad, 0);
    const subtotal = state.items.reduce((sum, item) => {
      const precio = parseFloat(item.producto.precio);
      return sum + (precio * item.cantidad);
    }, 0);

    if (state.itemCount !== itemCount || state.subtotal !== subtotal) {
      dispatch({
        type: 'SET_CART',
        payload: { items: state.items, itemCount, subtotal },
      });
    }
  }, [state.items]);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/carrito', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_CART', payload: data.carrito });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error });
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error cargando carrito' });
    }
  };

  const addToCart = async (productoId, cantidad = 1, variantes = null) => {
    try {
      const response = await fetch('/api/carrito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productoId, cantidad, variantes }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'ADD_ITEM', payload: data.carritoItem });
        success('Producto agregado al carrito');

        // Track analytics event
        ecommerceEvents.addToCart(data.carritoItem.producto, cantidad);

        return { success: true, item: data.carritoItem };
      } else {
        showError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      showError('Error agregando producto al carrito');
      return { success: false, error: 'Error interno' };
    }
  };

  const updateQuantity = async (itemId, cantidad) => {
    try {
      const response = await fetch(`/api/carrito/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ cantidad }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'UPDATE_ITEM', payload: data.carritoItem });
        return { success: true };
      } else {
        showError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      showError('Error actualizando cantidad');
      return { success: false, error: 'Error interno' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`/api/carrito/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Track analytics event before removing
        const item = state.items.find(item => item.id === itemId);
        if (item) {
          ecommerceEvents.removeFromCart(item.producto, item.cantidad);
        }

        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
        success('Producto eliminado del carrito');
        return { success: true };
      } else {
        showError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
      showError('Error eliminando producto');
      return { success: false, error: 'Error interno' };
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/carrito/clear', {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'CLEAR_CART' });
        success('Carrito limpiado');
        return { success: true };
      } else {
        showError(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error limpiando carrito:', error);
      showError('Error limpiando carrito');
      return { success: false, error: 'Error interno' };
    }
  };

  const value = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};