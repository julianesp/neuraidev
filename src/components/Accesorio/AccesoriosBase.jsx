// import React from "react";
// import Link from "next/link";
// import Image from "next/image";

// /**
//  * Componente base para mostrar accesorios de tienda
//  * @param {Object} props - Propiedades del componente
//  * @param {Array} props.accesorios - Lista de accesorios a mostrar
//  * @param {string} props.titulo - Título de la sección
//  * @param {string} props.className - Clases CSS adicionales
//  * @param {boolean} props.mostrarPrecio - Indica si se muestra el precio
//  * @param {boolean} props.mostrarDescripcion - Indica si se muestra la descripción
//  * @param {Function} props.onAccesorioClick - Función para manejar el clic en un accesorio
//  * @param {React.ReactNode} props.children - Elementos hijos para extender el componente
//  */
// const AccesoriosBase = ({
//   accesorios = [],
//   titulo = "Accesorios",
//   className = "",
//   mostrarPrecio = true,
//   mostrarDescripcion = false,
//   onAccesorioClick = () => {},
//   children,
// }) => {
//   return (
//     <div className={`accesorios-container ${className}`}>
//       <h2 className="text-2xl font-bold mb-6">{titulo}</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {accesorios.map((accesorio) => (
//           <div
//             key={accesorio.id}
//             className="accesorio-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
//             onClick={() => onAccesorioClick(accesorio)}
//           >
//             <Link href={`/accesorios/${accesorio.id}`}>
//               <div className="relative h-48 w-full">
//                 <Image
//                   src={accesorio.imagen || "/placeholder-accesorio.jpg"}
//                   alt={accesorio.nombre}
//                   fill
//                   className="object-cover"
//                 />
//                 {accesorio.descuento > 0 && (
//                   <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
//                     {accesorio.descuento}% OFF
//                   </span>
//                 )}
//               </div>

//               <div className="p-4">
//                 <h3 className="font-semibold text-lg">{accesorio.nombre}</h3>

//                 {mostrarDescripcion && accesorio.descripcion && (
//                   <p className="text-gray-600 mt-1 text-sm">
//                     {accesorio.descripcion}
//                   </p>
//                 )}

//                 {mostrarPrecio && (
//                   <div className="mt-2 flex items-center">
//                     <span className="font-bold text-lg">
//                       ${accesorio.precio.toFixed(2)}
//                     </span>
//                     {accesorio.precioAnterior > 0 && (
//                       <span className="ml-2 text-gray-500 line-through text-sm">
//                         ${accesorio.precioAnterior.toFixed(2)}
//                       </span>
//                     )}
//                   </div>
//                 )}

//                 <div className="mt-2 flex items-center">
//                   {Array.from({ length: 5 }).map((_, index) => (
//                     <svg
//                       key={index}
//                       className={`w-4 h-4 ${index < accesorio.calificacion ? "text-yellow-400" : "text-gray-300"}`}
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                     </svg>
//                   ))}
//                   <span className="ml-1 text-sm text-gray-600">
//                     ({accesorio.numResenas})
//                   </span>
//                 </div>
//               </div>
//             </Link>
//           </div>
//         ))}
//       </div>

//       {children}
//     </div>
//   );
// };

// export default AccesoriosBase;

// --------------------------------
// --------------------------------
// --------------------------------

// import React, { useState, useRef } from "react";
// import AccesoriosBase from "./AccesoriosBase";
// import Image from "next/image";

// /**
//  * Componente para mostrar accesorios destacados
//  * Versión con scroll horizontal para dispositivos móviles
//  * Hereda del componente base AccesoriosBase
//  */
// const AccesoriosDestacados = ({ accesorios, ...props }) => {
//   // Filtrar solo los accesorios destacados
//   const destacados = accesorios.filter((acc) => acc.destacado);

//   // Estado para controlar el índice del accesorio actual en vista móvil
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Referencia al contenedor de scroll
//   const scrollContainerRef = useRef(null);

//   // Función para manejar el desplazamiento a la izquierda
//   const scrollLeft = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//       scrollToItem(currentIndex - 1);
//     }
//   };

//   // Función para manejar el desplazamiento a la derecha
//   const scrollRight = () => {
//     if (currentIndex < destacados.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//       scrollToItem(currentIndex + 1);
//     }
//   };

//   // Función para desplazarse a un elemento específico
//   const scrollToItem = (index) => {
//     if (scrollContainerRef.current) {
//       const itemWidth = scrollContainerRef.current.children[0].offsetWidth;
//       scrollContainerRef.current.scrollTo({
//         left: itemWidth * index,
//         behavior: "smooth",
//       });
//     }
//   };

//   // Renderizar el componente base con modificaciones para móviles
//   return (
//     <div className="bg-yellow-50 p-6 rounded-lg">
//       <h2 className="text-2xl font-bold mb-6">Accesorios Destacados</h2>

