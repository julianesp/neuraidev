import { notFound } from "next/navigation";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdminServer } from "@/lib/auth/server-roles";
import {
  getEspecialesVigentes,
  getFastfoodPorSlug,
  getMenu,
  getProductosNeurai,
  negocioPublico,
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
  const completo = await getNegocioVisible(slug);
  if (!completo) notFound();
  // El dueño ve un acceso directo a su panel (si no, no hay cómo volver a editar).
  const { userId } = await auth();
  const esDueno = !!userId && userId === completo.owner_clerk_id;
  // Desde aquí solo datos públicos: el negocio llega al carrito (navegador).
  const negocio = negocioPublico(completo);

  const [menu, especiales, productosNeurai] = await Promise.all([
    getMenu(negocio.id),
    getEspecialesVigentes(negocio.id),
    negocio.plan === "gratis" && negocio.tema.secciones.includes("neurai")
      ? getProductosNeurai(4, negocio.slug)
      : [],
  ]);

  const Plantilla = getPlantilla(negocio.plantilla);

  return (
    <div
      style={variablesTema(negocio.tema)}
      className="min-h-screen bg-[var(--ff-fondo)] text-[var(--ff-texto)]"
    >
      {esDueno && (
        <div className="relative z-10 bg-stone-900 text-white text-sm pt-24 sm:pt-28 pb-3 px-4">
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span>Esta es tu página. Así la ven tus clientes.</span>
            <Link
              href="/mi-negocio"
              className="rounded-full bg-white text-stone-900 font-semibold px-4 py-1.5 hover:bg-stone-200"
            >
              Editar mi negocio
            </Link>
          </div>
        </div>
      )}
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
        esDueno={esDueno}
      />
    </div>
  );
}
