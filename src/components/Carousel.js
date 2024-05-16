import React, { useState } from "react";
import Image from "next/image";
import styles from '@/styles/sass/Carousel.module.css'

const Carousel = ({ images, automaticTransition = true }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = () => {
        setActiveIndex((activeIndex + 1) % images.length);
        console.log('Next Clicked. Active Index:', activeIndex);
    };

    const handlePrev = () => {
        setActiveIndex((activeIndex - 1 + images.length) % images.length);
        console.log('Prev Clicked. Active Index:', activeIndex);
    };

    // 

    return (
        <div className={`${styles.carousel} ${automaticTransition}`}>
            <div className={styles.carousel__inner}>
                {images.map((image, index) => (
                    <div
                        // key={image.src}
                        key={String(image.src)}
                        // className={`item ${activeIndex === index ? "active" : ""}`}
                        className={`${styles.item} ${activeIndex === index ? "active" : ""}`}
                    >
                        <Image
                            src={image.src}
                            alt={image.alt}
                            priority
                        />
                    </div>
                ))}
            </div>

            <div id="arrows">
                <button id="preBtn" className={styles.prev} onClick={handlePrev}>
                    atras</button>
                <button id="nexBtn" className={styles.next} onClick={handleNext}>adelante</button>
            </div>
        </div>
    );
};

export default Carousel;
