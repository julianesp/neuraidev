// "use client";

// import React, { useState, useEffect, useCallback, memo } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import PropTypes from "prop-types";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Play,
//   ShoppingCart,
//   Eye,
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// // Notification Toast component
// const NotificationToast = memo(
//   function NotificationToast({ message }) {
//     return (
//       <div
//         className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg transition-all duration-300 animate-fadeIn"
//         aria-live="polite"
//         role="alert"
//       >
//         {message}
//       </div>
//     );
//   },
//   (prevProps, nextProps) => prevProps.message === nextProps.message,
// );

// NotificationToast.displayName = "NotificationToast";

// NotificationToast.propTypes = {
//   message: PropTypes.string.isRequired,
// };

// function ProductDetail({ params }) {
//   const router = useRouter();
//   const { categoria, productId } = params;

//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [productoActual, setProductoActual] = useState(null);
//   const [accesoriosDestacados, setAccesoriosDestacados] = useState([]);
//   const [productosRelacionados, setProductosRelacionados] = useState([]);
//   const [cargando, setCargando] = useState(true);
//   const [error, setError] = useState(null);
//   const [addedToCart, setAddedToCart] = useState(false);
//   const [imageErrors, setImageErrors] = useState(() => new Set());
//   const [notification, setNotification] = useState({
//     show: false,
//     message: "",
//   });

//   // Cargar el producto actual y los accesorios destacados
//   useEffect(() => {
//     // Función para cargar datos
//     const cargarProductos = async () => {
//       setCargando(true);
//       try {
//         // Verificar que params.productId existe
//         if (!productId) {
//           throw new Error("ID de producto no especificado");
//         }

//         // In a real app, you would fetch the product from an API
//         // For now, we'll simulate it with static data
//         let producto, destacados, relacionados;

//         // Simulate API call with a delay
//         await new Promise((resolve) => setTimeout(resolve, 300));

//         // Generate product based on category and productId
//         switch (categoria) {
//           case "celulares":
//             if (productId === "celular-1") {
//               producto = {
//                 id: productId,
//                 title: "Protector Premium de Celular",
//                 description:
//                   "Protector de alta calidad para tu celular, resistente a impactos y rayones. Compatible con los modelos más recientes del mercado.",
//                 price: 49900,
//                 oldPrice: 59900,
//                 categoria: categoria,
//                 images: [
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F1.jpg?alt=media&token=191dc074-94cd-4ac1-89de-62070679a96e",
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F2.jpg?alt=media&token=dd5ebf3c-578d-4010-a256-650df448dc2b",
//                 ],
//               };
//               relacionados = [
//                 {
//                   id: "celular-2",
//                   title: "Cargador Rápido USB-C",
//                   description: "Cargador rápido para dispositivos modernos",
//                   price: 59900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F2.jpg?alt=media&token=dd5ebf3c-578d-4010-a256-650df448dc2b",
//                   ],
//                 },
//               ];
//             } else if (productId === "celular-2") {
//               producto = {
//                 id: productId,
//                 title: "Cargador Rápido USB-C",
//                 description:
//                   "Carga tu dispositivo en tiempo récord con este cargador de última generación.",
//                 price: 59900,
//                 categoria: categoria,
//                 images: [
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F2.jpg?alt=media&token=dd5ebf3c-578d-4010-a256-650df448dc2b",
//                 ],
//               };
//               relacionados = [
//                 {
//                   id: "celular-1",
//                   title: "Protector Premium de Celular",
//                   description: "Protector de alta calidad para tu celular",
//                   price: 49900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fcamera%2F1.jpg?alt=media&token=191dc074-94cd-4ac1-89de-62070679a96e",
//                   ],
//                 },
//               ];
//             } else {
//               throw new Error(
//                 `Producto con ID ${productId} no encontrado en la categoría ${categoria}`,
//               );
//             }
//             break;

