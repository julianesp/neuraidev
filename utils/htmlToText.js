/**
 * Convierte HTML a texto plano eliminando todas las etiquetas
 * @param {string} html - String HTML
 * @param {number} maxLength - Longitud máxima del texto (opcional)
 * @returns {string} - Texto plano sin etiquetas HTML
 */
export function htmlToPlainText(html, maxLength = null) {
  if (!html) return "";

  // Eliminar todas las etiquetas HTML
  let text = html
    .replace(/<[^>]*>/g, "") // Remover etiquetas HTML
    .replace(/&nbsp;/g, " ") // Reemplazar &nbsp; con espacio
    .replace(/&amp;/g, "&") // Reemplazar &amp; con &
    .replace(/&lt;/g, "<") // Reemplazar &lt; con <
    .replace(/&gt;/g, ">") // Reemplazar &gt; con >
    .replace(/&quot;/g, '"') // Reemplazar &quot; con "
    .replace(/&#39;/g, "'") // Reemplazar &#39; con '
    .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
    .trim();

  // Si se especifica una longitud máxima, truncar el texto
  if (maxLength && text.length > maxLength) {
    text = text.substring(0, maxLength) + "...";
  }

  return text;
}

/**
 * Extrae un resumen de texto desde HTML
 * @param {string} html - String HTML
 * @param {number} sentences - Número de oraciones a incluir (por defecto 2)
 * @returns {string} - Resumen del texto
 */
export function htmlToSummary(html, sentences = 2) {
  const plainText = htmlToPlainText(html);

  // Dividir en oraciones
  const sentenceArray = plainText.match(/[^\.!\?]+[\.!\?]+/g) || [plainText];

  // Tomar las primeras N oraciones
  const summary = sentenceArray.slice(0, sentences).join(" ");

  return summary;
}
