// // components/AccesoriosGridContainer.jsx
// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

// const AccesoriosGridContainer = (props) => {
//   // Garantizar que accesorios sea siempre un array, incluso si es undefined o null
//   const [accesorios, setAccesorios] = useState([]);
//   const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
//   // Inicializar los datos cuando el componente se monta
//   useEffect(() => {
//     // Verificar que props.accesorios sea un array
//     if (props.accesorios && Array.isArray(props.accesorios)) {
//       setAccesorios(props.accesorios);
//     } else {
//       console.warn('AccesoriosGridContainer: accesorios debe ser un array');
//       setAccesorios([]);
//     }
//   }, [props.accesorios]);
  
//   // Si no hay accesorios, mostrar un mensaje
//   if (!accesorios || accesorios.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <p className="text-gray-500 text-lg">No hay accesorios disponibles</p>
//         </div>
//       </div>
//     );
//   }
  
//   // Función para manejar el carrusel de imágenes para cada accesorio
//   const nextSlide = (accesorioId) => {
//     const accesorio = accesorios.find(item => item && item.id === accesorioId);
//     if (!accesorio || !Array.isArray(accesorio.images)) return;
    
//     const totalSlides = accesorio.images.length;
//     if (totalSlides <= 1) return;
    
//     // Actualizamos el índice de slide para este accesorio específico
//     const currentIndex = accesorio._currentSlideIndex || 0;
//     const nextIndex = (currentIndex + 1) % totalSlides;
    
//     // Actualizamos el estado de este accesorio
//     accesorio._currentSlideIndex = nextIndex;
//     setCurrentSlideIndex(prev => prev + 1); // Solo para forzar un re-render
//   };
  
//   const prevSlide = (accesorioId) => {
//     const accesorio = accesorios.find(item => item && item.id === accesorioId);
//     if (!accesorio || !Array.isArray(accesorio.images)) return;
    
//     const totalSlides = accesorio.images.length;
//     if (totalSlides <= 1) return;
    
//     // Actualizamos el índice de slide para este accesorio específico
//     const currentIndex = accesorio._currentSlideIndex || 0;
//     const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    
//     // Actualizamos el estado de este accesorio
//     accesorio._currentSlideIndex = prevIndex;
//     setCurrentSlideIndex(prev => prev + 1); // Solo para forzar un re-render
//   };
  
//   // Función para normalizar la estructura de imágenes
//   const normalizeImages = (images) => {
//     if (!images) return ['/placeholder.jpg'];
//     if (typeof images === 'string') return [images];
//     return images;
//   };
  
//   // Función para formatear el precio
//   const formatPrice = (price) => {
//     if (!price) return '$0';
    
//     // Si el precio es un string, convertirlo a número
//     const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
    
