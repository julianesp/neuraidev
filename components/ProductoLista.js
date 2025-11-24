"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProductoLista({ productos }) {
  const [imageError, setImageError] = useState({});
  if (!productos || !Array.isArray(productos)) {
    return <div>Cargando productos...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((producto) => (
        <div key={producto.id} className="border rounded-lg p-4 shadow-md">
          <div className="relative w-full h-48 mb-4">
            <Image
              src={
                producto.images?.[0] ||
                "/imageshttps://placehold.co/400x400/e5e7eb/9ca3af?text=Sin+imagen"
              }
              alt={producto.title}
              className="object-cover rounded"
              priority={producto.id <= 4} // Priorizar la carga de las primeras 4 imágenes
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              quality={85} // Reduce de 100 a 85
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
              onError={() =>
                setImageError((prev) => ({ ...prev, [`product-list-${producto.id}`]: true }))
              }
            />
          </div>
          <h2 className="text-xl font-semibold mb-2">{producto.title}</h2>
          <p className="text-gray-600 mb-4">{producto.description}</p>
          <p className="text-blue-600 font-bold mb-2">${producto.price}</p>
          {/* Botón de agregar al carrito deshabilitado */}
        </div>
      ))}
    </div>
  );
}
