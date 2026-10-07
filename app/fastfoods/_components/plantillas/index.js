import Clasica from "./Clasica";

/**
 * Nivel 2: variantes de plantilla compartidas por todos los negocios.
 * Las keys deben coincidir con PLANTILLAS en lib/fastfoods/utils.js.
 * Todas reciben { negocio, menu, especiales, productosNeurai, SeccionCustom, esDueno }.
 */
const plantillas = {
  clasica: Clasica,
};

export function getPlantilla(key) {
  return plantillas[key] || Clasica;
}