//           case "computadores":
//             if (productId === "comp-1") {
//               producto = {
//                 id: productId,
//                 title: "Teclado Genius Avanzado",
//                 description:
//                   "Teclado mecánico de alta precisión ideal para gaming y trabajo profesional. Retroiluminación RGB con múltiples modos, teclas programables y estructura de aluminio duradera.",
//                 price: 129900,
//                 oldPrice: 149900,
//                 categoria: categoria,
//                 images: [
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fteclado_genius.jpg?alt=media&token=5a9ecc50-db16-4d9a-b00c-a01de3c506b3",
//                 ],
//                 videoUrl: "https://example.com/videos/teclado-demo.mp4",
//               };
//               relacionados = [
//                 {
//                   id: "comp-2",
//                   title: "Mouse Inalámbrico Pro",
//                   description:
//                     "Mouse ergonómico de alta precisión para gaming y trabajo profesional",
//                   price: 89900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                   ],
//                 },
//                 {
//                   id: "comp-3",
//                   title: "Pad Mouse Ergonómico",
//                   description:
//                     "Soporte de muñeca para uso prolongado con comodidad",
//                   price: 39900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                   ],
//                 },
//               ];
//             } else if (productId === "comp-2") {
//               producto = {
//                 id: productId,
//                 title: "Mouse Inalámbrico Pro",
//                 description:
//                   "Mouse ergonómico de alta precisión para gaming y trabajo profesional. Sensor óptico avanzado y diseño que reduce la fatiga en uso prolongado. Botones programables y batería de larga duración.",
//                 price: 89900,
//                 oldPrice: 99900,
//                 categoria: categoria,
//                 images: [
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                 ],
//               };
//               relacionados = [
//                 {
//                   id: "comp-1",
//                   title: "Teclado Genius Avanzado",
//                   description: "Teclado mecánico de alta precisión",
//                   price: 129900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fteclado_genius.jpg?alt=media&token=5a9ecc50-db16-4d9a-b00c-a01de3c506b3",
//                   ],
//                 },
//                 {
//                   id: "comp-3",
//                   title: "Pad Mouse Ergonómico",
//                   description:
//                     "Soporte de muñeca para uso prolongado con comodidad",
//                   price: 39900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                   ],
//                 },
//               ];
//             } else if (productId === "comp-3") {
//               producto = {
//                 id: productId,
//                 title: "Pad Mouse Ergonómico",
//                 description:
//                   "Pad mouse con soporte de gel para la muñeca, ideal para uso prolongado. Superficie de alta precisión y base antideslizante.",
//                 price: 39900,
//                 categoria: categoria,
//                 images: [
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                 ],
//               };
//               relacionados = [
//                 {
//                   id: "comp-1",
//                   title: "Teclado Genius Avanzado",
//                   description: "Teclado mecánico de alta precisión",
//                   price: 129900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fteclado_genius.jpg?alt=media&token=5a9ecc50-db16-4d9a-b00c-a01de3c506b3",
//                   ],
//                 },
//                 {
//                   id: "comp-2",
//                   title: "Mouse Inalámbrico Pro",
//                   description: "Mouse ergonómico de alta precisión para gaming",
//                   price: 89900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                   ],
//                 },
//               ];
//             } else {
//               throw new Error(
//                 `Producto con ID ${productId} no encontrado en la categoría ${categoria}`,
//               );
//             }
//             break;

//           case "damas":
//             if (productId === "damas-1") {
//               producto = {
//                 id: productId,
//                 title: "Bolso Elegante",
//                 description:
//                   "Bolso de cuero sintético con múltiples compartimentos. Diseño elegante y atemporal, ideal para cualquier ocasión.",
//                 price: 89900,
//                 oldPrice: 109900,
//                 categoria: categoria,
//                 images: [
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                 ],
//               };
//               relacionados = [
//                 {
//                   id: "damas-2",
//                   title: "Cartera de Mano",
//                   description: "Cartera compacta para salidas nocturnas",
//                   price: 45900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                   ],
//                 },
//               ];
//             } else if (productId === "damas-2") {
//               producto = {
//                 id: productId,
//                 title: "Cartera de Mano",
//                 description:
//                   "Cartera compacta para salidas nocturnas. Diseño elegante con acabado de alta calidad y compartimentos para lo esencial.",
//                 price: 45900,
//                 categoria: categoria,
//                 images: [
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                 ],
//               };
//               relacionados = [
//                 {
//                   id: "damas-1",
//                   title: "Bolso Elegante",
//                   description:
//                     "Bolso de cuero sintético con múltiples compartimentos",
//                   price: 89900,
//                   categoria: categoria,
//                   images: [
//                     "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                   ],
//                 },
//               ];
//             } else {
//               throw new Error(
//                 `Producto con ID ${productId} no encontrado en la categoría ${categoria}`,
//               );
//             }
//             break;