//       {/* Navegación para móviles */}
//       <div className="flex justify-between items-center mb-4">
//         <button
//           onClick={scrollLeft}
//           disabled={currentIndex === 0}
//           className={`bg-yellow-500 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
//           aria-label="Anterior accesorio"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//         </button>

//         <span className="text-sm text-gray-600">
//           {currentIndex + 1} / {destacados.length}
//         </span>

//         <button
//           onClick={scrollRight}
//           disabled={currentIndex === destacados.length - 1}
//           className={`bg-yellow-500 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === destacados.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
//           aria-label="Siguiente accesorio"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M9 5l7 7-7 7"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Contenedor modificado con scroll horizontal (reemplaza el grid) */}
//       <div
//         ref={scrollContainerRef}
//         className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
//         style={{
//           scrollbarWidth: "none",
//           msOverflowStyle: "none",
//           WebkitOverflowScrolling: "touch",
//         }}
//       >
//         {destacados.map((accesorio, index) => (
//           <div
//             key={accesorio.id}
//             className="accesorio-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 snap-start mx-2"
//             style={{
//               minWidth: "calc(100% - 1rem)",
//               width: "calc(100% - 1rem)",
//               opacity: currentIndex === index ? 1 : 0.7,
//               transform: `scale(${currentIndex === index ? 1 : 0.95})`,
//             }}
//             onClick={() => {
//               setCurrentIndex(index);
//               scrollToItem(index);
//             }}
//           >
//             <div className="relative h-48 w-full">
//               <Image
//                 src={accesorio.imagen || "/placeholder-accesorio.jpg"}
//                 alt={accesorio.nombre}
//                 className="object-cover h-full w-full"
//                 width={200}
//                 height={300}
//               />
//               {accesorio.descuento > 0 && (
//                 <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
//                   {accesorio.descuento}% OFF
//                 </span>
//               )}
//             </div>

//             <div className="p-4">
//               <h3 className="font-semibold text-lg">{accesorio.nombre}</h3>

//               {props.mostrarDescripcion && accesorio.descripcion && (
//                 <p className="text-gray-600 mt-1 text-sm">
//                   {accesorio.descripcion}
//                 </p>
//               )}

//               {props.mostrarPrecio !== false && (
//                 <div className="mt-2 flex items-center">
//                   <span className="font-bold text-lg">
//                     ${accesorio.precio?.toFixed(2)}
//                   </span>
//                   {accesorio.precioAnterior > 0 && (
//                     <span className="ml-2 text-gray-500 line-through text-sm">
//                       ${accesorio.precioAnterior.toFixed(2)}
//                     </span>
//                   )}
//                 </div>
//               )}

//               <div className="mt-2 flex items-center">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <svg
//                     key={i}
//                     className={`w-4 h-4 ${i < (accesorio.calificacion || 0) ? "text-yellow-400" : "text-gray-300"}`}
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                   </svg>
//                 ))}
//                 <span className="ml-1 text-sm text-gray-600">
//                   ({accesorio.numResenas || 0})
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Indicadores de paginación (puntos) */}
//       <div className="flex justify-center mt-4 space-x-2">
//         {destacados.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => {
//               setCurrentIndex(index);
//               scrollToItem(index);
//             }}
//             className={`h-2 rounded-full transition-all duration-300 focus:outline-none
//               ${currentIndex === index ? "bg-yellow-500 w-4" : "bg-gray-300 w-2"}`}
//             aria-label={`Ir al accesorio ${index + 1}`}
//           ></button>
//         ))}
//       </div>

//       <div className="mt-6 text-center">
//         <p className="text-gray-600 mb-4">
//           Estos son nuestros productos más populares
//         </p>
//         <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors">
//           Ver todos los destacados
//         </button>
//       </div>
//     </div>
//   );
// };

// // CSS para ocultar la barra de desplazamiento
// const style = document.createElement("style");
// style.textContent = `
//   /* Ocultar scrollbar para Chrome, Safari y Opera */
//   .scrollbar-hide::-webkit-scrollbar {
//     display: none;
//   }
// `;
// document.head.appendChild(style);

// export default AccesoriosDestacados;

// import React, { useState, useRef, useEffect } from "react";
// import AccesoriosBase from "./AccesoriosBase";
// import Image from "next/image";

// /**
//  * Componente para mostrar accesorios destacados
//  * Versión con scroll horizontal para dispositivos móviles
//  * Hereda del componente base AccesoriosBase
//  */
// const AccesoriosDestacados = ({ accesorios, ...props }) => {
//   // Filtrar solo los accesorios destacados
//   const destacados = accesorios.filter((acc) => acc.destacado);

//   // Estado para controlar el índice del accesorio actual en vista móvil
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Referencia al contenedor de scroll
//   const scrollContainerRef = useRef(null);

