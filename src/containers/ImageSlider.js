import { useState, useEffect } from 'react';
import Image from 'next/image';
import left from '../../public/left.png';
import right from '../../public/right.png';
import styles from '../styles/ImageSlider.module.css';

const ImageSlider = ({ imagePaths, enableTransition = true }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const goToPreviousSlide = () => {
        setCurrentImageIndex(prevIndex =>
            prevIndex === 0 ? imagePaths.length - 1 : prevIndex - 1
        );
    };

    const goToNextSlide = () => {
        setCurrentImageIndex(prevIndex =>
            prevIndex === imagePaths.length - 1 ? 0 : prevIndex + 1
        );
    };

    useEffect(() => {
        let interval;
        if (enableTransition) {
            interval = setInterval(goToNextSlide, 5000);
        }

        return () => clearInterval(interval);
    }, [currentImageIndex, enableTransition]);

    return (
        <div className={styles.image}>
            <Image
                src={imagePaths[currentImageIndex]}
                alt="Slide"
                width={300}
                height={200}
            />

            <div className={styles.buttonContainer}>
                <button onClick={goToPreviousSlide} className={styles.left}>
                    <Image
                        alt='Arrow left'
                        src={left}
                        width={20}
                        height={20}
                    />
                </button>

                <button onClick={goToNextSlide} className={styles.right}>
                    <Image
                        alt='Arrow right'
                        src={right}
                        width={20}
                        height={20}
                    />
                </button>
            </div>
        </div>
    );
};

export default ImageSlider;
