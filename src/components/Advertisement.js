"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/Advertisement.module.scss";

export default function AdvertisementToggle({ ads = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Comprobar si es dispositivo móvil
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth >= 320 && window.innerWidth <= 767);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Manejar la posición del botón cuando se hace scroll
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const toggleButton = document.querySelector(
        `.${styles.storeToggleButton}`,
      );

      if (!toggleButton) return;

      // Ajustar la posición cuando estamos cerca del footer
      if (scrollPosition >= documentHeight - 100) {
        toggleButton.style.bottom = "120px"; // Alejar del footer
      } else {
        toggleButton.style.bottom = "24px"; // Posición normal
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={`${styles.container} relative`}>
      {/* Botón flotante para móviles */}
      {isMobile && (
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`${styles.storeToggleButton} fixed bottom-1 right-4 z-50 p-3 rounded-full shadow-lg flex items-center justify-center w-12 h-12 backdrop-blur-md bg-white/80 border border-gray-200`}
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          <Image
            src={
              "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
            }
            alt="Toggle Anuncios"
            width={24}
            height={24}
            priority
          />
        </button>
      )}

      {/* Contenido de anuncios */}
      {isMobile ? (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${styles.motion} fixed bottom-3 right-4 z-40 bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-52`}
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            >
              <div className="max-h-[60vh] overflow-y-auto">
                {Array.isArray(ads) &&
                  ads.map((ad, index) => <AdContent key={index} {...ad} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.isArray(ads) &&
            ads.map((ad, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full mx-auto"
              >
                <AdContent {...ad} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// Componente separado para reutilizar el contenido del anuncio
function AdContent({
  businessName,
  description,
  imageUrl,
  linkUrl,
  businessId,
}) {
  return (
    <>
      <div className="relative h-48 w-full">
        <Image
          src={
            imageUrl ||
            "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e2a-2396-4934-925b-75863006bb4b"
          }
          alt={businessName}
          className="p-2"
          priority
          width={200}
          height={200}
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{businessName}</h2>
        <p className="text-gray-600 mb-4">{description}</p>

        <Link
          href={businessId ? `/business/${businessId}` : linkUrl}
          className="inline-block bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Más información
        </Link>
      </div>
    </>
  );
}
