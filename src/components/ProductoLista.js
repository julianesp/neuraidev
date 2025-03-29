"use client";
import Image from "next/image";

export default function ProductoLista({ productos }) {
  if (!productos || !Array.isArray(productos)) {
    return <div>Cargando productos...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((producto) => (
        <div key={producto.id} className="border rounded-lg p-4 shadow-md">
          <div className="relative w-full h-48 mb-4">
            <Image
              src={producto.images?.[0] || "/placeholder.svg"}
              alt={producto.title}
              
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded"
              priority={producto.id <= 4} // Priorizar la carga de las primeras 4 imágenes
              // width={100}
              // height={100}
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
