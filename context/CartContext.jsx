"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/db";
import { useToast } from "@/contexts/ToastContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  // Cargar carrito del localStorage al iniciar y migrar productos si es necesario
  useEffect(() => {
    const savedCart = localStorage.getItem("neuraidev_cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);

      // Migrar productos: actualizar imágenes desde Supabase si están vacías
      const migrateCartItems = async () => {
        const supabase = getSupabaseBrowserClient();
        const updatedCart = await Promise.all(
          parsedCart.map(async (item) => {
            // Si el item no tiene imagen válida, intentar obtenerla de la BD
            if (
              !item.imagen ||
              item.imagen === "" ||
              item.imagen === "null" ||
              item.imagen === "undefined" ||
              !item.imagenes
            ) {
              try {
                const { data, error } = await supabase
                  .from("products")
                  .select("imagenes, metadata")
                  .eq("id", item.id)
                  .single();

                if (!error && data) {
                  return {
                    ...item,
                    imagen: data.imagenes?.[0] || null,
                    imagenes: data.imagenes || [],
                    metadata: data.metadata || {},
                  };
                }
              } catch (err) {
                console.error("Error al migrar imagen del producto:", err);
              }
            }
            return item;
          }),
        );

        setCart(updatedCart);
      };

      migrateCartItems();
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("neuraidev_cart", JSON.stringify(cart));
  }, [cart]);

  // Verificar stock disponible en Supabase
  const checkStock = async (productId) => {
    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("products")
        .select("stock")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("[CartContext] Error al verificar stock en Supabase:", error);

        // Si el producto no existe (error PGRST116), retornar stock ilimitado
        if (error.code === "PGRST116") {
          console.warn(
            "[CartContext] Producto no encontrado en la base de datos:",
            productId,
            "- Asumiendo stock ilimitado"
          );
          return 999; // Stock "ilimitado" para productos que no están en Supabase
        }

        // Para otros errores, también asumir stock disponible para no bloquear compras
        console.warn("[CartContext] Error desconocido, asumiendo stock disponible");
        return 999;
      }

      const stockValue = data?.stock ?? 999;
      console.log(`[CartContext] Stock verificado para producto ${productId}: ${stockValue}`);
      return stockValue;
    } catch (error) {
      console.error("[CartContext] Error en catch al verificar stock:", error);
      // En caso de error de red u otro, asumir stock disponible
      return 999;
    }
  };

  // Agregar producto al carrito con validación de stock
  const addToCart = async (producto, cantidad = 1, variacion = null) => {
    // Verificar stock disponible
    const stockDisponible = await checkStock(producto.id);

    // Calcular cantidad actual en el carrito para este producto
    const cantidadEnCarrito = cart.reduce((total, item) => {
      if (
        item.id === producto.id &&
        JSON.stringify(item.variacion) === JSON.stringify(variacion)
      ) {
        return total + item.cantidad;
      }
      return total;
    }, 0);

    // Validar que no se exceda el stock
    const nuevaCantidadTotal = cantidadEnCarrito + cantidad;
    if (nuevaCantidadTotal > stockDisponible) {
      const cantidadRestante = stockDisponible - cantidadEnCarrito;
      if (cantidadRestante <= 0) {
        toast.warning(`No hay más stock disponible de "${producto.nombre}"`, {
          title: "Stock Agotado",
          duration: 5000,
        });
        return false;
      } else {
        toast.warning(
          `Solo hay ${cantidadRestante} unidades disponibles de "${producto.nombre}"`,
          {
            title: "Stock Limitado",
            duration: 5000,
          },
        );
        cantidad = cantidadRestante;
      }
    }

    setCart((prevCart) => {
      // Verificar si el producto ya existe en el carrito (con la misma variación)
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.id === producto.id &&
          JSON.stringify(item.variacion) === JSON.stringify(variacion),
      );

      let newCart;
      if (existingItemIndex > -1) {
        // Si existe, actualizar la cantidad
        newCart = [...prevCart];
        newCart[existingItemIndex].cantidad += cantidad;
      } else {
        // Si no existe, agregar nuevo item
        const newItem = {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagenes?.[0] || producto.imagen || null,
          imagenes:
            producto.imagenes || (producto.imagen ? [producto.imagen] : []),
          cantidad,
          variacion,
          categoria: producto.categoria,
          stock: stockDisponible,
          metadata: producto.metadata || {}, // Incluir metadata con payment_link
        };
        newCart = [...prevCart, newItem];
      }

      return newCart;
    });

    return true;
  };

  // Remover producto del carrito
  const removeFromCart = (itemId, variacion = null) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.id === itemId &&
            JSON.stringify(item.variacion) === JSON.stringify(variacion)
          ),
      ),
    );
  };

  // Actualizar cantidad de un producto con validación de stock
  const updateQuantity = async (itemId, variacion, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, variacion);
      return true;
    }

    // Verificar stock disponible
    const stockDisponible = await checkStock(itemId);

    if (newQuantity > stockDisponible) {
      const item = cart.find(
        (i) =>
          i.id === itemId &&
          JSON.stringify(i.variacion) === JSON.stringify(variacion),
      );

      // Mensaje personalizado según el stock disponible
      if (stockDisponible === 0) {
        toast.error(
          `"${item?.nombre}" está agotado. No hay unidades disponibles.`,
          {
            title: "⚠️ Producto Agotado",
            duration: 6000,
          },
        );
      } else if (stockDisponible === 1) {
        toast.warning(
          `Solo queda 1 unidad disponible de "${item?.nombre}"`,
          {
            title: "⚠️ Última Unidad",
            duration: 6000,
          },
        );
      } else {
        toast.warning(
          `Solo hay ${stockDisponible} unidades disponibles de "${item?.nombre}"`,
          {
            title: "⚠️ Stock Limitado",
            duration: 6000,
          },
        );
      }

      // Actualizar al máximo disponible
      if (stockDisponible > 0) {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === itemId &&
            JSON.stringify(item.variacion) === JSON.stringify(variacion)
              ? { ...item, cantidad: stockDisponible, stock: stockDisponible }
              : item,
          ),
        );
      } else {
        // Si no hay stock, remover del carrito
        removeFromCart(itemId, variacion);
      }
      return false;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId &&
        JSON.stringify(item.variacion) === JSON.stringify(variacion)
          ? { ...item, cantidad: newQuantity, stock: stockDisponible }
          : item,
      ),
    );

    return true;
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
  };

  // Obtener cantidad total de items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  // Obtener precio total
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  // Abrir/cerrar carrito
  const toggleCart = () => {
    setIsOpen((prev) => !prev);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    checkStock,
    isOpen,
    toggleCart,
    setIsOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
