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
                "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
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
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full">
            Agregar al carrito
          </button>
        </div>
      ))}
    </div>
  );
}
