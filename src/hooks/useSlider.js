import { useState, useEffect, useCallback, useRef } from "react";

export default function useSlider(totalSlides) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef(null);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    requestAnimationFrame(() => {
      timerRef.current = setTimeout(goToNextSlide, 5000);
    });
  }, [goToNextSlide]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetTimer]);

  return { currentSlide, goToNextSlide, goToPrevSlide, resetTimer };
}
