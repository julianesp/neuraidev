import { ImageResponse } from "next/og";
import { getPlato } from "@/lib/fastfoods/data";
import { formatoPrecio } from "@/lib/fastfoods/utils";
import { OG_ALTO as ALTO, OG_ANCHO as ANCHO, comoJpeg, fotoParaOg } from "@/lib/fastfoods/og";

export const dynamic = "force-dynamic";

// GET /fastfoods/<slug>/plato/<id>/imagen — vista previa al compartir un plato:
// la foto del plato con su nombre, precio y el negocio (no el logo de neurai.dev).
export async function GET(request, { params }) {
  const { slug, id } = await params;
  const datos = await getPlato(slug, id).catch(() => null);
  const negocio = datos?.negocio;
  const plato = datos?.plato;
  const primario = negocio?.tema?.colorPrimario || "#e11d48";
  // JPEG ya recortado a 1200×630 (también sirve para fotos WebP).
  const foto = await fotoParaOg(plato?.foto_url);

  // JPEG comprimido: WhatsApp descarta vistas previas de más de ~300 KB.
  return comoJpeg(new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: primario }}>
        {foto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt=""
            width={ANCHO}
            height={ALTO}
            style={{ position: "absolute", top: 0, left: 0, width: ANCHO, height: ALTO, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: ANCHO,
            height: ALTO,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "56px",
            color: "white",
            background: foto
              ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0) 100%)"
              : "transparent",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: foto ? primario : "white",
              color: foto ? "white" : primario,
              borderRadius: 999,
              padding: "10px 24px",
              fontSize: 30,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            {negocio?.nombre || "neurai.dev"}
          </div>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 800, lineHeight: 1.05 }}>
            {plato?.nombre || "Menú"}
          </div>
          {plato?.precio ? (
            <div style={{ display: "flex", fontSize: 48, fontWeight: 700, marginTop: 14 }}>
              {formatoPrecio(plato.precio)}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: ANCHO, height: ALTO }
  ));
}
