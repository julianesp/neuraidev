import { NextResponse } from "next/server";
import { connectedDB } from "@/utils/mongoose";
import Task from "@/models/Task";

export async function GET() {
  // para hacer consultas
  connectedDB();

  // retornando todas las tasks
  const tasks = await Task.find();

  // return NextResponse.json({
  //   message: "Obtenido tareas",
  // });

  // retornando el arreglo de tareas anterior
  return NextResponse.json(tasks);
}

// rute to create
export async function POST(request) {

  const data = await request.json();
  console.log(data);

  return NextResponse.json({
    message: "Creando tareas",
  });
}
