import { ImageResponse } from "next/og";

// Imagen optimizada para Open Graph con el logo de neurai.dev
export const alt =
  "neurai.dev - Tienda Online de Tecnología y Servicios Profesionales";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #000000 0%, #1e40af 50%, #3b82f6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          position: "relative",
        }}
      >
        {/* Contenedor principal con fondo blanco */}
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "1120px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Columna izquierda: Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "50px",
            }}
          >
            <img
              src="https://media.neurai.dev/logo.png"
              alt="Logo neurai.dev"
              width={200}
              height={316}
              style={{
                objectFit: "contain",
              }}
            />
          </div>

          {/* Columna derecha: Información */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            {/* Título */}
            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #000000 0%, #3b82f6 100%)",
                backgroundClip: "text",
                color: "transparent",
                lineHeight: "1.1",
                marginBottom: "20px",
                display: "flex",
              }}
            >
              neurai.dev
            </div>

            {/* Subtítulo */}
            <div
              style={{
                fontSize: "28px",
                color: "#3b82f6",
                fontWeight: "600",
                marginBottom: "25px",
                display: "flex",
              }}
            >
              Tecnología y Servicios Profesionales
            </div>

            {/* Descripción */}
            <div
              style={{
                fontSize: "20px",
                color: "#4b5563",
                marginBottom: "30px",
                lineHeight: "1.4",
                display: "flex",
              }}
            >
              Accesorios tecnológicos • Desarrollo web • Soporte técnico
            </div>

            {/* Badges */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "#dbeafe",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "16px",
                  color: "#1e40af",
                  fontWeight: "600",
                  display: "flex",
                }}
              >
                🛒 Tienda Online
              </div>

              {/* <div
                style={{
                  background: "#dcfce7",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "16px",
                  color: "#166534",
                  fontWeight: "600",
                  display: "flex",
                }}
              >
                🚚 Envíos GRATIS*
              </div> */}
            </div>

            {/* Footer info */}
            <div
              style={{
                display: "flex",
                marginTop: "25px",
                fontSize: "18px",
                color: "#6b7280",
                gap: "15px",
              }}
            >
              <span>📱 317-450-3604</span>
              <span>•</span>
              <span>📍 Valle de Sibundoy</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
