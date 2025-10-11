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

    case 'ADD_ITEM': {
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
  }, [state.items, state.itemCount, state.subtotal]);

  const loadCart = () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Cargar carrito desde localStorage
      const savedCart = localStorage.getItem('neuraidev-cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: cartData });
      } else {
        dispatch({ type: 'SET_CART', payload: { items: [], itemCount: 0, subtotal: 0 } });
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error cargando carrito' });
    }
  };

  const addToCart = async (producto, cantidad = 1, variantes = null) => {
    try {
      // Buscar si el producto ya existe en el carrito
      const existingItemIndex = state.items.findIndex(
        item => item.producto.id === producto.id
      );

      let updatedItems;
      let carritoItem;

      if (existingItemIndex >= 0) {
        // Si existe, actualizar cantidad
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          cantidad: updatedItems[existingItemIndex].cantidad + cantidad,
        };
        carritoItem = updatedItems[existingItemIndex];
      } else {
        // Si no existe, agregar nuevo item
        carritoItem = {
          id: Date.now().toString(), // ID único temporal
          producto,
          cantidad,
          variantes,
        };
        updatedItems = [...state.items, carritoItem];
      }

      // Calcular totales
      const itemCount = updatedItems.reduce((sum, item) => sum + item.cantidad, 0);
      const subtotal = updatedItems.reduce((sum, item) => {
        const precio = parseFloat(item.producto.precio);
        return sum + (precio * item.cantidad);
      }, 0);

      const cartData = { items: updatedItems, itemCount, subtotal };

      // Guardar en localStorage
      localStorage.setItem('neuraidev-cart', JSON.stringify(cartData));

      // Actualizar estado
      dispatch({ type: 'SET_CART', payload: cartData });
      success('Producto agregado al carrito');

      // Track analytics event
      ecommerceEvents.addToCart(producto, cantidad);

      return { success: true, item: carritoItem };
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      showError('Error agregando producto al carrito');
      return { success: false, error: 'Error interno' };
    }
  };

  const updateQuantity = (itemId, cantidad) => {
    try {
      const updatedItems = state.items.map(item =>
        item.id === itemId ? { ...item, cantidad } : item
      );

      // Calcular totales
      const itemCount = updatedItems.reduce((sum, item) => sum + item.cantidad, 0);
      const subtotal = updatedItems.reduce((sum, item) => {
        const precio = parseFloat(item.producto.precio);
        return sum + (precio * item.cantidad);
      }, 0);

      const cartData = { items: updatedItems, itemCount, subtotal };

      // Guardar en localStorage
      localStorage.setItem('neuraidev-cart', JSON.stringify(cartData));

      // Actualizar estado
      dispatch({ type: 'SET_CART', payload: cartData });

      return { success: true };
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      showError('Error actualizando cantidad');
      return { success: false, error: 'Error interno' };
    }
  };

  const removeFromCart = (itemId) => {
    try {
      // Track analytics event before removing
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        ecommerceEvents.removeFromCart(item.producto, item.cantidad);
      }

      const updatedItems = state.items.filter(item => item.id !== itemId);

      // Calcular totales
      const itemCount = updatedItems.reduce((sum, item) => sum + item.cantidad, 0);
      const subtotal = updatedItems.reduce((sum, item) => {
        const precio = parseFloat(item.producto.precio);
        return sum + (precio * item.cantidad);
      }, 0);

      const cartData = { items: updatedItems, itemCount, subtotal };

      // Guardar en localStorage
      localStorage.setItem('neuraidev-cart', JSON.stringify(cartData));

      // Actualizar estado
      dispatch({ type: 'SET_CART', payload: cartData });
      success('Producto eliminado del carrito');

      return { success: true };
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
      showError('Error eliminando producto');
      return { success: false, error: 'Error interno' };
    }
  };

  const clearCart = () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem('neuraidev-cart');

      // Actualizar estado
      dispatch({ type: 'CLEAR_CART' });
      success('Carrito limpiado');

      return { success: true };
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