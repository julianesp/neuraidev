"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import PropTypes from "prop-types";
import styles from "../styles/components/VisorImages.module.css";

const VisorImages = ({ images, automaticTransition }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const timerRef = useRef(null); // Utilizar useRef para almacenar el timer

  useEffect(() => {
    const changeImageAutomatically = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    if (automaticTransition) {
      timerRef.current = setInterval(changeImageAutomatically, 4000);
    }

    return () => clearInterval(timerRef.current);
  }, [currentIndex, images, automaticTransition]);
  // [currentIndex, images, automaticTransition])
  const showImage = (index) => {
    clearInterval(timerRef.current);
    setCurrentIndex(index);
  };

  const changeImage = (nextIndex) => {
    clearInterval(timerRef.current);
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
    <div
      className={`${styles.slider} ${automaticTransition ? styles.withTransition : ""}`}
    >
      <div id="carousel" ref={carouselRef}>
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
              width={400}
              height={300}
            />
          </button>
        ))}
      </div>

      <div id="arrows">
        <button id="prevBtn" onClick={prevImage}>
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Faback.svg?alt=media&token=87379bdd-1edf-4b20-93c6-880825bef072"
            priority
            alt="Flecha izquierda"
          />
        </button>

        <button id="nextBtn" onClick={nextImage}>
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Faright.svg?alt=media&token=aad271ce-b885-4aa3-956d-58630cd34f46"
            priority
            alt="Flecha derecha"
          />
        </button>
      </div>
    </div>
  );
};

VisorImages.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired,
    }),
  ).isRequired,
  automaticTransition: PropTypes.bool,
};

export default VisorImages;
