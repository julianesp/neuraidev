/**
 * Constantes globales para la aplicación
 */

// Placeholder SVG en base64 para evitar 404 cuando no hay imagen
export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ESin imagen%3C/text%3E%3C/svg%3E";

// Función helper para obtener la primera imagen de un producto
export function getProductImage(product) {
  // Si product es null o undefined, retornar placeholder
  if (!product) {
    return PLACEHOLDER_IMAGE;
  }

  // Prioridad 0: imagen_principal (productos de la tabla D1)
  if (
    typeof product.imagen_principal === 'string' &&
    product.imagen_principal.trim() !== '' &&
    product.imagen_principal !== 'null'
  ) {
    return product.imagen_principal;
  }

  // Normalizar imagenes: puede venir como array o como JSON string ("[...]")
  let imagenes = product.imagenes;
  if (typeof imagenes === 'string' && imagenes.trim().startsWith('[')) {
    try {
      imagenes = JSON.parse(imagenes);
    } catch {
      imagenes = null;
    }
  }

  // Prioridad 1: imagenes[0] (array de imágenes)
  if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
    const firstImage = imagenes[0];

    // Si es un objeto con url (formato: { alt, orden, url })
    if (firstImage && typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }

    // Si es un string directo
    if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
      return firstImage;
    }
  }

  // Prioridad 2: imagen (puede ser string u objeto)
  if (product.imagen) {
    // Si es un objeto con url
    if (typeof product.imagen === 'object' && product.imagen.url) {
      return product.imagen.url;
    }

    // Si es un string
    if (typeof product.imagen === 'string' &&
        product.imagen.trim() !== "" &&
        product.imagen !== 'null' &&
        product.imagen !== 'undefined') {
      return product.imagen;
    }
  }

  // Fallback: placeholder
  return PLACEHOLDER_IMAGE;
}
