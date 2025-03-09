// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ArrowLeft, ArrowRight, Store } from "lucide-react";

// export default function BusinessPage({
//   businessData = {
//     name: "",
//     description: "",
//     logo: "",
//     headerImage: "",
//     categories: [],
//     featuredProducts: [],
//     promotionProducts: [],
//     dailyOffers: [],
//     newProducts: [],
//   },
// }) {
//   const [activeCategory, setActiveCategory] = useState(
//     businessData.categories[0]?.id || "",
//   );

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50">
//       {/* Header with Business Name and Back Button */}
//       <header className="sticky top-0 z-10 bg-white shadow-md">
//         <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//           <Link href="/businesses" className="text-blue-600 flex items-center">
//             <ArrowLeft size={20} className="mr-1" />
//             <span className="text-sm">Volver</span>
//           </Link>
//           <h1 className="text-xl font-bold text-center flex-1">
//             {businessData.name}
//           </h1>
//           <div className="w-8"></div> {/* Spacer for alignment */}
//         </div>
//       </header>

//       {/* Business Hero Section with Awning Design */}
//       <div className="relative">
//         {/* Header Image */}
//         <div className="h-40 w-full relative">
//           <Image
//             src={businessData.headerImage || "/images/default-header.jpg"}
//             alt={`${businessData.name} banner`}
//             layout="fill"
//             objectFit="cover"
//             className="brightness-90"
//           />
//         </div>

//         {/* Blue Awning Design */}
//         <div className="absolute -bottom-6 w-full overflow-hidden">
//           <div className="h-12 bg-blue-500 relative">
//             <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-400 rounded-tr-3xl"></div>
//             <div className="absolute left-1/3 top-0 h-full w-1/3 bg-blue-600"></div>
//             <div className="absolute right-0 top-0 h-full w-1/3 bg-blue-400 rounded-tl-3xl"></div>
//           </div>
//         </div>

//         {/* Business Logo */}
//         <div className="absolute -bottom-16 left-4 h-24 w-24 bg-white rounded-full shadow-lg flex items-center justify-center p-1">
//           <Image
//             src={businessData.logo || "/images/default-logo.png"}
//             alt={`${businessData.name} logo`}
//             width={80}
//             height={80}
//             className="rounded-full"
//           />
//         </div>
//       </div>

//       {/* Business Info */}
//       <div className="mt-20 px-4">
//         <h2 className="text-2xl font-bold">{businessData.name}</h2>
//         <p className="text-gray-600 mt-2">{businessData.description}</p>

//         {/* Contact or More Info Button */}
//         <div className="mt-4">
//           <Link
//             href={`/contact/${businessData.id}`}
//             className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             Más información
//           </Link>
//         </div>
//       </div>

//       {/* Category Navigation */}
//       <div className="mt-8 px-4">
//         <h3 className="text-lg font-semibold mb-3">Categorías</h3>
//         <div className="flex overflow-x-auto pb-2 gap-2">
//           {businessData.categories.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => setActiveCategory(category.id)}
//               className={`px-4 py-2 rounded-lg whitespace-nowrap ${
//                 activeCategory === category.id
//                   ? "bg-blue-500 text-white"
//                   : "bg-gray-200 text-gray-800 hover:bg-gray-300"
//               }`}
//             >
//               {category.name}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Featured Products Section */}
//       <div className="mt-8 px-4">
//         <h3 className="text-lg font-semibold">Artículos más vendidos</h3>
//         <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
//           {businessData.featuredProducts.slice(0, 4).map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//         {businessData.featuredProducts.length > 4 && (
//           <div className="mt-3 text-right">
//             <Link
//               href={`/business/${businessData.id}/featured`}
//               className="text-blue-500 inline-flex items-center"
//             >
//               Ver todos
//               <ArrowRight size={16} className="ml-1" />
//             </Link>
//           </div>
//         )}
//       </div>

//       {/* Promotion Products Section */}
//       <div className="mt-8 px-4">
//         <h3 className="text-lg font-semibold">Artículos en promoción</h3>
//         <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
//           {businessData.promotionProducts.slice(0, 4).map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//         {businessData.promotionProducts.length > 4 && (
//           <div className="mt-3 text-right">
//             <Link
//               href={`/business/${businessData.id}/promotion`}
//               className="text-blue-500 inline-flex items-center"
//             >
//               Ver todos
//               <ArrowRight size={16} className="ml-1" />
//             </Link>
//           </div>
//         )}
//       </div>

//       {/* Daily Offers Section */}
//       <div className="mt-8 px-4">
//         <h3 className="text-lg font-semibold">Artículos en oferta solo hoy</h3>
//         <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
//           {businessData.dailyOffers.slice(0, 4).map((product) => (
//             <ProductCard key={product.id} product={product} hasTimer={true} />
//           ))}
//         </div>
//         {businessData.dailyOffers.length > 4 && (
//           <div className="mt-3 text-right">
//             <Link
//               href={`/business/${businessData.id}/daily-offers`}
//               className="text-blue-500 inline-flex items-center"
//             >
//               Ver todos
//               <ArrowRight size={16} className="ml-1" />
//             </Link>
//           </div>
//         )}
//       </div>

//       {/* New Products Section */}
//       <div className="mt-8 px-4 mb-8">
//         <h3 className="text-lg font-semibold">Artículos nuevos</h3>
//         <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
//           {businessData.newProducts.slice(0, 4).map((product) => (
//             <ProductCard key={product.id} product={product} isNew={true} />
//           ))}
//         </div>
//         {businessData.newProducts.length > 4 && (
//           <div className="mt-3 text-right">
//             <Link
//               href={`/business/${businessData.id}/new-products`}
//               className="text-blue-500 inline-flex items-center"
//             >
//               Ver todos
//               <ArrowRight size={16} className="ml-1" />
//             </Link>
//           </div>
//         )}
//       </div>

