"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "@/styles/components/ImageSlider.module.scss";

const Procedimientos = ({ imagePaths, enableTransition = true }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPreviousSlide = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imagePaths.length - 1 : prevIndex - 1,
    );
  };

  const goToNextSlide = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imagePaths.length - 1 ? 0 : prevIndex + 1,
    );
  }, [imagePaths.length]);

  useEffect(() => {
    let interval;
    if (enableTransition) {
      interval = setInterval(goToNextSlide, 5000);
    }

    return () => clearInterval(interval);
  }, [currentImageIndex, enableTransition, goToNextSlide]);

  return (
    <section className={styles.image}>
      <Image
        src={imagePaths[currentImageIndex]}
        alt="Slide"
        width={300}
        height={290}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false} // Solo true para imágenes above-the-fold
        loading="lazy"
        quality={85} // Reduce de 100 a 85
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
        onError={() => console.warn('[ImageSlider] Error loading slide image')}
      />

      <div className={styles.buttonContainer}>
        <button onClick={goToPreviousSlide} className={styles.left}>
          <span aria-hidden="true">&#8249;</span>
        </button>

        <button onClick={goToNextSlide} className={styles.right}>
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
    </section>
  );
};

export default Procedimientos;
