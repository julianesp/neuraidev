"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/components/Advertisement.module.scss";

export default function AdvertisementToggle({ ads = [] }) {
  const [imageError, setImageError] = useState({});
  const [imageId, setImageId] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  // Efecto para detectar clics fuera del componente
  useEffect(() => {
    function handleClickOutside(event) {
      // Solo procesar si el menú está visible
      if (!isVisible) return;

      // Verificar si el clic fue fuera del botón y del menú
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    }

    // Añadir el detector de eventos
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    // Limpieza
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isVisible]); // Re-ejecutar cuando cambie isVisible

  useEffect(() => {
    // Comprobar si es dispositivo móvil
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth >= 320 && window.innerWidth <= 767);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Manejar la posición del botón cuando se hace scroll
    const handleScroll = () => {
      if (!buttonRef.current) return;

      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Ajustar la posición cuando estamos cerca del footer
      if (scrollPosition >= documentHeight - 100) {
        setIsNearFooter(true);
      } else {
        setIsNearFooter(false);
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
        <div
          className="fixed z-50"
          style={{
            bottom: isNearFooter ? "120px" : "5px",
            right: "10px",
            transition: "bottom 0.3s ease",
          }}
        >
          <button
            ref={buttonRef}
            onClick={() => setIsVisible(!isVisible)}
            className="p-3 rounded-full shadow-lg flex items-center justify-center w-12 h-12 backdrop-blur-md bg-white/80 border border-gray-200"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            <Image
              src={
                "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
              }
              alt="Toggle Anuncios"
              width={24}
              height={24}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false} // Solo true para imágenes above-the-fold
              loading="lazy"
              quality={85} // Reduce de 100 a 85
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
              onError={() =>
                setImageError((prev) => ({ ...prev, [imageId]: true }))
              }
            />
          </button>
        </div>
      )}

      {/* Contenido de anuncios */}
      {isMobile ? (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${styles.motion} fixed z-40 bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-52`}
              style={{
                bottom: isNearFooter ? "180px" : "84px",
                right: "16px",
                transition: "bottom 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
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
                className={`${styles.locales} bg-white  rounded-lg overflow-hidden max-w-sm w-full mx-auto `}
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
  const [imageError, setImageError] = useState({});
  const [imageId, setImageId] = useState({});

  return (
    <>
      <div className="relative h-full w-full">
        <Image
          src={
            imageUrl ||
            "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
          }
          alt={businessName}
          className="p-2"
          width={200}
          height={200}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false} // Solo true para imágenes above-the-fold
          loading="lazy"
          quality={85} // Reduce de 100 a 85
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
          onError={() =>
            setImageError((prev) => ({ ...prev, [imageId]: true }))
          }
        />
      </div>
      <div className="p-4">
        <h2 className="text-gray-900 text-xl font-semibold mb-2 dark:text-slate-950">
          {businessName}
        </h2>
        <p className="text-gray-900 mb-4 dark:text-slate-950">{description}</p>

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
