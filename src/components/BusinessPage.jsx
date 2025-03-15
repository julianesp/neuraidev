// components/BusinessPage.js
import React from "react";
import Link from "next/link";
import Image from "next/image";
import RootLayout from "@/app/layout";

const BusinessPage = ({ businessData }) => {
  // Validación de seguridad: si no hay datos, muestra un mensaje de error
  if (!businessData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500">
          Error: No se encontraron datos del negocio
        </h1>
        <Link href="/">
          <a className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
            Volver al inicio
          </a>
        </Link>
      </div>
    );
  }

  // Extraer propiedades con valores predeterminados seguros
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

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header con imagen y logo */}
        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-8">
          {headerImage && (
            <Image
              src={headerImage}
              alt={`Portada de ${name}`}
              className="w-full h-full object-cover"
              width={100}
              height={100}
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center p-8">
            <div className="flex items-center">
              {logo && (
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white mr-4">
                  <Image
                    src={logo}
                    alt={`Logo de ${name}`}
                    className="w-full h-full object-contain"
                    width={100}
                    height={100}
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{name}</h1>
                <p className="text-white mt-2">{description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categorías */}
        {categories && categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  {category.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos destacados */}
        {featuredProducts && featuredProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Productos destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                      width={100}
                      height={100}
                    />
                  )}
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-gray-600">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promociones */}
        {promotionProducts && promotionProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Promociones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {promotionProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 bg-yellow-50"
                >
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                      width={100}
                      height={100}
                    />
                  )}
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-gray-600 line-through">
                    {product.originalPrice}
                  </p>
                  <p className="text-red-600 font-bold">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ofertas del día */}
        {dailyOffers && dailyOffers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Ofertas del día</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dailyOffers.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 bg-green-50"
                >
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                      width={100}
                      height={100}
                    />
                  )}
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-green-600 font-bold">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos nuevos */}
        {newProducts && newProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Productos nuevos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {newProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 bg-blue-50"
                >
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                      width={100}
                      height={100}
                    />
                  )}
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-blue-600">{product.price}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mt-2">
                    Nuevo
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redes sociales */}
        {socialMedia && socialMedia.length > 0 && (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-bold mb-2">
              Síguenos en redes sociales
            </h3>
            <div className="flex gap-4">
              {socialMedia.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </RootLayout>
  );
};

export default BusinessPage;
