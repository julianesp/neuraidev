import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminServer } from "@/lib/auth/server-roles";
import {
  getEspecialesVigentes,
  getFastfoodPorSlug,
  getMenu,
  getProductosNeurai,
} from "@/lib/fastfoods/data";
import { variablesTema } from "@/lib/fastfoods/utils";
import { getPlantilla } from "@/app/fastfoods/_components/plantillas";
import { getSeccionCustom } from "@/app/fastfoods/_components/custom";

// "Abierto ahora" y el vencimiento del especial dependen de la hora: sin caché.
export const dynamic = "force-dynamic";

/** Publicado → visible para todos. Pendiente/suspendido → solo el admin (vista previa). */
async function getNegocioVisible(slug) {
  const negocio = await getFastfoodPorSlug(slug);
  if (!negocio) return null;
  if (negocio.estado === "publicado") return negocio;
  const user = await currentUser().catch(() => null);
  return user && isAdminServer(user) ? negocio : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const negocio = await getFastfoodPorSlug(slug);
  if (!negocio || negocio.estado !== "publicado") return { title: "Negocio no encontrado" };

  const descripcion =
    negocio.descripcion ||
    `Menú, especial del día y pedidos por WhatsApp de ${negocio.nombre}${
      negocio.ciudad ? ` en ${negocio.ciudad}` : ""
    }.`;
  return {
    title: `${negocio.nombre} | Menú y pedidos`,
    description: descripcion,
    alternates: { canonical: `https://neurai.dev/fastfoods/${negocio.slug}` },
    openGraph: { title: negocio.nombre, description: descripcion, type: "website" },
  };
}

export default async function FastfoodPage({ params }) {
  const { slug } = await params;
  const negocio = await getNegocioVisible(slug);
  if (!negocio) notFound();

  const [menu, especiales, productosNeurai] = await Promise.all([
    getMenu(negocio.id),
    getEspecialesVigentes(negocio.id),
    negocio.plan === "gratis" && negocio.tema.secciones.includes("neurai")
      ? getProductosNeurai(4)
      : [],
  ]);

  const Plantilla = getPlantilla(negocio.plantilla);

  return (
    <div
      style={variablesTema(negocio.tema)}
      className="min-h-screen bg-[var(--ff-fondo)] text-[var(--ff-texto)]"
    >
      {negocio.estado !== "publicado" && (
        <div className="bg-amber-400 text-amber-950 text-center text-sm font-semibold py-2 px-4">
          Vista previa: esta página está «{negocio.estado}» y solo tú (admin) puedes verla.
        </div>
      )}
      <Plantilla
        negocio={negocio}
        menu={menu}
        especiales={especiales}
        productosNeurai={productosNeurai}
        SeccionCustom={getSeccionCustom(negocio.slug)}
      />
    </div>
  );
}