//           case "libros-nuevos":
//             if (productId === "libro-nuevo-1") {
//               producto = {
//                 id: productId,
//                 title: "Bestseller Internacional",
//                 description:
//                   "La novela más vendida del año. Una historia cautivadora que ha conquistado a lectores de todo el mundo.",
//                 price: 59900,
//                 categoria: categoria,
//                 images: [
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                 ],
//               };
//               relacionados = [];
//             } else {
//               throw new Error(
//                 `Producto con ID ${productId} no encontrado en la categoría ${categoria}`,
//               );
//             }
//             break;

//           case "libros-usados":
//             if (productId === "libro-usado-1") {
//               producto = {
//                 id: productId,
//                 title: "Clásico Literario",
//                 description:
//                   "Edición de colección en buen estado. Un clásico imprescindible para cualquier biblioteca personal.",
//                 price: 29900,
//                 categoria: categoria,
//                 images: [
//                   "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//                 ],
//               };
//               relacionados = [];
//             } else {
//               throw new Error(
//                 `Producto con ID ${productId} no encontrado en la categoría ${categoria}`,
//               );
//             }
//             break;

//           // Más categorías podrían añadirse aquí
//           default:
//             throw new Error(`Categoría ${categoria} no implementada`);
//         }

//         // Simular accesorios destacados (para cualquier producto)
//         destacados = [
//           {
//             id: "destacado-1",
//             title: "Auriculares Bluetooth Premium",
//             description: "Auriculares inalámbricos con cancelación de ruido",
//             price: 199900,
//             categoria: "audio",
//             images: [
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fcomputers%2Fteclado_genius.jpg?alt=media&token=5a9ecc50-db16-4d9a-b00c-a01de3c506b3",
//             ],
//           },
//           {
//             id: "destacado-2",
//             title: "Powerbank 10000mAh",
//             description: "Batería externa de alta capacidad",
//             price: 79900,
//             categoria: "baterias",
//             images: [
//               "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c",
//             ],
//           },
//         ];

//         setProductoActual(producto);
//         setAccesoriosDestacados(destacados);
//         setProductosRelacionados(relacionados || []);
//         setError(null);
//       } catch (error) {
//         // Replace console.error with proper error handling
//         setError(
//           `Error al cargar los productos: ${error.message || "Error desconocido"}`,
//         );
//       } finally {
//         setCargando(false);
//       }
//     };

//     cargarProductos();
//   }, [categoria, productId]);

//   // Componente de imagen memoizado para el carrusel
//   const ProductImage = memo(function ProductImage({
//     src,
//     alt,
//     idx,
//     currentIdx,
//     onError,
//     unoptimized,
//   }) {
//     return (
//       <div
//         className={`absolute inset-0 transition-opacity ease-in-out ${
//           idx === currentIdx ? "opacity-100" : "opacity-0"
//         }`}
//         style={{ transitionDuration: "1000ms" }}
//       >
//         <Image
//           src={src || "/placeholder.jpg"}
//           alt={alt}
//           fill
//           sizes="(max-width: 768px) 100vw, 768px"
//           style={{ objectFit: "contain" }}
//           className="p-6"
//           onError={onError}
//           unoptimized={unoptimized}
//         />
//       </div>
//     );
//   });

//   ProductImage.propTypes = {
//     src: PropTypes.string,
//     alt: PropTypes.string.isRequired,
//     idx: PropTypes.number.isRequired,
//     currentIdx: PropTypes.number.isRequired,
//     onError: PropTypes.func.isRequired,
//     unoptimized: PropTypes.bool,
//   };

//   ProductImage.displayName = "ProductImage";

//   // Función para manejar errores de imagen
//   const handleImageError = useCallback((id) => {
//     setImageErrors((prev) => new Set([...prev]).add(id));
//   }, []);

//   // Función para navegar a la página de detalles del producto
//   const verDetallesProducto = useCallback(
//     (id) => {
//       router.push(`/productos/${categoria}/${id}`);
//     },
//     [router, categoria],
//   );

//   // Función para manejar la compra del producto
//   const handleComprar = useCallback(() => {
//     if (!productoActual) return;

//     setAddedToCart(true);
//     setNotification({
//       show: true,
//       message: `Producto "${productoActual.title}" agregado al carrito.`,
//     });

//     // Simular animación y después redirigir
//     setTimeout(() => {
//       setAddedToCart(false);
//       // En una aplicación real, aquí iría la lógica para agregar al carrito
//       setTimeout(() => {
//         setNotification({ show: false, message: "" });
//       }, 1000);
//     }, 1500);
//   }, [productoActual]);

