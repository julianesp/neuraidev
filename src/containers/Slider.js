"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import arrowLeft from "../../public/aback.svg";
import arrowLeftTwo from "../../public/aback.svg";
// import colecis from "../../public/images/colecistectomia.jpg";
// import lapa from "../../public/images/cirugia_laparoscopia.jpg";
// import info_1 from "../../public/images/info_1.jpg";
import styles from "../styles/Sli.module.css";

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
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
          <div
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
            />
          </div>
        ))}

        <div id="flechas">
          <button id="prevBtn" onClick={prevImage}>
            <Image
              src={arrowLeft}
              priority
              alt="Flecha izquierda"
              width={40}
              height={40}
            />
          </button>

          <button id="nextBtn" onClick={nextImage}>
            <Image
              src={arrowLeftTwo}
              priority
              alt="Flecha derecha"
              width={40}
              height={40}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Slider;
