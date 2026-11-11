"use client";

import SelectorGoogle from "./SelectorGoogle";
import SelectorLeaflet from "./SelectorLeaflet";

const CLAVE_GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Mapa para ubicar el negocio: Google Maps cuando hay clave configurada
// (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY). Mientras no exista, se usa el mapa libre
// de respaldo para que el formulario siga funcionando.
export default function SelectorUbicacion(props) {
  return CLAVE_GOOGLE ? <SelectorGoogle clave={CLAVE_GOOGLE} {...props} /> : <SelectorLeaflet {...props} />;
}