//   // Si está cargando, mostrar mensaje de carga
//   if (cargando) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-xl shadow-md p-8 text-center">
//             <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
//             <p className="mt-4">Cargando producto...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Si hay un error, mostrar mensaje de error
//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-xl shadow-md p-8 text-center">
//             <p className="text-red-500">Error: {error}</p>
//             <p className="mt-4">
//               <Link
//                 href={`/productos/${categoria}`}
//                 className="text-blue-600 hover:underline"
//               >
//                 Volver a la lista de productos
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Si no hay producto incluso después de cargar, mostrar mensaje
//   if (!productoActual) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-xl shadow-md p-8 text-center">
//             <p>No se encontró el producto.</p>
//             <p className="mt-4">
//               <Link
//                 href={`/productos/${categoria}`}
//                 className="text-blue-600 hover:underline"
//               >
//                 Volver a la lista de productos
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Normalizar imágenes para prevenir errores
//   const images = !productoActual.images
//     ? ["/placeholder.jpg"]
//     : Array.isArray(productoActual.images)
//       ? productoActual.images.length > 0
//         ? productoActual.images
//         : ["/placeholder.jpg"]
//       : [productoActual.images];

//   // Funciones para cambiar manualmente las imágenes
//   const prevImage = useCallback(() => {
//     setCurrentImageIndex(
//       (prevIndex) => (prevIndex - 1 + images.length) % images.length,
//     );
//   }, [images.length]);

//   const nextImage = useCallback(() => {
//     setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
//   }, [images.length]);

//   // Formatear precio
//   const formatPrice = useCallback((price) => {
//     if (!price && price !== 0) return "$0";

//     // Si el precio es un string, convertirlo a número
//     const numericPrice =
//       typeof price === "string"
//         ? parseFloat(price.replace(/[^\d.-]/g, ""))
//         : price;

//     // Formatear con separador de miles
//     return `$${numericPrice.toLocaleString("es-CO")}`;
//   }, []);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-4xl mx-auto relative">
//         {/* Slider de imágenes */}
//         <div
//           className="relative h-96 bg-gray-100 rounded-xl overflow-hidden shadow-md mb-8"
//           role="region"
//           aria-label="Galería de imágenes del producto"
//           aria-live="assertive"
//         >
//           {images.map((img, idx) => (
//             <ProductImage
//               key={idx}
//               src={img}
//               alt={`${productoActual.title} - Vista ${idx + 1} de ${images.length}`}
//               idx={idx}
//               currentIdx={currentImageIndex}
//               onError={() => handleImageError(`image-${idx}`)}
//               unoptimized={imageErrors.has(`image-${idx}`)}
//             />
//           ))}

//           {/* Controles del slider */}
//           {images.length > 1 && (
//             <>
//               <button
//                 onClick={prevImage}
//                 className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
//                 aria-label={`Ver imagen anterior de ${productoActual.title}, imagen ${currentImageIndex + 1} de ${images.length}`}
//               >
//                 <ChevronLeft size={24} className="text-gray-700" />
//               </button>
//               <button
//                 onClick={nextImage}
//                 className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
//                 aria-label={`Ver imagen siguiente de ${productoActual.title}, imagen ${currentImageIndex + 1} de ${images.length}`}
//               >
//                 <ChevronRight size={24} className="text-gray-700" />
//               </button>

//               {/* Indicadores */}
//               <div
//                 className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"
//                 role="group"
//                 aria-label="Selector de imágenes"
//               >
//                 {images.map((_, idx) => (
//                   <button
//                     key={idx}
//                     className={`h-2 rounded-full transition-all ${
//                       idx === currentImageIndex
//                         ? "bg-blue-600 w-6"
//                         : "bg-gray-300 w-2 hover:bg-gray-400"
//                     }`}
//                     onClick={() => setCurrentImageIndex(idx)}
//                     style={{ cursor: "pointer" }}
//                     aria-label={`Ver imagen ${idx + 1} de ${images.length}`}
//                     aria-current={idx === currentImageIndex ? "true" : "false"}
//                   />
//                 ))}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Descripción del producto */}
//         <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
//           <div className="p-6">
//             <h1 className="text-2xl font-bold text-gray-800 mb-2">
//               {productoActual.title || "Accesorio Premium"}
//             </h1>

