import { NextResponse } from "next/server";

export function GET(request, { params }) {
  // mostrando en consola lo ingresado
  console.log(params);
  return NextResponse.json({
    message: `Obtenido única tarea ${params.id} de ID`,
  });
}

export function DELETE(request, { params }) {
  // mostrando en consola lo ingresado
  console.log(params);
  return NextResponse.json({
    message: `Eliminando única tarea ${params.id} de ID`,
  });
}

export function PUT(request, { params }) {
  // mostrando en consola lo ingresado
  console.log(params);
  return NextResponse.json({
    message: `Actualizando única tarea ${params.id} de ID`,
  });
}
