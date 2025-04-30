// import { NextResponse } from "next/server";
// import { promises as fs } from "fs";
// import path from "path";

// // Función para determinar si estamos en producción
// const isProd = process.env.NODE_ENV === "production";

// // Configuramos la función como estática para producción
// // export const dynamic = "force-dynamic";

// export async function GET(request) {
//   try {
//     // Extrae el ID de los parámetros de la solicitud si existe
//     // En lugar de usar request.url (que es dinámico), usamos los searchParams solo si están disponibles
//     let id = null;

//     // Solo intentamos obtener searchParams si no estamos en build
//     if (request.url) {
//       try {
//         const url = new URL(request.url);
//         id = url.searchParams.get("id");
//       } catch (error) {
//         console.error("Error al analizar URL:", error);
//       }
//     }

//     // Definir rutas a los archivos JSON
//     const publicDir = path.join(process.cwd(), "public");

//     // Lista de archivos que intentaremos cargar
//     const files = [
//       { name: "celulares.json", category: "celulares" },
//       { name: "computers.json", category: "computadores" },
//       { name: "accesoriosDestacados.json", category: "destacados" },
//       { name: "accesoriesDamas.json", category: "damas" },
//       { name: "accesoriesBooksNew.json", category: "libros-nuevos" },
//       { name: "accesoriesBooksOld.json", category: "libros-usados" },
//     ];

//     // Cargar datos de todos los archivos existentes
//     const allProducts = [];

//     // Función para cargar un archivo si existe
//     const loadFileIfExists = async (filePath, category) => {
//       try {
//         const fileContents = await fs.readFile(filePath, "utf8");
//         const data = JSON.parse(fileContents);

//         // Si es un array, añadir todos los elementos con la categoría
//         if (Array.isArray(data)) {
//           return data.map((item) => ({
//             ...item,
//             categoria: item.categoria || category, // Mantener categoría existente o usar la predeterminada
//           }));
//         }
//         // Si es un objeto, añadirlo con la categoría
//         else if (data && typeof data === "object") {
//           return [
//             {
//               ...data,
//               categoria: data.categoria || category,
//             },
//           ];
//         }

//         return [];
//       } catch (error) {
//         console.log(
//           `Archivo ${filePath} no encontrado o inválido:`,
//           error.message,
//         );
//         return []; // Retornar array vacío si hay error
//       }
//     };

//     // Cargar todos los archivos disponibles
//     for (const file of files) {
//       const filePath = path.join(publicDir, file.name);
//       const productsFromFile = await loadFileIfExists(filePath, file.category);
//       allProducts.push(...productsFromFile);
//     }

//     // Categorías principales
//     const mainCategories = [
//       {
//         id: "celulares",
//         title: "Celulares y Accesorios",
//         description:
//           "Smartphones de última generación y accesorios para tu dispositivo móvil.",
//         price: 0,
//         categoria: "celulares",
//         destacado: true,
//         images: [
//           "/https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
//         ],
//       },
//       {
//         id: "computadores",
//         title: "Computadores y Accesorios",
//         description:
//           "Equipos de cómputo y accesorios para aumentar tu productividad.",
//         price: 0,
//         categoria: "computadores",
//         destacado: true,
//         images: [
//           "/https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
//         ],
//       },
//       {
//         id: "damas",
//         title: "Accesorios para Damas",
//         description: "Complementos de moda y accesorios para damas.",
//         price: 0,
//         categoria: "damas",
//         destacado: true,
//         images: [
//           "/https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
//         ],
//       },
//       {
//         id: "libros-nuevos",
//         title: "Libros Nuevos",
//         description: "Libros recién publicados y de última edición.",
//         price: 0,
//         categoria: "libros",
//         destacado: true,
//         images: [
//           "/https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
//         ],
//       },
//       {
//         id: "libros-usados",
//         title: "Libros Usados",
//         description:
//           "Libros de segunda mano en excelente estado y a precios accesibles.",
//         price: 0,
//         categoria: "libros",
//         destacado: true,
//         images: [
//           "/https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
//         ],
//       },
//     ];

//     // Añadir categorías principales
//     allProducts.push(...mainCategories);

//     // Si se solicitó un ID específico, filtrar ese producto
//     if (id) {
//       const producto = allProducts.find((p) => p.id === id);
//       if (producto) {
//         return NextResponse.json(producto);
//       }
//       return NextResponse.json(
//         { error: `Producto con ID ${id} no encontrado` },
//         { status: 404 },
//       );
//     }

//     // De lo contrario, devolver todos los productos
//     return NextResponse.json(allProducts);
//   } catch (error) {
//     console.error("Error en API de productos:", error);
//     return NextResponse.json(
//       { error: "Error al cargar productos", message: error.message },
//       { status: 500 },
//     );
//   }
// }

// app/api/productos/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Función para cargar productos desde archivo JSON local
async function loadProductsFromJSON() {
  try {
    // Ruta al archivo JSON (ajusta según la ubicación real de tu archivo)
    const filePath = path.join(process.cwd(), "data", "productos.json");

    // Leer el archivo de forma asíncrona
    const fileData = await fs.promises.readFile(filePath, "utf8");

    // Parsear el contenido JSON
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error al cargar el archivo JSON:", error);
    throw new Error("No se pudo cargar la información de productos");
  }
}

export async function GET(request) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Cargar datos desde el archivo JSON
    const allProducts = await loadProductsFromJSON();

    // Si se solicitó un ID específico, filtrar ese producto
    if (id) {
      const producto = allProducts.find((p) => p.id === id);
      if (producto) {
        return NextResponse.json(producto);
      }
      return NextResponse.json(
        { error: `Producto con ID ${id} no encontrado` },
        { status: 404 },
      );
    }

    // De lo contrario, devolver todos los productos
    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Error en API de productos:", error);
    return NextResponse.json(
      { error: "Error al cargar productos", message: error.message },
      { status: 500 },
    );
  }
}