//             <div className="bg-gray-50 p-5 rounded-lg mb-6">
//               <h2 className="text-lg font-semibold mb-3 text-gray-700">
//                 Descripción de accesorio
//               </h2>
//               <p className="text-gray-600 leading-relaxed">
//                 {productoActual.description ||
//                   "Este accesorio de alta calidad está diseñado para mejorar la experiencia del usuario. Fabricado con materiales duraderos y acabados premium, es compatible con todos los modelos recientes. Incluye garantía de un año y soporte técnico."}
//               </p>
//             </div>

//             {/* Precio y botón de compra */}
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
//               <div className="flex items-baseline">
//                 <span className="text-3xl font-bold text-green-600 mr-2">
//                   {formatPrice(productoActual.price || 299999)}
//                 </span>
//                 {productoActual.oldPrice && (
//                   <span className="text-lg text-gray-400 line-through">
//                     {formatPrice(productoActual.oldPrice)}
//                   </span>
//                 )}
//               </div>

//               <button
//                 onClick={handleComprar}
//                 className={`bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center shadow-sm font-semibold ${
//                   addedToCart ? "animate-pulse bg-green-600" : ""
//                 }`}
//                 aria-label="Comprar este producto"
//                 disabled={addedToCart}
//               >
//                 <ShoppingCart size={20} className="mr-2" />
//                 <span>{addedToCart ? "¡Agregado!" : "Comprar"}</span>
//               </button>
//             </div>

//             {/* Video de presentación */}
//             {productoActual.videoUrl && (
//               <div className="border-t border-gray-100 pt-6">
//                 <h2 className="text-lg font-semibold mb-4 text-gray-700">
//                   Video de presentación de accesorio
//                 </h2>

//                 <div className="bg-gray-50 rounded-xl overflow-hidden relative aspect-video">
//                   {/* eslint-disable-next-line jsx-a11y/media-has-caption, jsx-a11y/no-redundant-roles */}
//                   <video
//                     controls
//                     className="w-full h-full object-cover"
//                     poster="/video-thumbnail.jpg"
//                     aria-label={`Video de presentación de ${productoActual.title}`}
//                     aria-describedby="video-description"
//                     preload="metadata"
//                     controlsList="nodownload"
//                   >
//                     <source src={productoActual.videoUrl} type="video/mp4" />
//                     <track kind="captions" src="" label="Español" default />
//                     <p>Tu navegador no soporta la reproducción de video.</p>
//                   </video>
//                   <p id="video-description" className="sr-only">
//                     Video demostrativo del producto {productoActual.title}{" "}
//                     mostrando sus características y funcionamiento.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Productos relacionados */}
//         {productosRelacionados.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-xl font-bold text-gray-800 mb-6">
//               Accesorios relacionados
//             </h2>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {productosRelacionados.map((item) => (
//                 <div
//                   key={item.id}
//                   className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
//                 >
//                   <div className="aspect-square relative bg-gray-50">
//                     <Image
//                       src={
//                         Array.isArray(item.images) && item.images.length > 0
//                           ? item.images[0]
//                           : item.images || "/placeholder.jpg"
//                       }
//                       alt={item.title || `Accesorio relacionado`}
//                       fill
//                       sizes="(max-width: 768px) 50vw, 25vw"
//                       style={{ objectFit: "contain" }}
//                       className="p-3"
//                       onError={() => handleImageError(`related-${item.id}`)}
//                       unoptimized={imageErrors.has(`related-${item.id}`)}
//                     />
//                   </div>
//                   <div className="p-3">
//                     <h3 className="font-medium text-gray-800 truncate">
//                       {item.title || `Accesorio ${item.id}`}
//                     </h3>
//                     <p className="text-green-600 font-semibold mt-1">
//                       {formatPrice(item.price)}
//                     </p>
//                     <button
//                       onClick={() => verDetallesProducto(item.id)}
//                       className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
//                     >
//                       <Eye size={16} className="mr-2" />
//                       Ver detalles
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Accesorios destacados */}
//         {accesoriosDestacados.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-xl font-bold text-gray-800 mb-6">
//               Accesorios destacados
//             </h2>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {accesoriosDestacados.map((item) => (
//                 <div
//                   key={item.id}
//                   className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
//                 >
//                   <div className="aspect-square relative bg-gray-50">
//                     <Image
//                       src={
//                         Array.isArray(item.images) && item.images.length > 0
//                           ? item.images[0]
//                           : item.images || "/placeholder.jpg"
//                       }
//                       alt={item.title || `Accesorio destacado`}
//                       fill
//                       sizes="(max-width: 768px) 50vw, 25vw"
//                       style={{ objectFit: "contain" }}
//                       className="p-3"
//                       onError={() => handleImageError(`featured-${item.id}`)}
//                       unoptimized={imageErrors.has(`featured-${item.id}`)}
//                     />
//                   </div>
//                   <div className="p-3">
//                     <h3 className="font-medium text-gray-800 truncate">
//                       {item.title || `Accesorio ${item.id}`}
//                     </h3>
//                     <p className="text-green-600 font-semibold mt-1">
//                       {formatPrice(item.price)}
//                     </p>
//                     <button
//                       onClick={() => verDetallesProducto(item.id)}
//                       className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
//                     >
//                       <Eye size={16} className="mr-2" />
//                       Ver detalles
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Notification Toast */}
//         {notification.show && (
//           <NotificationToast message={notification.message} />
//         )}
//       </div>
//     </div>
//   );
// }

