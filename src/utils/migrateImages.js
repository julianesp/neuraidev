import { put } from '@vercel/blob';

/**
 * Migra una imagen de Firebase Storage a Vercel Blob
 * @param {string} firebaseUrl - URL de la imagen en Firebase
 * @param {string} filename - Nombre del archivo para Vercel Blob
 * @returns {Promise<string|null>} URL de Vercel Blob o null si falla
 */
export async function migrateFirebaseImage(firebaseUrl, filename) {
  try {
    console.log(`Migrando imagen: ${filename}`);
    
    const response = await fetch(firebaseUrl);
    if (!response.ok) {
      throw new Error(`Error al descargar imagen: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    const result = await put(filename, blob, {
      access: 'public',
      addRandomSuffix: false,
    });
    
    console.log(`Imagen migrada exitosamente: ${result.url}`);
    return result.url;
  } catch (error) {
    console.error('Error migrando imagen:', error);
    return null;
  }
}

/**
 * Migra múltiples imágenes de Firebase a Vercel Blob
 * @param {Array} images - Array de objetos con {url, filename}
 * @returns {Promise<Array>} Array con URLs migradas
 */
export async function migrateBatchImages(images) {
  const results = [];
  
  for (const image of images) {
    const migratedUrl = await migrateFirebaseImage(image.url, image.filename);
    results.push({
      original: image.url,
      migrated: migratedUrl,
      filename: image.filename
    });
  }
  
  return results;
}

/**
 * Extrae el nombre del archivo de una URL de Firebase
 * @param {string} firebaseUrl - URL de Firebase
 * @returns {string} Nombre del archivo extraído
 */
export function extractFilenameFromFirebaseUrl(firebaseUrl) {
  try {
    const url = new URL(firebaseUrl);
    const pathSegments = url.pathname.split('/');
    let filename = pathSegments[pathSegments.length - 1];
    
    // Remover parámetros de consulta
    filename = filename.split('?')[0];
    
    // Decodificar caracteres especiales
    filename = decodeURIComponent(filename);
    
    return filename;
  } catch (error) {
    console.error('Error extrayendo nombre de archivo:', error);
    return `image_${Date.now()}.jpg`;
  }
}

/**
 * Migra todas las imágenes de un producto/accesorio
 * @param {Object} product - Objeto del producto con imágenes
 * @returns {Promise<Object>} Producto con URLs migradas
 */
export async function migrateProductImages(product) {
  const migratedProduct = { ...product };
  
  // Migrar imagen principal
  if (product.imagenPrincipal) {
    const filename = extractFilenameFromFirebaseUrl(product.imagenPrincipal);
    const migratedUrl = await migrateFirebaseImage(product.imagenPrincipal, filename);
    if (migratedUrl) {
      migratedProduct.imagenPrincipal = migratedUrl;
    }
  }
  
  // Migrar imágenes adicionales (array "images")
  if (product.images && Array.isArray(product.images)) {
    const migratedImages = [];
    
    for (const image of product.images) {
      const imageUrl = typeof image === 'string' ? image : image.url;
      const filename = extractFilenameFromFirebaseUrl(imageUrl);
      const migratedUrl = await migrateFirebaseImage(imageUrl, filename);
      
      if (migratedUrl) {
        migratedImages.push(
          typeof image === 'string' ? migratedUrl : { ...image, url: migratedUrl }
        );
      } else {
        // Mantener la URL original si falla la migración
        migratedImages.push(image);
      }
    }
    
    migratedProduct.images = migratedImages;
  }

  // Migrar imágenes adicionales (array "imagenes")
  if (product.imagenes && Array.isArray(product.imagenes)) {
    const migratedImages = [];
    
    for (const image of product.imagenes) {
      const imageUrl = typeof image === 'string' ? image : image.url;
      const filename = extractFilenameFromFirebaseUrl(imageUrl);
      const migratedUrl = await migrateFirebaseImage(imageUrl, filename);
      
      if (migratedUrl) {
        migratedImages.push(
          typeof image === 'string' ? migratedUrl : { ...image, url: migratedUrl }
        );
      } else {
        // Mantener la URL original si falla la migración
        migratedImages.push(image);
      }
    }
    
    migratedProduct.imagenes = migratedImages;
  }
  
  return migratedProduct;
}