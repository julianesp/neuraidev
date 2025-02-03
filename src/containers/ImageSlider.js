"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "../styles/ImageSlider.module.scss";

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
        priority={true} 
      />

      <div className={styles.buttonContainer}>
        <button onClick={goToPreviousSlide} className={styles.left}>
          <Image
            alt="Arrow left"
            src="https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/left.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sZWZ0LnBuZyIsImlhdCI6MTczNzIyMTk4MCwiZXhwIjoxNzY4NzU3OTgwfQ.dxcKBnmSXq3EbOOS2YUlRQM4D51EzLZqh3v0_Do_cOk&t=2025-01-18T17%3A39%3A41.112Z"
            width={20}
            height={20}
            priority={true}
          />
        </button>

        <button onClick={goToNextSlide} className={styles.right}>
          <Image
            alt="Arrow right"
            src="https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/right.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9yaWdodC5wbmciLCJpYXQiOjE3MzcyMjIzMjgsImV4cCI6MTc2ODc1ODMyOH0.lZOLaPChl0zcOUffOTx321_u5XG2R0jgnvbyH8WGJ8M&t=2025-01-18T17%3A45%3A28.651Z"
            width={20}
            height={20}
            priority={true}
          />
        </button>
      </div>
    </section>
  );
};

export default Procedimientos;