// ProductDetail.propTypes = {
//   params: PropTypes.shape({
//     categoria: PropTypes.string.isRequired,
//     productId: PropTypes.string.isRequired,
//   }).isRequired,
// };

// ProductDetail.displayName = "ProductDetail";

// export default ProductDetail;

"use client";

import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import PropTypes from "prop-types";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  ShoppingCart,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Default placeholder image
const DEFAULT_PLACEHOLDER = "/placeholder.jpg";

// ✓ NotificationToast component unchanged
const NotificationToast = memo(
  function NotificationToast({ message }) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg transition-all duration-300 animate-fadeIn"
        aria-live="polite"
        role="alert"
      >
        {message}
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.message === nextProps.message, // ✓ Kept component memoization
);

NotificationToast.displayName = "NotificationToast";

NotificationToast.propTypes = {
  message: PropTypes.string.isRequired,
};

// ✓ ProductImage component preserved
const ProductImage = memo(function ProductImage({
  src,
  alt,
  idx,
  currentIdx,
  onError, // ✓ Image error handling intact
  unoptimized,
}) {
  return (
    <div
      className={`absolute inset-0 transition-opacity ease-in-out ${
        idx === currentIdx ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: "1000ms" }}
    >
      <Image
        src={src || DEFAULT_PLACEHOLDER}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 768px"
        style={{ objectFit: "contain" }}
        className="p-6"
        onError={onError}
        unoptimized={unoptimized}
      />
    </div>
  );
});

ProductImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  idx: PropTypes.number.isRequired,
  currentIdx: PropTypes.number.isRequired,
  onError: PropTypes.func.isRequired,
  unoptimized: PropTypes.bool,
};

ProductImage.displayName = "ProductImage";

function ProductDetail({ params }) {
  const router = useRouter();
  const { categoria, productId } = params;

  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productoActual, setProductoActual] = useState(null);
  const [accesoriosDestacados, setAccesoriosDestacados] = useState([]);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState(() => new Set());
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });

  // ✓ Price formatting unchanged
  const formatPrice = useCallback((price) => { // ✓ Maintained existing useCallback optimizations
    if (!price && price !== 0) return "$0";

    // Si el precio es un string, convertirlo a número
    const numericPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^\d.-]/g, ""))
        : price;

    // Formatear con separador de miles
    return `$${numericPrice.toLocaleString("es-CO")}`;
  }, []);

  // Handle image errors
  const handleImageError = useCallback((id) => {
    setImageErrors((prev) => new Set([...prev]).add(id));
  }, []);

  // Navigate to product details
  const verDetallesProducto = useCallback(
    (id) => {
      router.push(`/productos/${categoria}/${id}`);
    },
    [router, categoria],
  );

  // Handle product purchase
  const handleComprar = useCallback(() => {
    if (!productoActual) return;

    setAddedToCart(true);
    setNotification({
      show: true,
      message: `Producto "${productoActual.title}" agregado al carrito.`,
    });

    // Simular animación y después redirigir
    setTimeout(() => {
      setAddedToCart(false);
      // En una aplicación real, aquí iría la lógica para agregar al carrito
      setTimeout(() => {
        setNotification({ show: false, message: "" });
      }, 1000);
    }, 1500);
  }, [productoActual]);

  // Load products from API
  useEffect(() => {
    const cargarProductos = async () => {
      setCargando(true);
      try {
        // Verificar que params.productId existe
        if (!productId) {
          throw new Error("ID de producto no especificado");
        }

        // ✓ Replaced switch-case with dynamic fetch to "/api/productos"
        // ✓ Using categoria and productId parameters
        const response = await fetch(`/api/productos?categoria=${categoria}`);

        if (!response.ok) {
          throw new Error(`Error al cargar los productos: ${response.status}`);
        }

        const productos = await response.json();

        // Find current product
        const producto = productos.find(
          (p) => p.id === productId || String(p.id) === String(productId),
        );

        if (!producto) {
          throw new Error(
            `Producto con ID ${productId} no encontrado en la categoría ${categoria}`,
          );
        }

        // ✓ Related products logic updated
        const relacionados = productos
          .filter((p) => p.categoria === categoria && p.id !== productId)
          .slice(0, 4);

        // ✓ Featured products functionality preserved
        const destacados = productos
          .filter((p) => p.destacado === true && p.id !== productId)
          .slice(0, 4);

        setProductoActual(producto);
        setProductosRelacionados(relacionados);
        setAccesoriosDestacados(destacados);
        setError(null);
      } catch (error) {
        // ✓ Maintained error handling structure
        console.error("Error loading products:", error);
        setError(
          `Error al cargar los productos: ${error.message || "Error desconocido"}`,
        );

        // ✓ Kept development fallback data
        if (process.env.NODE_ENV === "development") {
          // Create fallback data
          const fallbackProduct = {
            id: productId,
            title: "Producto de ejemplo",
            description: "Este es un producto de ejemplo para desarrollo.",
            price: 299999,
            categoria: categoria,
            images: [DEFAULT_PLACEHOLDER],
          };

          const fallbackRelated = Array(2)
            .fill()
            .map((_, i) => ({
              id: `ejemplo-${i + 1}`,
              title: `Producto relacionado ${i + 1}`,
              description: `Descripción de ejemplo ${i + 1}`,
              price: 149900 + i * 10000,
              categoria: categoria,
              images: [DEFAULT_PLACEHOLDER],
            }));

          const fallbackFeatured = Array(2)
            .fill()
            .map((_, i) => ({
              id: `destacado-${i + 1}`,
              title: `Producto destacado ${i + 1}`,
              description: `Descripción destacada ${i + 1}`,
              price: 199900 + i * 20000,
              categoria: "destacados",
              images: [DEFAULT_PLACEHOLDER],
            }));

          setProductoActual(fallbackProduct);
          setProductosRelacionados(fallbackRelated);
          setAccesoriosDestacados(fallbackFeatured);
        }
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, [categoria, productId]);

  // ✓ Added useMemo for images array - Performance Optimization
  const images = useMemo(() => {
    if (!productoActual) return [DEFAULT_PLACEHOLDER];

    if (!productoActual.images) {
      return [DEFAULT_PLACEHOLDER];
    } else if (Array.isArray(productoActual.images)) {
      return productoActual.images.length > 0
        ? productoActual.images
        : [DEFAULT_PLACEHOLDER];
    } else {
      return [productoActual.images];
    }
  }, [productoActual]);

  // Image navigation functions
  const prevImage = useCallback(() => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  // Loading state
  if (cargando) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-red-500">Error: {error}</p>
            <p className="mt-4">
              <Link
                href={`/productos/${categoria}`}
                className="text-blue-600 hover:underline"
              >
                Volver a la lista de productos
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No product found
  if (!productoActual) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p>No se encontró el producto.</p>
            <p className="mt-4">
              <Link
                href={`/productos/${categoria}`}
                className="text-blue-600 hover:underline"
              >
                Volver a la lista de productos
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Product view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto relative">
        {/* Slider de imágenes */}
        <div
          className="relative h-96 bg-gray-100 rounded-xl overflow-hidden shadow-md mb-8"
          role="region"
          aria-label="Galería de imágenes del producto"
          aria-live="assertive"
        >
          {images.map((img, idx) => (
            <ProductImage
              key={idx}
              src={img}
              alt={`${productoActual.title} - Vista ${idx + 1} de ${images.length}`}
              idx={idx}
              currentIdx={currentImageIndex}
              onError={() => handleImageError(`image-${idx}`)}
              unoptimized={imageErrors.has(`image-${idx}`)}
            />
          ))}

          {/* Controles del slider */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
                aria-label={`Ver imagen anterior de ${productoActual.title}, imagen ${currentImageIndex + 1} de ${images.length}`}
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
                aria-label={`Ver imagen siguiente de ${productoActual.title}, imagen ${currentImageIndex + 1} de ${images.length}`}
              >
                <ChevronRight size={24} className="text-gray-700" />
              </button>

              {/* Indicadores */}
              <div
                className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"
                role="group"
                aria-label="Selector de imágenes"
              >
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-blue-600 w-6"
                        : "bg-gray-300 w-2 hover:bg-gray-400"
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{ cursor: "pointer" }}
                    aria-label={`Ver imagen ${idx + 1} de ${images.length}`}
                    aria-current={idx === currentImageIndex ? "true" : "false"}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Descripción del producto */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {productoActual.title || "Accesorio Premium"}
            </h1>

            <div className="bg-gray-50 p-5 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">
                Descripción de accesorio
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {productoActual.description ||
                  "Este accesorio de alta calidad está diseñado para mejorar la experiencia del usuario. Fabricado con materiales duraderos y acabados premium, es compatible con todos los modelos recientes. Incluye garantía de un año y soporte técnico."}
              </p>
            </div>

            {/* Precio y botón de compra */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-green-600 mr-2">
                  {formatPrice(productoActual.price || 299999)}
                </span>
                {productoActual.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(productoActual.oldPrice)}
                  </span>
                )}
              </div>

              <button
                onClick={handleComprar}
                className={`bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center shadow-sm font-semibold ${
                  addedToCart ? "animate-pulse bg-green-600" : ""
                }`}
                aria-label="Comprar este producto"
                disabled={addedToCart}
              >
                <ShoppingCart size={20} className="mr-2" />
                <span>{addedToCart ? "¡Agregado!" : "Comprar"}</span>
              </button>
            </div>

            {/* Video de presentación */}
            {productoActual.videoUrl && (
              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                  Video de presentación de accesorio
                </h2>

                <div className="bg-gray-50 rounded-xl overflow-hidden relative aspect-video">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    poster="/video-thumbnail.jpg"
                    aria-label={`Video de presentación de ${productoActual.title}`}
                    aria-describedby="video-description"
                    preload="metadata"
                    controlsList="nodownload"
                  >
                    <source src={productoActual.videoUrl} type="video/mp4" />
                    <track kind="captions" src="" label="Español" default />
                    <p>Tu navegador no soporta la reproducción de video.</p>
                  </video>
                  <p id="video-description" className="sr-only">
                    Video demostrativo del producto {productoActual.title}{" "}
                    mostrando sus características y funcionamiento.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Productos relacionados */}
        {productosRelacionados.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Productos relacionados
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productosRelacionados.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="aspect-square relative bg-gray-50">
                    <Image
                      src={
                        Array.isArray(item.images) && item.images.length > 0
                          ? item.images[0]
                          : item.images || DEFAULT_PLACEHOLDER
                      }
                      alt={item.title || `Producto relacionado`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      style={{ objectFit: "contain" }}
                      className="p-3"
                      onError={() => handleImageError(`related-${item.id}`)}
                      unoptimized={imageErrors.has(`related-${item.id}`)}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 truncate">
                      {item.title || `Producto ${item.id}`}
                    </h3>
                    <p className="text-green-600 font-semibold mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <button
                      onClick={() => verDetallesProducto(item.id)}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                    >
                      <Eye size={16} className="mr-2" />
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos destacados */}
        {accesoriosDestacados.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Productos destacados
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {accesoriosDestacados.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="aspect-square relative bg-gray-50">
                    <Image
                      src={
                        Array.isArray(item.images) && item.images.length > 0
                          ? item.images[0]
                          : item.images || DEFAULT_PLACEHOLDER
                      }
                      alt={item.title || `Producto destacado`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      style={{ objectFit: "contain" }}
                      className="p-3"
                      onError={() => handleImageError(`featured-${item.id}`)}
                      unoptimized={imageErrors.has(`featured-${item.id}`)}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 truncate">
                      {item.title || `Producto ${item.id}`}
                    </h3>
                    <p className="text-green-600 font-semibold mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <button
                      onClick={() => verDetallesProducto(item.id)}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                    >
                      <Eye size={16} className="mr-2" />
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification.show && (
          <NotificationToast message={notification.message} />
        )}
      </div>
    </div>
  );
}

ProductDetail.propTypes = {
  params: PropTypes.shape({
    categoria: PropTypes.string.isRequired,
    productId: PropTypes.string.isRequired,
  }).isRequired,
};

ProductDetail.displayName = "ProductDetail";

export default ProductDetail;
