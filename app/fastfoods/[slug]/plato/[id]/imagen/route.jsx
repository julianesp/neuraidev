import { ImageResponse } from "next/og";
import { getPlato } from "@/lib/fastfoods/data";
import { formatoPrecio } from "@/lib/fastfoods/utils";

export const dynamic = "force-dynamic";

const ANCHO = 1200;
const ALTO = 630;

// next/og no decodifica WebP/SVG: con esas fotos usamos la foto tal cual
// como og:image (ver generateMetadata de la página) y aquí solo el texto.
function fotoCompatible(url) {
  return url && /\.(jpe?g|png)(\?|$)/i.test(url) ? url : null;
}

// GET /fastfoods/<slug>/plato/<id>/imagen — vista previa al compartir un plato:
// la foto del plato con su nombre, precio y el negocio (no el logo de neurai.dev).
export async function GET(request, { params }) {
  const { slug, id } = await params;
  const datos = await getPlato(slug, id).catch(() => null);
  const negocio = datos?.negocio;
  const plato = datos?.plato;
  const primario = negocio?.tema?.colorPrimario || "#e11d48";
  const foto = fotoCompatible(plato?.foto_url);

  return new ImageResponse(
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
    { width: ANCHO, height: ALTO, headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
  );
}
