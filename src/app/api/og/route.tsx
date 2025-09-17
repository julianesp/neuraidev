import { ImageResponse } from "next/og";
import Image from "next/image";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extraer parámetros del producto
    const title = searchParams.get("title") || "Producto NeuraIdev";
    const price = searchParams.get("price") || "";
    const description = searchParams.get("description") || "";
    const productImage = searchParams.get("image") || "";
    const category = searchParams.get("category") || "Accesorios";

    // Logo de la marca
    const logoUrl = "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo%2Flogo.png?alt=media&token=0ec4ec5a-f5cf-4305-b42d-b5348711eb2a";

    return new ImageResponse(
      (
        <div tw="flex w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Imagen del producto (si existe) */}
          {productImage && (
            <div tw="flex w-2/5 h-full">
              <Image 
                src={productImage} 
                tw="w-full h-full object-cover"
                alt={title}
              />
            </div>
          )}
          
          {/* Contenido del producto */}
          <div tw={`flex flex-col justify-between p-12 ${productImage ? 'w-3/5' : 'w-full'} h-full`}>
            {/* Header con logo */}
            <div tw="flex items-center mb-8">
              <Image width={48} height={48} src={logoUrl} alt="NeuraIdev"/>
              <div tw="ml-4 flex flex-col">
                <span tw="text-xl font-bold text-gray-900">NeuraIdev</span>
                <span tw="text-sm text-gray-600">{category}</span>
              </div>
            </div>

            {/* Título del producto */}
            <div tw="flex flex-col flex-1 justify-center">
              <h1 tw="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {title.slice(0, 60)}
              </h1>
              
              {/* Descripción */}
              {description && (
                <p tw="text-lg text-gray-700 mb-6 leading-relaxed">
                  {description.replace(/[^\w\s\-.,áéíóúñü]/gi, '').slice(0, 120)}...
                </p>
              )}
              
              {/* Precio */}
              {price && (
                <div tw="flex items-center mb-6">
                  <span tw="text-3xl font-bold text-indigo-600">
                    ${price}
                  </span>
                  <span tw="ml-2 text-lg text-gray-600">COP</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div tw="flex items-center justify-between">
              <div tw="flex items-center">
                <div tw="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span tw="text-sm text-gray-600">Disponible ahora</span>
              </div>
              <span tw="text-sm text-gray-500">neuraidev.vercel.app</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    return new Response("Falla al generar la imagen OG", { status: 500 });
  }
}

// Optimizado para mejor rendimiento
export const dynamic = "force-dynamic"; // Necesario para parámetros dinámicos
export const revalidate = 3600; // Cache por 1 hora
