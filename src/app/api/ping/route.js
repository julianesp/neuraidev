import { NextResponse } from "next/server";
import { connectedDB } from "@/utils/mongoose";

export function GET() {
  connectedDB();

  return NextResponse.json({
    message: "Obtenido tareas",
  });
}
