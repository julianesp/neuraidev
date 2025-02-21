// import Image from "next/image";
// import Link from "next/link";
// import styles from "@/styles/Articles.module.scss";

// export default function Advertisement({
//   businessName,
//   description,
//   imageUrl,
//   linkUrl,
// }) {
//   return (
//     <div
//       className={`p-3 bg-white shadow-md rounded-lg overflow-hidden max-w-sm mx-auto rounded-s-xs`}
//     >
//       <div className={`${styles.image} relative h-48 w-full`}>
// <Image
//   src={
//     imageUrl ||
//     "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc"
//   }
//   alt={businessName}
//   layout="fill"
//   objectFit="cover"
//   className="p-6"
// />
//       </div>
//       <div className="p-4">
//         <h2 className="text-xl font-semibold mb-2">{businessName}</h2>
//         <p className="text-gray-600 mb-4">{description}</p>
//         <Link
//           href={linkUrl}
//           className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           Más información
//         </Link>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";

// export default function AdvertisementToggle({
//   businessName,
//   description,
//   imageUrl,
//   linkUrl,
// }) {
//   const [isVisible, setIsVisible] = useState(false);

//   return (
//     <div className="relative">
//       {/* Botón flotante */}
//       <button
//         onClick={() => setIsVisible(!isVisible)}
//         className="fixed top-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50"
//       >
//         {isVisible ? "Ocultar" : "Mostrar"}
//       </button>

//       {/* Contenedor animado con framer-motion */}
//       <AnimatePresence>
//         {isVisible && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.3, ease: "easeInOut" }}
//             className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full sm:relative sm:translate-x-0"
//           >
//             <div className="relative h-48 w-full">
//               <Image
//                 src={
//                   imageUrl ||
//                   "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc"
//                 }
//                 alt={businessName}
//                 layout="fill"
//                 objectFit="cover"
//                 className="p-6"
//               />
//             </div>
//             <div className="p-4">
//               <h2 className="text-xl font-semibold mb-2">{businessName}</h2>
//               <p className="text-gray-600 mb-4">{description}</p>
//               <Link
//                 href={linkUrl}
//                 className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//               >
//                 Más información
//               </Link>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";

// export default function AdvertisementToggle({
//   businessName,
//   description,
//   imageUrl,
//   linkUrl,
// }) {
//   const [isVisible, setIsVisible] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   // Verifica el tamaño de la pantalla al cargar y cuando se redimensiona
//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIsMobile(window.innerWidth >= 320 && window.innerWidth <= 768);
//     };

//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);

//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, []);

//   return (
//     <div className="relative">
//       {/* Botón flotante solo en móviles (320px - 768px) */}
//       {isMobile && (
//         <button
//           onClick={() => setIsVisible(!isVisible)}
//           className="fixed top-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50 md:hidden"
//         >
//           {isVisible ? "Ocultar" : "Mostrar"}
//         </button>
//       )}

//       {/* Contenedor animado con framer-motion */}
//       <AnimatePresence>
//         {isVisible && isMobile && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.3, ease: "easeInOut" }}
//             className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full sm:relative sm:translate-x-0"
//           >
//             <div className="relative h-48 w-full">
//               <Image
//                 src={
//                   imageUrl ||
//                   "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc"
//                 }
//                 alt={businessName}
//                 layout="fill"
//                 objectFit="cover"
//                 className="p-6"
//               />
//             </div>
//             <div className="p-4">
//               <h2 className="text-xl font-semibold mb-2">{businessName}</h2>
//               <p className="text-gray-600 mb-4">{description}</p>
//               <Link
//                 href={linkUrl}
//                 className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//               >
//                 Más información
//               </Link>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";

// export default function AdvertisementToggle({
//   businessName,
//   description,
//   imageUrl,
//   linkUrl,
// }) {
//   const [isVisible, setIsVisible] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   // Detecta el tamaño de la pantalla y actualiza el estado
//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIsMobile(window.innerWidth >= 320 && window.innerWidth <= 768);
//     };

//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);

//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, []);

//   return (
//     <div className="relative">
//       {/* BOTÓN SOLO EN MÓVILES */}
//       {isMobile && (
//         <button
//           onClick={() => setIsVisible(!isVisible)}
//           className="fixed bottom-3 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50 md:hidden"
//         >
//           {isVisible ? "Ocultar" : "Mostrar"}
//         </button>
//       )}

