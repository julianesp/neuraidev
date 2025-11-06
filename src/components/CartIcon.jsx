"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function CartIcon() {
  const { getTotalItems, toggleCart } = useCart();
  const totalItems = getTotalItems();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 bg-white  dark:hover:bg-gray-800 rounded-full transition-colors"
      aria-label={`Carrito de compras: ${totalItems} items`}
    >
      <ShoppingCart size={24} className="text-gray-700 dark:text-black" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
