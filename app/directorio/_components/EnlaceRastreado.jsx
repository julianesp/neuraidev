"use client";

// Enlace normal que además avisa (sin frenar la navegación) que alguien tocó
// WhatsApp, Llamar o Cómo llegar: alimenta las estadísticas del dueño.
export default function EnlaceRastreado({ negocioId, tipo, onClick, children, ...props }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        onClick?.(e);
        try {
          navigator.sendBeacon(
            "/api/directorio/evento",
            new Blob([JSON.stringify({ id: negocioId, tipo })], { type: "application/json" })
          );
        } catch {
          /* las estadísticas nunca deben impedir abrir el enlace */
        }
      }}
    >
      {children}
    </a>
  );
}
