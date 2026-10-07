import { ImageResponse } from "next/og";
import { getEspecialesVigentes, getFastfoodPorSlug } from "@/lib/fastfoods/data";
import { formatoPrecio, horaLegible } from "@/lib/fastfoods/utils";

// Vista previa que aparece al compartir el enlace por WhatsApp: si hay especial
// vigente muestra su foto y precio; si no, la portada con el nombre del negocio.
export const alt = "Menú y especial del día";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

// next/og no decodifica WebP/SVG: solo usamos fotos JPG o PNG.
function imagenCompatible(url) {
  return url && /\.(jpe?g|png)(\?|$)/i.test(url) ? url : null;
}

export default async function Image({ params }) {
  const { slug } = await params;
  const negocio = await getFastfoodPorSlug(slug).catch(() => null);
  const visible = negocio?.estado === "publicado";
  const especial = visible ? (await getEspecialesVigentes(negocio.id).catch(() => []))[0] : null;

  const nombre = visible ? negocio.nombre : "neurai.dev";
  const primario = negocio?.tema?.colorPrimario || "#e11d48";
  const foto = imagenCompatible(especial?.foto_url) || imagenCompatible(negocio?.portada_url);
  const titulo = especial ? especial.titulo : nombre;
  const detalle = especial
    ? [especial.precio ? formatoPrecio(especial.precio) : null, `Hoy hasta las ${horaLegible(especial.expira_en)}`]
        .filter(Boolean)
        .join("  ·  ")
    : "Menú y pedidos por WhatsApp";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: primario }}>
        {foto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "56px",
            background: foto
              ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%)"
              : "transparent",
            color: "white",
          }}
        >
          {especial && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                // Sin foto el fondo ya es el color principal: la etiqueta va en blanco.
                background: foto ? primario : "white",
                color: foto ? "white" : primario,
                borderRadius: 999,
                padding: "10px 24px",
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              ESPECIAL DE HOY · {nombre}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{titulo}</div>
          <div style={{ display: "flex", fontSize: 36, marginTop: 16, opacity: 0.95 }}>{detalle}</div>
        </div>
      </div>
    ),
    size
  );
}
