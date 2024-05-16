import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';
// import left from './public/aback.svg';
import left from '../../public/aback.svg'
import leftRight from '../../public/aback.svg';
import styles from '../styles/VisorImages.module.css'

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
        <div className={`${styles.slider} ${automaticTransition ? styles.withTransition : ''}`}>
            <div id="carousel" ref={carouselRef}>
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`image ${index === currentIndex ? 'active' : ''}`}
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
                    </div>
                ))}
            </div>

            <div id="arrows">
                <button id="prevBtn" onClick={prevImage}>
                    <Image
                        src={left}
                        priority
                        alt="Flecha izquierda"
                    />
                </button>

                <button id="nextBtn" onClick={nextImage}>
                    <Image
                        src={leftRight}
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
        })
    ).isRequired,
    automaticTransition: PropTypes.bool,
};

export default VisorImages;