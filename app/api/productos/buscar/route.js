import { NextResponse } from "next/server";
import { d1Select, d1SelectOne } from "@/lib/db-d1";
import { buildProductUrl, generateProductSlug } from "@/utils/slugify";

export const dynamic = "force-dynamic";

// Las descripciones se guardan con HTML del editor (<ul><li><p>…, &amp;):
// para el buscador se muestran como texto plano.
const ENTIDADES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function textoPlano(html) {
  return String(html || "")
    .replace(/<(br|\/p|\/li|\/h\d|\/div)[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => {
      if (e[0] === "#") {
        const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : m;
      }
      return ENTIDADES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();
}

// GET /api/productos/buscar?q=mouse — búsqueda pública del catálogo real (D1)
// para el buscador del home. Devuelve hasta 20 productos disponibles + el total,
// con el enlace armado igual que en el resto del sitio (/accesorios/<cat>/<slug>).
export async function GET(request) {
  try {
    const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 60);
    if (q.length < 2) return NextResponse.json({ productos: [], total: 0 });

    // % y _ son comodines de LIKE: se escapan para buscar el texto tal cual.
    const patron = `%${q.toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    const where = `disponible = 1 AND (
      LOWER(nombre) LIKE ? ESCAPE '\\' OR LOWER(descripcion) LIKE ? ESCAPE '\\'
      OR LOWER(categoria) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(marca, '')) LIKE ? ESCAPE '\\')`;
    const params = [patron, patron, patron, patron];

    const [filas, conteo] = await Promise.all([
      d1Select(
        `SELECT id, nombre, descripcion, precio, precio_oferta, categoria, imagen_principal, imagenes
         FROM products WHERE ${where}
         -- Primero los que coinciden en el nombre
         ORDER BY (LOWER(nombre) LIKE ? ESCAPE '\\') DESC, COALESCE(created_at, '') DESC
         LIMIT 20`,
        [...params, patron]
      ),
      d1SelectOne(`SELECT COUNT(*) AS n FROM products WHERE ${where}`, params),
    ]);

    const productos = filas.map((p) => {
      let imagenes = p.imagenes;
      if (typeof imagenes === "string") {
        try {
          imagenes = JSON.parse(imagenes);
        } catch {
          imagenes = [];
        }
      }
      const primera = Array.isArray(imagenes) ? imagenes[0] : null;
      return {
        id: p.id,
        nombre: p.nombre,
        descripcion: textoPlano(p.descripcion).slice(0, 160),
        precio: p.precio_oferta || p.precio,
        categoria: p.categoria,
        imagen: p.imagen_principal || (typeof primera === "string" ? primera : primera?.url) || null,
        href: buildProductUrl(p.categoria, generateProductSlug(p), p),
      };
    });

    return NextResponse.json(
      { productos, total: conteo?.n ?? productos.length },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("[productos/buscar]", error);
    return NextResponse.json({ productos: [], total: 0, error: "Error buscando" }, { status: 500 });
  }
}
