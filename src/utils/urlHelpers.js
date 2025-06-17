// src/utils/urlHelpers.js

export function generarTituloSEO(accesorio, categoria) {
  if (!accesorio) {
    return "Accesorios de Calidad | Tu Tienda";
  }

  const nombre = accesorio.nombre || "Accesorio";
  const categoriaFormateada = categoria
    ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
    : "Accesorios";

  return `${nombre} - ${categoriaFormateada} | Tu Tienda`;
}

export function generarDescripcionSEO(accesorio) {
  if (!accesorio) {
    return "Descubre nuestros accesorios de alta calidad.";
  }

  let descripcion = accesorio.descripcion || "";

  if (descripcion.length > 160) {
    descripcion = descripcion.substring(0, 157) + "...";
  }

  if (!descripcion || descripcion.length < 20) {
    descripcion = `${accesorio.nombre || "Accesorio"} de alta calidad.`;
  }

  return descripcion;
}

export function generarSlugDesdeNombre(nombre) {
  if (!nombre || typeof nombre !== "string") {
    return "accesorio-sin-nombre";
  }

  return nombre
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

export function generarUrlAccesorio(categoria, accesorio) {
  const slug = accesorio.slug || generarSlugDesdeNombre(accesorio.nombre);
  return `/accesorios/${categoria}/${slug}`;
}
