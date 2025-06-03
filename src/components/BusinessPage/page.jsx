// // components/BusinessPage.js
// import React, { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import RootLayout from "../../app/layout";
// import styles from "./BusinessPage.module.scss";

// const BusinessPage = ({ businessData }) => {
//   const [imageError, setImageError] = useState({});
//   const [imageId, setImageId] = useState({});

//   // Validación de seguridad: si no hay datos, muestra un mensaje de error
//   if (!businessData) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen p-4">
//         <h1 className="text-2xl font-bold text-red-500">
//           Error: No se encontraron datos del negocio
//         </h1>
//         <Link href="/">
//           {/* <a className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
//             Volver al inicio
//           </a> */}
//           <p className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
//             Volver al inicio
//           </p>
//         </Link>
//       </div>
//     );
//   }

//   // Extraer propiedades con valores predeterminados seguros
//   const {
//     name = "Negocio",
//     description = "Sin descripción disponible",
//     logo = "",
//     headerImage = "",
//     categories = [],
//     featuredProducts = [],
//     promotionProducts = [],
//     dailyOffers = [],
//     newProducts = [],
//     socialMedia = [],
//   } = businessData;

//   return (
//     <RootLayout>
//       <div className="container mx-auto px-4 py-8">
//         {/* Header con imagen y logo */}
//         <div
//           className={` relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-8`}
//         >
//           {headerImage && (
//             <Image
//               src={headerImage}
//               alt={`Portada de ${name}`}
//               className="w-full h-full object-cover"
//               width={100}
//               height={100}
//               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//               priority={false} // Solo true para imágenes above-the-fold
//               loading="lazy"
//               quality={85} // Reduce de 100 a 85
//               placeholder="blur"
//               blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
//               onError={() =>
//                 setImageError((prev) => ({ ...prev, [imageId]: true }))
//               }
//             />
//           )}
//           ${styles.presentation}
//           <div
//             className={` absolute inset-0 bg-black bg-opacity-0 flex items-center p-8`}
//           >
//             <div className={`${styles.presentation} flex items-center`}>
//               {logo && (
//                 <div
//                   className={`${styles.imagen} w-20 h-20 rounded-full overflow-hidden bg-white mr-4`}
//                 >
//                   <Image
//                     src={logo}
//                     alt={`Logo de ${name}`}
//                     className={`w-full h-full object-contain`}
//                     width={200}
//                     height={200}
//                     priority
//                   />
//                 </div>
//               )}
//               <div className={styles.text}>
//                 <h1 className="text-3xl font-bold text-white">{name}</h1>
//                 <p className="text-white mt-2">{description}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Categorías */}
//         {categories && categories.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold mb-4">Categorías</h2>
//             <div className="flex flex-wrap gap-2">
//               {categories.map((category) => (
//                 <div
//                   key={category.id}
//                   className="px-4 py-2 bg-gray-200 rounded-lg"
//                 >
//                   {category.name}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Productos destacados */}
//         {featuredProducts && featuredProducts.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold mb-4">Productos destacados</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {featuredProducts.map((product) => (
//                 <div key={product.id} className="border rounded-lg p-4">
//                   {product.image && (
//                     <Image
//                       src={product.image}
//                       alt={product.name}
//                       className="w-full h-40 object-cover rounded-lg mb-2"
//                       width={100}
//                       height={100}
//                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                       priority={false} // Solo true para imágenes above-the-fold
//                       loading="lazy"
//                       quality={85} // Reduce de 100 a 85
//                       placeholder="blur"
//                       blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
//                       onError={() =>
//                         setImageError((prev) => ({ ...prev, [imageId]: true }))
//                       }
//                     />
//                   )}
//                   <h3 className="font-bold">{product.name}</h3>
//                   <p className="text-gray-600">{product.price}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Promociones */}
//         {promotionProducts && promotionProducts.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold mb-4">Promociones</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {promotionProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="border rounded-lg p-4 bg-yellow-50"
//                 >
//                   {product.image && (
//                     <Image
//                       src={product.image}
//                       alt={product.name}
//                       className="w-full h-40 object-cover rounded-lg mb-2"
//                       width={100}
//                       height={100}
//                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                       priority={false} // Solo true para imágenes above-the-fold
//                       loading="lazy"
//                       quality={85} // Reduce de 100 a 85
//                       placeholder="blur"
//                       blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
//                       onError={() =>
//                         setImageError((prev) => ({ ...prev, [imageId]: true }))
//                       }
//                     />
//                   )}
//                   <h3 className="font-bold">{product.name}</h3>
//                   <p className="text-gray-600 line-through">
//                     {product.originalPrice}
//                   </p>
//                   <p className="text-red-600 font-bold">{product.price}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Ofertas del día */}
//         {dailyOffers && dailyOffers.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold mb-4">Ofertas del día</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {dailyOffers.map((product) => (
//                 <div
//                   key={product.id}
//                   className="border rounded-lg p-4 bg-green-50"
//                 >
//                   {product.image && (
//                     <Image
//                       src={product.image}
//                       alt={product.name}
//                       className="w-full h-40 object-cover rounded-lg mb-2"
//                       width={100}
//                       height={100}
//                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                       priority={false} // Solo true para imágenes above-the-fold
//                       loading="lazy"
//                       quality={85} // Reduce de 100 a 85
//                       placeholder="blur"
//                       blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
//                       onError={() =>
//                         setImageError((prev) => ({ ...prev, [imageId]: true }))
//                       }
//                     />
//                   )}
//                   <h3 className="font-bold">{product.name}</h3>
//                   <p className="text-green-600 font-bold">{product.price}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Productos nuevos */}
//         {newProducts && newProducts.length > 0 && (
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold mb-4">Productos nuevos</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {newProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="border rounded-lg p-4 bg-blue-50"
//                 >
//                   {product.image && (
//                     <Image
//                       src={product.image}
//                       alt={product.name}
//                       className="w-full h-40 object-cover rounded-lg mb-2"
//                       width={100}
//                       height={100}
//                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                       priority={false} // Solo true para imágenes above-the-fold
//                       loading="lazy"
//                       quality={85} // Reduce de 100 a 85
//                       placeholder="blur"
//                       blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
//                       onError={() =>
//                         setImageError((prev) => ({ ...prev, [imageId]: true }))
//                       }
//                     />
//                   )}
//                   <h3 className="font-bold">{product.name}</h3>
//                   <p className="text-blue-600">{product.price}</p>
//                   <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mt-2">
//                     Nuevo
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Redes sociales */}
//         {socialMedia && socialMedia.length > 0 && (
//           <div className="mt-8 border-t pt-4">
//             <h3 className="text-lg font-bold mb-2">
//               Síguenos en redes sociales
//             </h3>
//             <div className="flex gap-4">
//               {socialMedia.map((social) => (
//                 <a
//                   key={social.name}
//                   href={social.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-500 hover:text-blue-700"
//                 >
//                   {social.name}
//                 </a>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </RootLayout>
//   );
// };

