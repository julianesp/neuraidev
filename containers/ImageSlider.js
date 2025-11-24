"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "../styles/components/ImageSlider.module.scss";

const Procedimientos = ({ imagePaths, enableTransition = true }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState({});

  // Generate unique IDs for each image in the slider
  const mainImageId = `slide-${currentImageIndex}`;
  const leftArrowId = "slider-left-arrow";
  const rightArrowId = "slider-right-arrow";

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
        onError={() => setImageError((prev) => ({ ...prev, [mainImageId]: true }))}
      />

      <div className={styles.buttonContainer}>
        <button onClick={goToPreviousSlide} className={styles.left}>
          <Image
            alt="Arrow left"
            src="https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/left.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sZWZ0LnBuZyIsImlhdCI6MTczNzIyMTk4MCwiZXhwIjoxNzY4NzU3OTgwfQ.dxcKBnmSXq3EbOOS2YUlRQM4D51EzLZqh3v0_Do_cOk&t=2025-01-18T17%3A39%3A41.112Z"
            width={20}
            height={20}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false} // Solo true para imágenes above-the-fold
            loading="lazy"
            quality={85} // Reduce de 100 a 85
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
            onError={() =>
              setImageError((prev) => ({ ...prev, [leftArrowId]: true }))
            }
          />
        </button>

        <button onClick={goToNextSlide} className={styles.right}>
          <Image
            alt="Arrow right"
            src="https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/right.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9yaWdodC5wbmciLCJpYXQiOjE3MzcyMjIzMjgsImV4cCI6MTc2ODc1ODMyOH0.lZOLaPChl0zcOUffOTx321_u5XG2R0jgnvbyH8WGJ8M&t=2025-01-18T17%3A45%3A28.651Z"
            width={20}
            height={20}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false} // Solo true para imágenes above-the-fold
            loading="lazy"
            quality={85} // Reduce de 100 a 85
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
            onError={() =>
              setImageError((prev) => ({ ...prev, [rightArrowId]: true }))
            }
          />
        </button>
      </div>
    </section>
  );
};

export default Procedimientos;
