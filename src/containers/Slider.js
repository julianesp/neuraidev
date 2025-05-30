"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import arrowLeft from "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Faback.svg?alt=media&token=87379bdd-1edf-4b20-93c6-880825bef072";
import arrowLeftTwo from "../../public/aback.svg";
// import colecis from "../../public/images/colecistectomia.jpg";
// import lapa from "../../public/images/cirugia_laparoscopia.jpg";
// import info_1 from "../../public/images/info_1.jpg";
import styles from "../styles/Sli.module.css";

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState({});
  const carouselRef = useRef(null);
  const timerRef = useRef(null); // Referencia para el temporizador

  const images = [
    { src: arrowLeft, alt: "Médico" },
    { src: arrowLeft, alt: "Logo" },
    { src: arrowLeft, alt: "Médico" },
  ];

  useEffect(() => {
    // const carousel = carouselRef.current;

    timerRef.current = setTimeout(() => {
      if (!isHovered) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }
    }, 4000);

    return () => clearTimeout(timerRef.current); // Limpiar el temporizador al desmontar
  }, [isHovered, currentIndex, images.length]);

  const showImage = (index) => {
    clearTimeout(timerRef.current); // Reiniciar el temporizador al cambiar manualmente
    setCurrentIndex(index);
  };

  const changeImage = (nextIndex) => {
    clearTimeout(timerRef.current); // Reiniciar el temporizador al cambiar manualmente
    setCurrentIndex(nextIndex);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    changeImage(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    changeImage(prevIndex);
  };

  return (
    <div className={styles.slider}>
      <div
        className="carousel"
        ref={carouselRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {images.map((image, index) => (
          <button
            key={index}
            className={`image ${index === currentIndex ? "active" : ""}`}
            onClick={() => showImage(index)}
          >
            <Image
              className={styles.sizeImg}
              src={image.src}
              priority={index === currentIndex}
              alt={image.alt}
              as="image"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              quality={85} // Reduce de 100 a 85
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
              onError={() =>
                setImageError((prev) => ({ ...prev, [`slide-${index}`]: true }))
              }
            />
          </button>
        ))}

        <div id="flechas">
          <button id="prevBtn" onClick={prevImage}>
            <Image
              src={arrowLeft}
              priority
              alt="Flecha izquierda"
              width={40}
              height={40}
              onError={() =>
                setImageError((prev) => ({ ...prev, "left-arrow": true }))
              }
            />
          </button>

          <button id="nextBtn" onClick={nextImage}>
            <Image
              src={arrowLeftTwo}
              priority
              alt="Flecha derecha"
              width={40}
              height={40}
              onError={() =>
                setImageError((prev) => ({ ...prev, "right-arrow": true }))
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Slider;
