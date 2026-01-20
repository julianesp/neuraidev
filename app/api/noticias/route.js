import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const NOTICIAS_FILE = path.join(process.cwd(), "data", "noticias.json");

// Asegurar que existe el directorio y archivo
async function ensureNoticiasFile() {
  try {
    const dir = path.dirname(NOTICIAS_FILE);
    await fs.mkdir(dir, { recursive: true });

    try {
      await fs.access(NOTICIAS_FILE);
    } catch {
      await fs.writeFile(NOTICIAS_FILE, JSON.stringify({ noticias: [] }, null, 2));
    }
  } catch (error) {
    console.error("Error al crear archivo de noticias:", error);
  }
}

// GET - Obtener todas las noticias
export async function GET() {
  try {
    await ensureNoticiasFile();
    const data = await fs.readFile(NOTICIAS_FILE, "utf-8");
    const noticias = JSON.parse(data);

    // Ordenar por fecha descendente
    noticias.noticias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return NextResponse.json(noticias);
  } catch (error) {
    console.error("Error al leer noticias:", error);
    return NextResponse.json({ noticias: [] });
  }
}

// POST - Agregar nueva noticia
export async function POST(request) {
  try {
    await ensureNoticiasFile();
    const nuevaNoticia = await request.json();

    const data = await fs.readFile(NOTICIAS_FILE, "utf-8");
    const noticias = JSON.parse(data);

    noticias.noticias.unshift(nuevaNoticia);

    // Limitar a 50 noticias máximo
    if (noticias.noticias.length > 50) {
      noticias.noticias = noticias.noticias.slice(0, 50);
    }

    await fs.writeFile(NOTICIAS_FILE, JSON.stringify(noticias, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al guardar noticia:", error);
    return NextResponse.json(
      { error: "Error al guardar noticia" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar noticia
export async function DELETE(request) {
  try {
    await ensureNoticiasFile();
    const { index } = await request.json();

    const data = await fs.readFile(NOTICIAS_FILE, "utf-8");
    const noticias = JSON.parse(data);

    if (index >= 0 && index < noticias.noticias.length) {
      noticias.noticias.splice(index, 1);
      await fs.writeFile(NOTICIAS_FILE, JSON.stringify(noticias, null, 2));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Índice inválido" }, { status: 400 });
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    return NextResponse.json(
      { error: "Error al eliminar noticia" },
      { status: 500 }
    );
  }
}