//       {/* Social Media Buttons */}
//       <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2">
//         <div className="flex justify-between items-center">
//           <div className="flex gap-2">
//             {businessData.socialMedia?.map((social) => (
//               <Link
//                 key={social.type}
//                 href={social.url}
//                 className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
//               >
//                 <Image
//                   src={`/images/social/${social.type}.svg`}
//                   alt={social.type}
//                   width={20}
//                   height={20}
//                 />
//               </Link>
//             ))}
//           </div>
//           <Link
//             href="/businesses"
//             className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white"
//           >
//             <Store size={20} />
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Product Card Component
// function ProductCard({ product, hasTimer = false, isNew = false }) {
//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
//       {/* Product Image */}
//       <div className="relative h-36">
//         {isNew && (
//           <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
//             Nuevo
//           </div>
//         )}
//         {hasTimer && (
//           <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//             24h
//           </div>
//         )}
//         <Image
//           src={product.image || "/images/default-product.jpg"}
//           alt={product.name}
//           layout="fill"
//           objectFit="cover"
//           className="p-2"
//         />
//       </div>

//       {/* Product Info */}
//       <div className="p-3">
//         <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
//         <div className="mt-1 flex justify-between items-center">
//           <div>
//             {product.salePrice && (
//               <>
//                 <span className="text-xs text-gray-400 line-through block">
//                   ${product.regularPrice}
//                 </span>
//                 <span className="text-red-500 font-bold">
//                   ${product.salePrice}
//                 </span>
//               </>
//             )}
//             {!product.salePrice && (
//               <span className="font-bold">${product.regularPrice}</span>
//             )}
//           </div>
//           <button className="bg-blue-500 text-white p-1 rounded-full h-6 w-6 flex items-center justify-center">
//             +
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Store,
  ShoppingBag,
  User,
  Home,
} from "lucide-react";

export default function BusinessPage({
  businessData = {
    name: "",
    description: "",
    logo: "",
    headerImage: "",
    categories: [],
    featuredProducts: [],
    promotionProducts: [],
    dailyOffers: [],
    newProducts: [],
  },
}) {
  const [activeCategory, setActiveCategory] = useState(
    businessData.categories[0]?.id || "",
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header with Business Name exactly as in the wireframe */}
      <header className="sticky top-0 z-10 bg-white shadow-md">
        <div className="relative w-full bg-white p-4 flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <Link href="/businesses" className="text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-center">
              {businessData.name}
            </h1>
            <div className="w-5"></div> {/* Empty spacer for balance */}
          </div>
        </div>
      </header>

      {/* Category Navigation - Matching the wireframe */}
      <div className="bg-white pb-2 shadow-sm">
        <h3 className="text-md font-semibold px-4 py-2 text-center">
          Categorías
        </h3>
        <div className="flex overflow-x-auto px-2 gap-2 justify-center">
          {businessData.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap flex-1 max-w-xs text-center text-sm ${
                activeCategory === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-6">
        {/* Featured Products Section - Artículos más vendidos */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Artículos más vendidos</h3>
          <div className="grid grid-cols-2 gap-4">
            {businessData.featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Promotion Products Section - Artículos en promoción */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Artículos en promoción</h3>
          <div className="grid grid-cols-2 gap-4">
            {businessData.promotionProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Daily Offers Section - Artículos en oferta solo hoy */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Artículos en oferta solo hoy
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {businessData.dailyOffers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} hasTimer={true} />
            ))}
          </div>
        </div>

        {/* New Products Section - Artículos nuevos */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Artículos nuevos</h3>
          <div className="grid grid-cols-2 gap-4">
            {businessData.newProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} isNew={true} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - "Botón redes sociales" as in the wireframe */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
        <div className="flex justify-between items-center">
          <Link
            href="/home"
            className="flex flex-col items-center text-gray-500"
          >
            <Home size={20} />
            <span className="text-xs">Inicio</span>
          </Link>

          <Link
            href={`/business/${businessData.id}/cart`}
            className="flex flex-col items-center text-gray-500"
          >
            <ShoppingBag size={20} />
            <span className="text-xs">Carrito</span>
          </Link>

          <div className="relative">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
              <button className="bg-blue-500 text-white p-3 rounded-full shadow-lg h-14 w-14 flex items-center justify-center">
                <Store size={24} />
              </button>
            </div>
          </div>

          <Link
            href="/favorites"
            className="flex flex-col items-center text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="text-xs">Favoritos</span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center text-gray-500"
          >
            <User size={20} />
            <span className="text-xs">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, hasTimer = false, isNew = false }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-32">
        {isNew && (
          <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
            Nuevo
          </div>
        )}
        {hasTimer && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
            24h
          </div>
        )}
        <Image
          src={product.image || "/images/default-product.jpg"}
          alt={product.name}
          width={250}
          height={250}
          // layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Product Info */}
      <div className="p-2">
        <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
        <div className="mt-1 flex justify-between items-center">
          <div>
            {product.salePrice && (
              <>
                <span className="text-xs text-gray-400 line-through block">
                  ${product.regularPrice}
                </span>
                <span className="text-red-500 font-bold text-sm">
                  ${product.salePrice}
                </span>
              </>
            )}
            {!product.salePrice && (
              <span className="font-bold text-sm">${product.regularPrice}</span>
            )}
          </div>
          <button className="bg-blue-500 text-white p-1 rounded-full h-6 w-6 flex items-center justify-center text-sm">
            +
          </button>
        </div>
      </div>
    </div>
  );
}
