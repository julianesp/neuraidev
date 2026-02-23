"use client";

import { Bell, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function NotificationsBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya cerró el banner
    const bannerClosed = localStorage.getItem('notifications-banner-closed');
    if (!bannerClosed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('notifications-banner-closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Bell className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <p className="text-sm md:text-base font-medium">
            <span className="font-bold">¡Nuevo!</span> Recibe notificaciones por email cuando subamos nuevos productos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/notificaciones"
            className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors"
          >
            Suscribirme
          </Link>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
