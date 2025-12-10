import { ImageResponse } from "next/og";

// Tamaño de imagen recomendado para Open Graph
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
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Patrón de fondo tecnológico */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
            display: "flex",
          }}
        />

        {/* Contenedor principal */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: "30px",
            padding: "60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            border: "4px solid rgba(255, 255, 255, 0.4)",
            width: "100%",
          }}
        >
          {/* Logo y título */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "30px",
              flexDirection: "column",
            }}
          >
            {/* Logo neurai.dev */}
            <div
              style={{
                borderRadius: "20px",
                padding: "15px",
                display: "flex",
                marginBottom: "25px",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1e3a8a",
                boxShadow: "0 10px 25px rgba(30, 58, 138, 0.3)",
              }}
            >
              <img
                src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png"
                alt="Logo neurai.dev"
                width="140"
                height="140"
                style={{
                  borderRadius: "15px",
                  objectFit: "cover",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "72px",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                  lineHeight: "1.2",
                  marginBottom: "15px",
                  display: "flex",
                }}
              >
                neurai.dev
              </div>
              <div
                style={{
                  fontSize: "32px",
                  color: "#3b82f6",
                  fontWeight: "600",
                  display: "flex",
                }}
              >
                Tecnología y Servicios Profesionales
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div
            style={{
              fontSize: "24px",
              color: "#374151",
              marginBottom: "35px",
              lineHeight: "1.5",
              maxWidth: "900px",
              display: "flex",
              textAlign: "center",
            }}
          >
            Accesorios tecnológicos, desarrollo web, soporte técnico y más. Tu
            tienda de confianza en el Valle de Sibundoy.
          </div>

          {/* Características */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "25px",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#dbeafe",
                padding: "12px 25px",
                borderRadius: "12px",
                fontSize: "20px",
                color: "#1e3a8a",
                fontWeight: "600",
                border: "2px solid #93c5fd",
                display: "flex",
              }}
            >
              🛒 Tienda Online
            </div>
            <div
              style={{
                background: "#dbeafe",
                padding: "12px 25px",
                borderRadius: "12px",
                fontSize: "20px",
                color: "#1e3a8a",
                fontWeight: "600",
                border: "2px solid #93c5fd",
                display: "flex",
              }}
            >
              💻 Desarrollo Web
            </div>
            <div
              style={{
                background: "#dbeafe",
                padding: "12px 25px",
                borderRadius: "12px",
                fontSize: "20px",
                color: "#1e3a8a",
                fontWeight: "600",
                border: "2px solid #93c5fd",
                display: "flex",
              }}
            >
              🔧 Soporte Técnico
            </div>
            <div
              style={{
                background: "#dcfce7",
                padding: "12px 25px",
                borderRadius: "12px",
                fontSize: "20px",
                color: "#166534",
                fontWeight: "600",
                border: "2px solid #86efac",
                display: "flex",
              }}
            >
              🚚 Envíos GRATIS*
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              fontSize: "22px",
              color: "#6b7280",
              marginTop: "15px",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div>📱 317-450-3604</div>
            <div>•</div>
            <div>📍 Valle de Sibundoy, Putumayo</div>
            <div>•</div>
            <div>🌐 neurai.dev</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
