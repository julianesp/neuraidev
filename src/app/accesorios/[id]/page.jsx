import React from "react";
// import AccesoriosContainer from "@/components/AccesoriosContainer";
import AccesoriosContainer from "@/containers/AccesoriosContainer";
import { notFound } from "next/navigation";

// Datos estáticos para fallback (en caso de que no puedas cargar el JSON)
const datosAccesorios = [
  {
    id: 1,
    nombre: "Luces para bicicleta",
    descripcion:
      "Con batería recargable mediante USB tipo v. Cuentan con 3 modos de iluminación.",
    imagenes: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      },
    ],
    imagenPrincipal:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
    precio: 34900,
    categoria: "damas",
  },
  {
    id: 2,
    nombre: "Disco SSD mSATA 256 GB",
    descripcion: "¡Optimiza el rendimiento de tu equipo!",
    imagenes: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      },
    ],
    imagenPrincipal:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
    precio: 119900,
    categoria: "computador",
  },
  {
    id: 3,
    nombre: "USB Tipo C - 2 metros",
    descripcion: "Diseñado para ofrecer durabilidad y rendimiento óptimos.",
    imagenes: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      },
    ],
    imagenPrincipal:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
    precio: 39900,
    categoria: "celulares",
  },
];

// Generar rutas estáticas
export function generateStaticParams() {
  console.log("Generando 3 rutas estáticas para accesorios");

  // Usar los datos estáticos para generar rutas
  return datosAccesorios.map((accesorio) => ({
    id: accesorio.id.toString(),
  }));
}

// Componente de página
export default function AccesorioPage({ params }) {
  const { id } = params;

  // Buscar el accesorio por ID usando los datos estáticos
  const accesorio = datosAccesorios.find(
    (acc) => String(acc.id) === String(id),
  );

  if (!accesorio) {
    return notFound();
  }

  // Otros accesorios (todos excepto el actual)
  const otrosAccesorios = datosAccesorios.filter(
    (acc) => String(acc.id) !== String(id),
  );

  // Renderiza el componente AccesoriosContainer con los datos
  return (
    <AccesoriosContainer
      accesorio={accesorio}
      otrosAccesorios={otrosAccesorios}
      telefono="+573174503604"
    />
  );
}
