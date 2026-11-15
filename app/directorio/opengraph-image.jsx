import { ImageResponse } from "next/og";

// Imagen al compartir el enlace del directorio (WhatsApp, Facebook…):
// invita a registrar el negocio, en vez de la imagen general de la tienda.
export const alt = "Directorio de negocios del Putumayo — Registra tu negocio gratis | neurai.dev";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PUNTOS = ["WhatsApp directo", "Fotos y ofertas", "Mapa y horario"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#2563eb",
          padding: "56px 64px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.4)",
              borderRadius: 999,
              padding: "8px 22px",
            }}
          >
            Directorio del Putumayo
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>
            Registra tu negocio
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#1e3a8a",
              background: "white",
              borderRadius: 18,
              padding: "4px 24px",
              marginTop: 14,
              alignSelf: "flex-start",
            }}
          >
            ¡gratis!
          </div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 28, color: "#dbeafe" }}>
            Que los clientes te encuentren y te escriban directo.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {PUNTOS.map((p) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 600,
                  background: "white",
                  color: "#1d4ed8",
                  borderRadius: 12,
                  padding: "10px 18px",
                }}
              >
                {p}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>neurai.dev/directorio</div>
        </div>
      </div>
    ),
    size
  );
}