// export default BusinessPage;

// components/BusinessPage.js
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import RootLayout from "../../app/layout";
import styles from "./BusinessPage.module.scss";

const BusinessPage = ({ businessData }) => {
  const [imageError, setImageError] = useState({});
  const [imageId, setImageId] = useState({});
  const [scrollY, setScrollY] = useState(0);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Validación de seguridad
  if (!businessData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">
            Error: No se encontraron datos del negocio
          </h1>
          <Link href="/">
            <p className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer text-center">
              Volver al inicio
            </p>
          </Link>
        </div>
      </div>
    );
  }

  // Extraer propiedades con valores predeterminados
  const {
    name = "Negocio",
    description = "Sin descripción disponible",
    logo = "",
    headerImage = "",
    categories = [],
    featuredProducts = [],
    promotionProducts = [],
    dailyOffers = [],
    newProducts = [],
    socialMedia = [],
  } = businessData;

  const ProductCard = ({ product, variant = "default" }) => {
    const variants = {
      default: "bg-white/80 backdrop-blur-sm hover:bg-white/90",
      promotion:
        "bg-gradient-to-br from-yellow-100/80 to-orange-100/80 backdrop-blur-sm hover:from-yellow-200/90 hover:to-orange-200/90",
      daily:
        "bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-sm hover:from-green-200/90 hover:to-emerald-200/90",
      new: "bg-gradient-to-br from-blue-100/80 to-cyan-100/80 backdrop-blur-sm hover:from-blue-200/90 hover:to-cyan-200/90",
    };

    return (
      <div
        className={`${variants[variant]} rounded-2xl p-6 border border-white/30 shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl group cursor-pointer`}
      >
        {product.image && (
          <div className="relative overflow-hidden rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300">
            <Image
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
              width={300}
              height={200}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
              onError={() =>
                setImageError((prev) => ({ ...prev, [imageId]: true }))
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-gray-900 transition-colors">
            {product.name}
          </h3>
          {variant === "promotion" && product.originalPrice && (
            <p className="text-gray-500 line-through text-sm">
              {product.originalPrice}
            </p>
          )}
          <p
            className={`font-bold text-lg ${
              variant === "promotion"
                ? "text-red-600"
                : variant === "daily"
                  ? "text-green-600"
                  : variant === "new"
                    ? "text-blue-600"
                    : "text-gray-700"
            }`}
          >
            {product.price}
          </p>
          {variant === "new" && (
            <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              ✨ Nuevo
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <RootLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header Hero Section */}
        <div
          className="relative w-full h-96 overflow-hidden"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          {/* Background Image */}
          {headerImage && (
            <div className="absolute inset-0">
              <Image
                src={headerImage}
                alt={`Portada de ${name}`}
                className="w-full h-full object-cover"
                width={1200}
                height={400}
                priority
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
            </div>
          )}

          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-32 right-20 w-24 h-24 bg-blue-300 rounded-full blur-lg animate-bounce delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-purple-300 rounded-full blur-xl animate-pulse delay-500"></div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${styles.presentation} max-w-6xl mx-auto px-8`}>
              {logo && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full overflow-hidden border-4 border-white/30 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={logo}
                      alt={`Logo de ${name}`}
                      className="w-full h-full object-contain p-2"
                      width={128}
                      height={128}
                      priority
                    />
                  </div>
                </div>
              )}
              <div className={`${styles.text} text-center lg:text-left`}>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {name}
                </h1>
                <p className="text-xl text-white/90 max-w-2xl leading-relaxed backdrop-blur-sm bg-black/10 rounded-lg p-4">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
          {/* Categorías */}
          {categories && categories.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Nuestras Categorías
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="font-medium">{category.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Productos Destacados */}
          {featuredProducts && featuredProducts.length > 0 && (
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  ⭐ Productos Destacados
                </h2>
                <p className="text-gray-600 text-lg">
                  Los favoritos de nuestros clientes
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="default"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Promociones */}
          {promotionProducts && promotionProducts.length > 0 && (
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  🔥 Promociones Especiales
                </h2>
                <p className="text-gray-600 text-lg">
                  Ofertas irresistibles por tiempo limitado
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {promotionProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="promotion"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Ofertas del Día */}
          {dailyOffers && dailyOffers.length > 0 && (
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  ⚡ Ofertas del Día
                </h2>
                <p className="text-gray-600 text-lg">
                  Aprovecha estos precios únicos hoy
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {dailyOffers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="daily"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Productos Nuevos */}
          {newProducts && newProducts.length > 0 && (
            <section className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  ✨ Recién Llegados
                </h2>
                <p className="text-gray-600 text-lg">
                  Las últimas novedades en nuestra tienda
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {newProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="new"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Redes Sociales */}
          {socialMedia && socialMedia.length > 0 && (
            <section className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl p-8 text-center text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-6">
                🌟 Conéctate con Nosotros
              </h3>
              <p className="text-lg mb-8 opacity-90">
                Síguenos para estar al día con las últimas novedades
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {socialMedia.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-110 hover:shadow-lg border border-white/30"
                  >
                    <span className="font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </RootLayout>
  );
};

export default BusinessPage;
