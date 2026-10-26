import Image from "next/image";

/**
 * Logo de un sitio del portafolio, siempre en un círculo: lo que sobra se
 * recorta y no desborda la tarjeta. `sitio.ajuste` ("contain") deja el logo
 * completo con margen interno; `sitio.posicion` cambia el encuadre del recorte.
 * Estilos en línea porque Tailwind no escanea components/.
 */
export default function LogoSitio({ sitio, size = 96, className = "" }) {
  const esImagen = /^(https?:)?\//.test(sitio.imagen);
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        marginInline: "auto",
        borderRadius: "9999px",
        overflow: "hidden",
      }}
    >
      {esImagen ? (
        // Contenedor interno: con "contain" se encoge un 18% por lado para que
        // el logo completo quepa dentro del círculo sin tocar el borde.
        <div
          style={{
            position: "absolute",
            inset: sitio.ajuste === "contain" ? "18%" : 0,
          }}
        >
          <Image
            src={sitio.imagen}
            alt={`Logo de ${sitio.nombre}`}
            fill
            sizes={`${size}px`}
            style={{
              objectFit: sitio.ajuste || "cover",
              objectPosition: sitio.posicion || "center",
            }}
            unoptimized
          />
        </div>
      ) : (
        <span
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.5,
          }}
        >
          {sitio.imagen}
        </span>
      )}
    </div>
  );
}