//   // Efecto para agregar el estilo para ocultar la barra de desplazamiento
//   useEffect(() => {
//     // Creamos el elemento style solo en el lado del cliente
//     const style = document.createElement("style");
//     style.textContent = `
//       /* Ocultar scrollbar para Chrome, Safari y Opera */
//       .scrollbar-hide::-webkit-scrollbar {
//         display: none;
//       }
//     `;

//     // Añadimos el estilo al head
//     document.head.appendChild(style);

//     // Función de limpieza para remover el estilo cuando el componente se desmonte
//     return () => {
//       document.head.removeChild(style);
//     };
//   }, []); // Array de dependencias vacío para que se ejecute solo una vez

//   // Función para manejar el desplazamiento a la izquierda
//   const scrollLeft = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//       scrollToItem(currentIndex - 1);
//     }
//   };

//   // Función para manejar el desplazamiento a la derecha
//   const scrollRight = () => {
//     if (currentIndex < destacados.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//       scrollToItem(currentIndex + 1);
//     }
//   };

//   // Función para desplazarse a un elemento específico
//   const scrollToItem = (index) => {
//     if (scrollContainerRef.current) {
//       const itemWidth =
//         scrollContainerRef.current.querySelector(".accesorio-item")
//           ?.offsetWidth || 0;
//       scrollContainerRef.current.scrollTo({
//         left: itemWidth * index,
//         behavior: "smooth",
//       });
//     }
//   };

//   return (
//     <AccesoriosBase
//       accesorios={destacados}
//       titulo="Accesorios Destacados"
//       className="bg-yellow-50 p-6 rounded-lg"
//       {...props}
//       renderItems={() => (
//         <div className="relative">
//           {/* Navegación para móviles */}
//           <div className="flex justify-between items-center mb-4">
//             <button
//               onClick={scrollLeft}
//               disabled={currentIndex === 0}
//               className={`bg-yellow-500 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
//               aria-label="Anterior accesorio"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 19l-7-7 7-7"
//                 />
//               </svg>
//             </button>

//             <span className="text-sm text-gray-600">
//               {currentIndex + 1} / {destacados.length}
//             </span>

//             <button
//               onClick={scrollRight}
//               disabled={currentIndex === destacados.length - 1}
//               className={`bg-yellow-500 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 focus:outline-none ${currentIndex === destacados.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
//               aria-label="Siguiente accesorio"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 5l7 7-7 7"
//                 />
//               </svg>
//             </button>
//           </div>

//           {/* Contenedor con scroll horizontal */}
//           <div
//             ref={scrollContainerRef}
//             className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
//             style={{
//               scrollbarWidth: "none",
//               msOverflowStyle: "none",
//               WebkitOverflowScrolling: "touch",
//             }}
//           >
//             {destacados.map((accesorio, index) => (
//               <div
//                 key={accesorio.id || index}
//                 className="accesorio-item min-w-full sm:min-w-max sm:w-auto snap-start flex-shrink-0 px-2 transform transition-all duration-300"
//                 style={{
//                   opacity: currentIndex === index ? 1 : 0.7,
//                   transform: `scale(${currentIndex === index ? 1 : 0.95})`,
//                 }}
//               >
//                 {props.renderAccesorio ? (
//                   props.renderAccesorio(accesorio, index)
//                 ) : (
//                   <div className="bg-white p-4 rounded-lg shadow-md">
//                     <h3 className="font-bold text-lg">{accesorio.nombre}</h3>
//                     {accesorio.imagen && (
//                       <Image
//                         src={accesorio.imagen}
//                         alt={accesorio.nombre}
//                         className="my-2 mx-auto h-40 object-contain"
//                       />
//                     )}
//                     <p className="text-gray-700">{accesorio.descripcion}</p>
//                     <p className="text-yellow-600 font-bold mt-2">
//                       ${accesorio.precio}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Indicadores de paginación (puntos) */}
//           <div className="flex justify-center mt-4 space-x-2">
//             {destacados.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => {
//                   setCurrentIndex(index);
//                   scrollToItem(index);
//                 }}
//                 className={`h-2 w-2 rounded-full transition-all duration-300 focus:outline-none
//                   ${currentIndex === index ? "bg-yellow-500 w-4" : "bg-gray-300"}`}
//                 aria-label={`Ir al accesorio ${index + 1}`}
//               ></button>
//             ))}
//           </div>
//         </div>
//       )}
//     >
//       <div className="mt-6 text-center">
//         <p className="text-gray-600 mb-4">
//           Estos son nuestros productos más populares
//         </p>
//         <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors">
//           Ver todos los destacados
//         </button>
//       </div>
//     </AccesoriosBase>
//   );
// };

// export default AccesoriosDestacados;
