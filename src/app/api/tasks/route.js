import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    message: "Obtenido tareas",
  });
}

// rute to create
export function POST() {
  return NextResponse.json({
    message: "Creando tareas",
  });
}
