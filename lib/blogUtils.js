/**
 * Utilidades para blogs
 * Calcula automáticamente tiempo de lectura y genera fechas
 */

/**
 * Calcula el tiempo de lectura estimado basado en el contenido
 * @param {string} content - El contenido del artículo (puede ser JSX como string o texto plano)
 * @returns {number} - Tiempo estimado en minutos
 */
export function calculateReadingTime(content) {
  if (!content) return 5; // Default 5 minutos si no hay contenido

  // Limpiar el contenido de tags HTML/JSX
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ') // Remover tags HTML
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();

  // Contar palabras
  const words = cleanContent.split(' ').filter(word => word.length > 0).length;

  // Velocidad promedio de lectura: 200-250 palabras por minuto
  // Usamos 225 como promedio
  const wordsPerMinute = 225;
  const minutes = Math.ceil(words / wordsPerMinute);

  // Mínimo 1 minuto, máximo razonable
  return Math.max(1, Math.min(minutes, 60));
}

/**
 * Genera la fecha actual en formato ISO
 * @returns {string} - Fecha en formato ISO 8601
 */
export function getCurrentDate() {
  return new Date().toISOString();
}

/**
 * Formatea una fecha ISO a formato legible en español
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} - Fecha formateada (ej: "15 de Enero, 2025")
 */
export function formatDate(isoDate) {
  const date = new Date(isoDate);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} de ${month}, ${year}`;
}

/**
 * Calcula automáticamente los metadatos de un artículo
 * @param {Object} options - Opciones del artículo
 * @returns {Object} - Metadatos completos con fecha y tiempo de lectura
 */
export function generateArticleMetadata({
  content = '',
  publishDate = null,
  customReadTime = null
}) {
  const datePublished = publishDate || getCurrentDate();
  const readTime = customReadTime || calculateReadingTime(content);

  return {
    datePublished,
    dateModified: datePublished,
    readTime,
    formattedDate: formatDate(datePublished)
  };
}