//       {/* ANUNCIO EN MÓVIL (ANIMADO) */}
//       {isMobile ? (
//         <AnimatePresence>
//           {isVisible && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3, ease: "easeInOut" }}
//               className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full sm:relative sm:translate-x-0"
//             >
//               <AdContent
//                 businessName={businessName}
//                 description={description}
//                 imageUrl={imageUrl}
//                 linkUrl={linkUrl}
//               />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       ) : (
//         // ANUNCIO SIEMPRE VISIBLE EN PANTALLAS GRANDES
//         <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full mx-auto">
//           <AdContent
//             businessName={businessName}
//             description={description}
//             imageUrl={imageUrl}
//             linkUrl={linkUrl}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// // Componente separado para reutilizar el contenido del anuncio
// function AdContent({ businessName, description, imageUrl, linkUrl }) {
//   return (
//     <>
//       <div className="relative h-48 w-full">
//         <Image
//           src={
//             imageUrl ||
//             "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc"
//           }
//           alt={businessName}
//           layout="fill"
//           objectFit="cover"
//           className="p-6"
//         />
//       </div>
//       <div className="p-4">
//         <h2 className="text-xl font-semibold mb-2">{businessName}</h2>
//         <p className="text-gray-600 mb-4">{description}</p>
//         <Link
//           href={linkUrl}
//           className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           Más información
//         </Link>
//       </div>
//     </>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";

// export default function AdvertisementToggle({
//   businessName,
//   description,
//   imageUrl,
//   linkUrl,
// }) {
//   const [isVisible, setIsVisible] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   // Detecta el tamaño de la pantalla y actualiza el estado
//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIsMobile(window.innerWidth >= 320 && window.innerWidth <= 768);
//     };

//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);

//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, []);

//   return (
//     <div className="relative">
//       {/* BOTÓN SOLO EN MÓVILES */}
//       {isMobile && (
//         <button
//           onClick={() => setIsVisible(!isVisible)}
//           className="fixed bottom-3 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50 md:hidden flex items-center justify-center w-12 h-12"
//         >
//           <Image
//             src={isVisible ? "/close-icon.svg" : "/menu-icon.svg"}
//             alt="Toggle Anuncios"
//             width={24}
//             height={24}
//           />
//         </button>
//       )}

//       {/* ANUNCIO EN MÓVIL (ANIMADO) */}
//       {isMobile ? (
//         <AnimatePresence>
//           {isVisible && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3, ease: "easeInOut" }}
//               className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full sm:relative sm:translate-x-0"
//             >
//               <AdContent
//                 businessName={businessName}
//                 description={description}
//                 imageUrl={imageUrl}
//                 linkUrl={linkUrl}
//               />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       ) : (
//         // ANUNCIO SIEMPRE VISIBLE EN PANTALLAS GRANDES
//         <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full mx-auto">
//           <AdContent
//             businessName={businessName}
//             description={description}
//             imageUrl={imageUrl}
//             linkUrl={linkUrl}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// // Componente separado para reutilizar el contenido del anuncio
// function AdContent({ businessName, description, imageUrl, linkUrl }) {
//   return (
//     <>
//       <div className="relative h-48 w-full">
//         <Image
//           src={
//             imageUrl ||
//             "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc"
//           }
//           alt={businessName}
//           layout="fill"
//           objectFit="cover"
//           className="p-6"
//         />
//       </div>
//       <div className="p-4">
//         <h2 className="text-xl font-semibold mb-2">{businessName}</h2>
//         <p className="text-gray-600 mb-4">{description}</p>
//         <Link
//           href={linkUrl}
//           className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           Más información
//         </Link>
//       </div>
//     </>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function AdvertisementToggle({ ads = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth >= 320 && window.innerWidth <= 767);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="relative">
      {isMobile && (
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="fixed bottom-1 right-1 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50 md:hidden flex items-center justify-center w-12 h-12 "
        >
          <Image
            src={
              isVisible
                ? "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4"
                : "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4"
            }
            alt="Toggle Anuncios"
            width={24}
            height={24}
          />
        </button>
      )}

      {isMobile ? (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full sm:relative sm:translate-x-0"
            >
              <div className="max-h-[80vh] overflow-y-auto p-4 space-y-4">
                {Array.isArray(ads) &&
                  ads.map((ad, index) => <AdContent key={index} {...ad} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.isArray(ads) &&
            ads.map((ad, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full mx-auto"
              >
                <AdContent {...ad} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// Componente separado para reutilizar el contenido del anuncio
function AdContent({ businessName, description, imageUrl, linkUrl }) {
  return (
    <>
      <div className="relative h-48 w-full">
        <Image
          src={
            imageUrl ||
            "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc"
          }
          alt={businessName}
          layout="fill"
          objectFit="cover"
          className="p-6"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{businessName}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link
          href={linkUrl}
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Más información
        </Link>
      </div>
    </>
  );
}
