"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSlider from "@/hooks/useSlider";
import Image from "next/image";
import styles from "@/styles/components/FullViewSlider.module.scss";

export default function FullViewportSlider({ slides }) {
  const [imageError, setImageError] = useState({});
  const [imageId, setImageId] = useState({});

  const { currentSlide, goToNextSlide, goToPrevSlide, resetTimer } = useSlider(
    slides.length,
  );

  // Comprobación de seguridad para asegurarnos de que slides[currentSlide] existe
  const currentSlideData = slides[currentSlide] || {};
  const { images = [], id = "" } = currentSlideData;

  return (
    <div className={`${styles.container} relative h-full w-full`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={images}
            alt="Slide image"
            width={100}
            height={100}
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
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <Button asChild className={styles.boton}>
              <a href={`/product/${id}`} className="text-lg text-white">
                Ver Detalles
              </a>
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75"
        onClick={() => {
          goToPrevSlide();
          resetTimer();
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75"
        onClick={() => {
          goToNextSlide();
          resetTimer();
        }}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
