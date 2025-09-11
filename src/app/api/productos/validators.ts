// src/app/api/productos/validators.ts
import { z } from "zod";

export const productoCreateSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().optional(),
  precio: z.coerce.number().nonnegative("El precio debe ser mayor o igual a 0"),
  precioAnterior: z.coerce.number().nonnegative().optional(),
  categoria: z.string().min(1, "La categoría es requerida"),
  imagenPrincipal: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Debe ser una URL válida"),
  videoUrl: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Debe ser una URL válida"),
  destacado: z.coerce.boolean().optional().default(false),
  disponible: z.coerce.boolean().optional().default(true),
  stock: z.coerce.number().int().nonnegative().optional().default(0),
  sku: z.string().optional(),
  marca: z.string().optional(),
  condicion: z.enum(["nuevo", "usado", "reacondicionado"]).optional().default("nuevo"),
  tags: z.array(z.string()).optional().default([]),
  tiendaId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  imagenes: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    orden: z.number().int().optional().default(0)
  })).optional().default([])
});

export const productoUpdateSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  descripcion: z.string().optional(),
  precio: z.coerce.number().nonnegative().optional(),
  precioAnterior: z.coerce.number().nonnegative().optional(),
  categoria: z.string().min(1).optional(),
  imagenPrincipal: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Debe ser una URL válida"),
  videoUrl: z.string().optional().refine(val => !val || z.string().url().safeParse(val).success, "Debe ser una URL válida"),
  destacado: z.coerce.boolean().optional(),
  disponible: z.coerce.boolean().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  sku: z.string().optional(),
  marca: z.string().optional(),
  condicion: z.enum(["nuevo", "usado", "reacondicionado"]).optional(),
  tags: z.array(z.string()).optional(),
  tiendaId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  imagenes: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    orden: z.number().int().optional().default(0)
  })).optional()
});

export const categoriaCreateSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres"),
  descripcion: z.string().optional(),
  icono: z.string().optional(),
  activa: z.coerce.boolean().optional().default(true),
  orden: z.coerce.number().int().optional().default(0)
});

export const categoriaUpdateSchema = z.object({
  nombre: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  descripcion: z.string().optional(),
  icono: z.string().optional(),
  activa: z.coerce.boolean().optional(),
  orden: z.coerce.number().int().optional()
});

export const tiendaCreateSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  logo: z.string().url().optional(),
  activa: z.coerce.boolean().optional().default(true)
});

export const tiendaUpdateSchema = z.object({
  nombre: z.string().min(2).optional(),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  logo: z.string().url().optional(),
  activa: z.coerce.boolean().optional()
});