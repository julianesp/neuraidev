// src/app/api/productos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Mapeo de categorías a archivos JSON
const categoriaArchivos: Record<string, string> = {
  celulares: "celulares.json",
  computadoras: "computadoras.json",
  "libros-usados": "librosusados.json",
  "libros-nuevos": "librosnuevos.json",
  generales: "generales.json",
  damas: "damas.json",
  belleza: "damas.json", // Usa el mismo archivo
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

async function leerProductosJSON(categoria?: string): Promise<Producto[]> {
  try {
    let productos: Producto[] = [];

    if (categoria && categoriaArchivos[categoria]) {
      // Leer archivo específico de categoría
      const filePath = path.join(process.cwd(), "public", categoriaArchivos[categoria]);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(fileContent);
      productos = data.accesorios || [];
    } else {
      // Leer todos los archivos JSON
      const categorias = Object.values(categoriaArchivos);
      const uniqueCategorias = Array.from(new Set(categorias));

      for (const archivo of uniqueCategorias) {
        try {
          const filePath = path.join(process.cwd(), "public", archivo);
          const fileContent = await fs.readFile(filePath, "utf-8");
          const data = JSON.parse(fileContent);
          if (data.accesorios) {
            productos = productos.concat(data.accesorios);
          }
        } catch (err) {
          console.warn(`No se pudo leer ${archivo}:`, err);
        }
      }
    }

    // Normalizar productos para compatibilidad con el formato anterior
    return productos.map((p) => ({
      ...p,
      stock: p.cantidad || p.stock || 0,
      disponible: p.disponible !== undefined ? p.disponible : (p.cantidad || 0) > 0,
      condicion: p.condicion || p.estado || "nuevo",
      createdAt: p.createdAt || p.fechaIngreso || new Date().toISOString(),
      imagenes: p.imagenes || (p.imagenPrincipal ? [{ url: p.imagenPrincipal }] : []),
    }));
  } catch (error) {
    console.error("Error leyendo productos:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const categoria = url.searchParams.get("categoria");
    const destacado = url.searchParams.get("destacado");
    const disponible = url.searchParams.get("disponible");
    const search = url.searchParams.get("search");
    const condicion = url.searchParams.get("condicion");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    let productos = await leerProductosJSON(categoria || undefined);

    // Filtros
    if (destacado === "true") {
      productos = productos.filter((p) => p.destacado === true);
    }

    if (disponible === "true") {
      productos = productos.filter((p) => p.disponible === true);
    }

    if (condicion) {
      productos = productos.filter((p) => p.condicion === condicion);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      productos = productos.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(searchLower) ||
          p.descripcion?.toLowerCase().includes(searchLower) ||
          p.marca?.toLowerCase().includes(searchLower) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    productos.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Paginación
    const total = productos.length;
    const offset = (page - 1) * limit;
    const productosPaginados = productos.slice(offset, offset + limit);

    return NextResponse.json({
      productos: productosPaginados,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("[GET /api/productos] Error fetching productos:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "La funcionalidad de crear productos desde JSON no está disponible" },
    { status: 501 }
  );
}
