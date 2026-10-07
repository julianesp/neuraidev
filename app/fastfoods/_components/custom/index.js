/**
 * Nivel 3: secciones hechas a la medida de UN negocio (último recurso).
 * Se muestra debajo del encabezado y recibe { negocio }.
 *
 * Antes de agregar algo aquí, revisar si se resuelve con el tema (nivel 1)
 * o con una plantilla que sirva a todos (nivel 2).
 *
 * Ejemplo:
 *   import SeccionLaEsquina from "./la-esquina";
 *   const custom = { "la-esquina": SeccionLaEsquina };
 */
const custom = {};

export function getSeccionCustom(slug) {
  return custom[slug] || null;
}
