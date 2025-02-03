// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import useSlider from "@/hooks/useSlider";
// import Image from "next/image";
// import styles from "@/styles/FullViewSlider.module.scss";

// export default function FullViewportSlider({ slides }) {
//   const { currentSlide, goToNextSlide, goToPrevSlide, resetTimer } = useSlider(
//     slides.length,
//   );

//   // Comprobación de seguridad para asegurarnos de que slides[currentSlide] existe
//   const currentSlideData = slides[currentSlide] || {};
//   const {
//     images = [],
//     title = "",
//     description = "",
//     price = "",
//     id = "",
//   } = currentSlideData;

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
//             src={images[0] || "/images/1.jpg"}
//             alt={title}
//             layout="fill"
//             objectFit="cover"
//             priority
//           />
//           <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
//             <div className="text-center pt-96">
//               {/* <h2 className="text-4xl font-bold text-white mb-4">{title}</h2> */}
//               <p className="text-xl text-white mb-4">{description}</p>
//               {/* <p className="text-2xl font-bold text-white mb-6">
//                 Precio: ${price}
//               </p> */}
//               <Button asChild>
//                 <a href={`/product/${id}`} className="text-lg bottom-0 inset-y-0">
//                   Ver detalles
//                 </a>
//               </Button>
//             </div>
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

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSlider from "@/hooks/useSlider";
import Image from "next/image";
import styles from "@/styles/FullViewSlider.module.scss";

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
            src={images[0] || "/placeholder.svg"}
            alt="Slide image"
            layout="fill"
            objectFit="cover"
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