//     // Formatear con separador de miles
//     return `$${numericPrice.toLocaleString('es-CO')}`;
//   };
  
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {accesorios.map((accesorio, index) => {
//           // Verificar que el accesorio exista
//           if (!accesorio) return null;
          
//           const images = normalizeImages(accesorio.images);
//           const currentImageIndex = accesorio._currentSlideIndex || 0;
          
//           return (
//             <div key={accesorio.id || index} className="bg-white rounded-lg shadow-md overflow-hidden">
//               {/* Carrusel de imágenes */}
//               <div className="relative h-56">
//                 <div className="w-full h-full relative overflow-hidden">
//                   {images.map((img, idx) => (
//                     <div 
//                       key={idx} 
//                       className={`absolute inset-0 transition-opacity duration-300 ${
//                         idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
//                       }`}
//                     >
//                       <Image 
//                         src={img || '/placeholder.jpg'} 
//                         alt={accesorio.title || 'Accesorio'}
//                         layout="fill" 
//                         objectFit="cover"
//                       />
//                     </div>
//                   ))}
                  
//                   {/* Controles de carrusel */}
//                   {images.length > 1 && (
//                     <>
//                       <button 
//                         onClick={() => prevSlide(accesorio.id)}
//                         className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full hover:bg-opacity-90 transition-all"
//                       >
//                         <ChevronLeft size={20} />
//                       </button>
//                       <button 
//                         onClick={() => nextSlide(accesorio.id)}
//                         className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-1 rounded-full hover:bg-opacity-90 transition-all"
//                       >
//                         <ChevronRight size={20} />
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
              
//               {/* Descripción del accesorio */}
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold mb-2 truncate">{accesorio.title || 'Sin título'}</h3>
//                 <p className="text-gray-600 text-sm h-12 overflow-hidden">{accesorio.description || 'Sin descripción'}</p>
//               </div>
              
//               {/* Botón de compra */}
//               <div className="px-4 pb-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <span className="text-lg font-bold text-green-600">{formatPrice(accesorio.price)}</span>
//                   <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
//                     Comprar
//                   </button>
//                 </div>
                
//                 {/* Video de presentación (simulado) */}
//                 <Link 
//                   href={`/accesorios/${accesorio.id || index}/video`} 
//                   className="flex items-center justify-center w-full bg-gray-100 py-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
//                 >
//                   <Play size={16} className="mr-2" />
//                   <span>Video de presentación</span>
//                 </Link>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default AccesoriosGridContainer;

// components/AccesoriosGridContainer.jsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, ShoppingCart } from 'lucide-react';

const AccesoriosGridContainer = (props) => {
  // Garantizar que accesorios sea siempre un array, incluso si es undefined o null
  const [accesorios, setAccesorios] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Inicializar los datos cuando el componente se monta
  useEffect(() => {
    // Verificar que props.accesorios sea un array
    if (props.accesorios && Array.isArray(props.accesorios)) {
      setAccesorios(props.accesorios);
    } else {
      console.warn('AccesoriosGridContainer: accesorios debe ser un array');
      setAccesorios([]);
    }
  }, [props.accesorios]);
  
  // Si no hay accesorios, mostrar un mensaje
  if (!accesorios || accesorios.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-gray-50 rounded-lg shadow-inner">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-xl font-light">No hay accesorios disponibles</p>
          <p className="text-gray-500 mt-2">Vuelve más tarde para ver nuestras novedades</p>
        </div>
      </div>
    );
  }
  
  // Función para manejar el carrusel de imágenes para cada accesorio
  const nextSlide = (accesorioId) => {
    const accesorio = accesorios.find(item => item && item.id === accesorioId);
    if (!accesorio || !Array.isArray(accesorio.images)) return;
    
    const totalSlides = accesorio.images.length;
    if (totalSlides <= 1) return;
    
    // Actualizamos el índice de slide para este accesorio específico
    const currentIndex = accesorio._currentSlideIndex || 0;
    const nextIndex = (currentIndex + 1) % totalSlides;
    
    // Actualizamos el estado de este accesorio
    accesorio._currentSlideIndex = nextIndex;
    setCurrentSlideIndex(prev => prev + 1); // Solo para forzar un re-render
  };
  
  const prevSlide = (accesorioId) => {
    const accesorio = accesorios.find(item => item && item.id === accesorioId);
    if (!accesorio || !Array.isArray(accesorio.images)) return;
    
    const totalSlides = accesorio.images.length;
    if (totalSlides <= 1) return;
    
    // Actualizamos el índice de slide para este accesorio específico
    const currentIndex = accesorio._currentSlideIndex || 0;
    const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    
    // Actualizamos el estado de este accesorio
    accesorio._currentSlideIndex = prevIndex;
    setCurrentSlideIndex(prev => prev + 1); // Solo para forzar un re-render
  };
  
  // Función para normalizar la estructura de imágenes
  const normalizeImages = (images) => {
    if (!images) return ['/placeholder.jpg'];
    if (typeof images === 'string') return [images];
    return images;
  };
  
  // Función para formatear el precio
  const formatPrice = (price) => {
    if (!price) return '$0';
    
    // Si el precio es un string, convertirlo a número
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
    
    // Formatear con separador de miles
    return `$${numericPrice.toLocaleString('es-CO')}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Nuestros Accesorios
        <div className="h-1 w-20 bg-blue-600 mx-auto mt-2 rounded-full"></div>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {accesorios.map((accesorio, index) => {
          // Verificar que el accesorio exista
          if (!accesorio) return null;
          
          const images = normalizeImages(accesorio.images);
          const currentImageIndex = accesorio._currentSlideIndex || 0;
          
          return (
            <div 
              key={accesorio.id || index} 
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
            >
              {/* Carrusel de imágenes */}
              <div className="relative h-64 bg-gray-100">
                <div className="w-full h-full relative overflow-hidden">
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                        idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image 
                        src={img || '/placeholder.jpg'} 
                        alt={accesorio.title || 'Accesorio'}
                        layout="fill" 
                        objectFit="contain"
                        className="p-4"
                      />
                    </div>
                  ))}
                  
                  {/* Controles de carrusel */}
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => prevSlide(accesorio.id)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-md"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft size={20} className="text-gray-700" />
                      </button>
                      <button 
                        onClick={() => nextSlide(accesorio.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-md"
                        aria-label="Siguiente imagen"
                      >
                        <ChevronRight size={20} className="text-gray-700" />
                      </button>
                      
                      {/* Indicadores */}
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
                        {images.map((_, idx) => (
                          <div 
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentImageIndex 
                                ? 'bg-blue-600 w-4' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Descripción del accesorio */}
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 truncate">
                  {accesorio.title || 'Sin título'}
                </h3>
                <p className="text-gray-600 text-sm h-14 overflow-hidden leading-relaxed">
                  {accesorio.description || 'Sin descripción'}
                </p>
              </div>
              
              {/* Precio y botones */}
              <div className="p-5">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(accesorio.price)}
                  </span>
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                    aria-label="Comprar este producto"
                  >
                    <ShoppingCart size={18} className="mr-1" />
                    <span>Comprar</span>
                  </button>
                </div>
                
                {/* Video de presentación */}
                <Link 
                  href={`/accesorios/${accesorio.id || index}/video`} 
                  className="flex items-center justify-center w-full bg-gray-50 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <Play size={18} className="mr-2 text-red-600" />
                  <span>Ver video de presentación</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccesoriosGridContainer;