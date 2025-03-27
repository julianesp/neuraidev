// // src/app/api/productos/[id]/route.js
// import { readFileSync } from "fs";
// import { NextResponse } from "next/server";
// import path from "path";

// export async function GET(request, { params }) {
//   try {
//     const { id } = params;
//     const filePath = path.join(
//       process.cwd(),
//       "/public",
//       "accesoriosDestacados.json",
//     );
//     const fileContents = readFileSync(filePath, "utf8");
//     const productos = JSON.parse(fileContents);

//     const producto = productos.find((p) => p.id === id);

//     if (!producto) {
//       return NextResponse.json(
//         { error: "Producto no encontrado" },
//         { status: 404 },
//       );
//     }

//     return NextResponse.json(producto);
//   } catch (error) {
//     console.error(`Error al cargar producto ${params.id}:`, error);
//     return NextResponse.json(
//       { error: "Error cargando producto" },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";

// Los mismos datos estáticos para consistencia
const datosAccesorios = [
  {
    id: 1,
    nombre: "Luces para bicicleta",
    descripcion:
      "Con batería recargable mediante USB tipo v. Cuentan con 3 modos de iluminación.",
    imagenes: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fluces_bici.jpg?alt=media&token=6dca1abb-ec2d-41ed-88a1-5fb7dc4474aa",
      },
    ],
    imagenPrincipal:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fluces_bici.jpg?alt=media&token=6dca1abb-ec2d-41ed-88a1-5fb7dc4474aa",
    precio: 34900,
    categoria: "damas",
  },
  {
    id: 2,
    nombre: "Disco SSD mSATA 256 GB",
    descripcion: "¡Optimiza el rendimiento de tu equipo!",
    imagenes: [
      {
        url: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/ssd%20mSata/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9zc2QgbVNhdGEvMS5qcGciLCJpYXQiOjE3NDI4NzAzNzQsImV4cCI6MTc3NDQwNjM3NH0.ufbta37bGQSK8rErZt0EBVpcRFwhOm8JnUH9cXoX5Aw",
      },
    ],
    imagenPrincipal:
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/ssd%20mSata/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9zc2QgbVNhdGEvMS5qcGciLCJpYXQiOjE3NDI4NzAzNzQsImV4cCI6MTc3NDQwNjM3NH0.ufbta37bGQSK8rErZt0EBVpcRFwhOm8JnUH9cXoX5Aw",
    precio: 119900,
    categoria: "computador",
  },
  {
    id: 3,
    nombre: "USB Tipo C - 2 metros",
    descripcion: "Diseñado para ofrecer durabilidad y rendimiento óptimos.",
    imagenes: [
      {
        url: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/usb%20t%20c%202%20metros/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy91c2IgdCBjIDIgbWV0cm9zLzEuanBnIiwiaWF0IjoxNzQyODcxMTUwLCJleHAiOjE3NzQ0MDcxNTB9.K9vtInBmomcXdmVBzDnENR4usObHFmQ9IYCGETr0byQ",
      },
    ],
    imagenPrincipal:
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/usb%20t%20c%202%20metros/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy91c2IgdCBjIDIgbWV0cm9zLzEuanBnIiwiaWF0IjoxNzQyODcxMTUwLCJleHAiOjE3NzQ0MDcxNTB9.K9vtInBmomcXdmVBzDnENR4usObHFmQ9IYCGETr0byQ",
    precio: 39900,
    categoria: "celulares",
  },
];

// Generar rutas estáticas para la API
export function generateStaticParams() {
  return datosAccesorios.map((accesorio) => ({
    id: accesorio.id.toString(),
  }));
}

// Función GET para la API
export async function GET(request, { params }) {
  const { id } = params;

  // Buscar el producto por ID
  const producto = datosAccesorios.find((p) => String(p.id) === String(id));

  if (!producto) {
    return NextResponse.json(
      { error: "Producto no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json(producto);
}
