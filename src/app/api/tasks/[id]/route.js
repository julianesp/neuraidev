import { NextResponse } from "next/server";
import { connectedDB } from "@/utils/mongoose";
import Tarea from "@/models/Task";

export async function GET(request, { params }) {
  connectedDB();
  const taskFound = await Tarea.findById(params.id);

  try {
    if (!tareaEncontrada)
      return NextResponse.json(
        {
          message: `No se encontró la tarea ${params.id} de ID`,
        },
        {
          status: 404,
        }
      );

    return NextResponse.json(tareaEncontrada);
  } catch (error) {
    return NextResponse.json(error.message, {
      status: 400,
    });
  }
}

// export function DELETE(request, { params }) {
//   // mostrando en consola lo ingresado
//   console.log(params);
//   return NextResponse.json({
//     message: `Eliminando única tarea ${params.id} de ID`,
//   });
// }

// Update
export async function PUT(request, { params }) {
  const data = await request.json();
  // mostrando en consola lo ingresado
  console.log(data);

  return NextResponse.json({
    message: `Actualizando única tarea ${params.id} de ID`,
  });
}
