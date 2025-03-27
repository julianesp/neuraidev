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
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth >= 320 && window.innerWidth <= 767);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className={`${styles.container} relative`}>
      {isMobile && (
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="fixed bottom-1 right-1 text-white p-3 rounded-full shadow-lg z-50 md:hidden flex items-center justify-center w-12 h-12 backdrop-blur-md bg-white/10"
        >
          <Image
            src={
              isVisible
                ? "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4"
                : "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4"
            }
            alt="Toggle Anuncios"
            width={24}
            height={24}
            priority
          />
        </button>
      )}

      {isMobile ? (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${styles.motion} fixed bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-52`}
            >
              <div className="max-h-[80vh] overflow-y-auto">
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
            "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc"
          }
          alt={businessName}
          className="p-2"
          priority
          width={200}
          height={200}
        />
      </div>
      <div className="p-4">
        <h2 className="p-6 text-xl font-semibold mb-2">{businessName}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        {/* <Link
          href={linkUrl}
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Más información
        </Link> */}
        <Link
          href={businessId ? `/business/${businessId}` : linkUrl}
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Más información
        </Link>
      </div>
    </>
  );
}
