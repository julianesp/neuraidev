// src/app/api/productos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const categoriaArchivos: Record<string, string> = {
  celulares: "celulares.json",
  computadoras: "computadoras.json",
  "libros-usados": "librosusados.json",
  "libros-nuevos": "librosnuevos.json",
  generales: "generales.json",
  damas: "damas.json",
  belleza: "damas.json",
  bicicletas: "bicicletas.json",
};

interface Producto {
  id: number | string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioAnterior?: number;
  categoria: string;
  imagenPrincipal?: string;
  imagenes?: Array<{ url: string; alt?: string }>;
  videoUrl?: string;
  destacado?: boolean;
  disponible?: boolean;
  stock?: number;
  sku?: string;
  marca?: string;
  condicion?: string;
  estado?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  cantidad?: number;
  fechaIngreso?: string;
}

async function buscarProductoPorId(id: string): Promise<Producto | null> {
  const archivos = Object.values(categoriaArchivos);
  const uniqueArchivos = Array.from(new Set(archivos));

  for (const archivo of uniqueArchivos) {
    try {
      const filePath = path.join(process.cwd(), "public", archivo);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(fileContent);

      if (data.accesorios) {
        const producto = data.accesorios.find(
          (p: Producto) => String(p.id) === String(id)
        );

        if (producto) {
          return {
            ...producto,
            stock: producto.cantidad || producto.stock || 0,
            disponible: producto.disponible !== undefined ? producto.disponible : (producto.cantidad || 0) > 0,
            condicion: producto.condicion || producto.estado || "nuevo",
            createdAt: producto.createdAt || producto.fechaIngreso || new Date().toISOString(),
            imagenes: producto.imagenes || (producto.imagenPrincipal ? [{ url: producto.imagenPrincipal }] : []),
          };
        }
      }
    } catch (err) {
      console.warn(`Error leyendo ${archivo}:`, err);
    }
  }

  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const producto = await buscarProductoPorId(id);

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(producto);
  } catch (error: unknown) {
    console.error("Error fetching producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json(
    { error: "La funcionalidad de actualizar productos desde JSON no está disponible" },
    { status: 501 }
  );
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json(
    { error: "La funcionalidad de eliminar productos desde JSON no está disponible" },
    { status: 501 }
  );
}
