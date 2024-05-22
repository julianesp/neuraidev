import { NextResponse } from "next/server";
import { connectedDB } from "@/utils/mongoose";

export function GET() {
  connectedDB();

  return NextResponse.json({
    message: "Obtenido tareas",
  });
}
export function POST() {
  return NextResponse.json({
    message: "Creando tareas",
  });
}
