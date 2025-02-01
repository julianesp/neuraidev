"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSlider from "@/hooks/useSlider";

export default function FullViewportSlider({ slides }) {
  const { currentSlide, goToNextSlide, goToPrevSlide, resetTimer } = useSlider(
    slides.length,
  );

  return (
    <div className="relative h-full w-full">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={slides[currentSlide].image || "/placeholder.svg"}
            alt={slides[currentSlide].title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                {slides[currentSlide].title}
              </h2>
              <Button asChild>
                <a href={slides[currentSlide].link} className="text-lg">
                  Learn More
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75"
        onClick={() => {
          goToPrevSlide();
          resetTimer();
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75"
        onClick={() => {
          goToNextSlide();
          resetTimer();
        }}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
