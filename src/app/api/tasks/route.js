import { NextResponse } from "next/server";
import { connectedDB } from "@/utils/mongoose";
import Evento from "@/models/Task";

export async function GET() {
  // para hacer consultas
  connectedDB();
  const tareas = await Evento.find();
  return NextResponse.json(tareas);
}

// route to create
export async function POST(request) {
  try {
    const data = await request.json();
    const newTask = new Evento(data);

    // saving this new task on the database
    const saveTask = await newTask.save();

    return NextResponse.json(saveTask);
  } catch (error) {
    return NextResponse.json(error.message, {
      status: 400,
    });
  }
}
