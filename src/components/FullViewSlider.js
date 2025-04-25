"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSlider from "@/hooks/useSlider";
import Image from "next/image";
import styles from "@/styles/components/FullViewSlider.module.scss";

export default function FullViewportSlider({ slides }) {
  const { currentSlide, goToNextSlide, goToPrevSlide, resetTimer } = useSlider(
    slides.length,
  );

  // Comprobación de seguridad para asegurarnos de que slides[currentSlide] existe
  const currentSlideData = slides[currentSlide] || {};
  const { images = [], id = "" } = currentSlideData;

  return (
    <div className={`${styles.container} relative h-full w-full`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={images}
            alt="Slide image"
            width={100}
            height={100}
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <Button asChild className={styles.boton}>
              <a href={`/product/${id}`} className="text-lg text-white">
                Ver Detalles
              </a>
            </Button>
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

// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import useSlider from "@/hooks/useSlider";
// import Image from "next/image";
// import styles from "@/styles/FullViewSlider.module.scss"

// export default function FullViewportSlider({ slides }) {
//   const { currentSlide, goToNextSlide, goToPrevSlide, resetTimer } = useSlider(
//     slides.length,
//   );

//   // Comprobación de seguridad para asegurarnos de que slides[currentSlide] existe
//   const currentSlideData = slides[currentSlide] || {};
//   const { images = [], id = "" } = currentSlideData;

//   return (
//     <div className={`${styles.container} relative h-full w-full`}>
//       <AnimatePresence initial={false}>
//         <motion.div
//           key={currentSlide}
//           className="absolute inset-0"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <Image
//             src={
//               images[0] && images[0].trim() !== ""
//                 ? images[0]
//                 : "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation_my_profile.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb25fbXlfcHJvZmlsZS5qcGciLCJpYXQiOjE3Mzg2MzY5NDksImV4cCI6MTc3MDE3Mjk0OX0.KjD9ryiI8Yr6_wjmPp0ya2GYQBHFbYrthR2swZVeXEY"
//             }
//             alt="Slide image"
//             layout="fill"
//             objectFit="cover"
//             priority
//             onError={(e) => {
//               e.target.onerror = null;
//               e.target.src =
//                 "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation_my_profile.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb25fbXlfcHJvZmlsZS5qcGciLCJpYXQiOjE3Mzg2MzY5NDksImV4cCI6MTc3MDE3Mjk0OX0.KjD9ryiI8Yr6_wjmPp0ya2GYQBHFbYrthR2swZVeXEY";
//             }}
//           />
//           <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
//             <Button asChild>
//               <a href={`/product/${id}`} className="text-lg">
//                 Ver Detalles
//               </a>
//             </Button>
//           </div>
//         </motion.div>
//       </AnimatePresence>

//       <Button
//         variant="outline"
//         size="icon"
//         className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75"
//         onClick={() => {
//           goToPrevSlide();
//           resetTimer();
//         }}
//       >
//         <ChevronLeft className="h-6 w-6" />
//       </Button>
//       <Button
//         variant="outline"
//         size="icon"
//         className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75"
//         onClick={() => {
//           goToNextSlide();
//           resetTimer();
//         }}
//       >
//         <ChevronRight className="h-6 w-6" />
//       </Button>
//     </div>
//   );
// }
