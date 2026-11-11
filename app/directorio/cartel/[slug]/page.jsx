import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { nombreCategoria, nombreMunicipio } from "@/lib/directorio/constantes";
import { obtenerPorSlug } from "@/lib/directorio/negocios";
import BotonImprimir from "../../_components/BotonImprimir";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const n = await obtenerPorSlug(slug).catch(() => null);
  return { title: n ? `Cartel QR - ${n.nombre}` : "Cartel", robots: { index: false, follow: false } };
}

// Cartel imprimible (hoja carta/A4) con el QR de la ficha para pegar en el local.
export default async function CartelPage({ params }) {
  const { slug } = await params;
  const n = await obtenerPorSlug(slug).catch(() => null);
  if (!n) notFound();

  const url = `https://neurai.dev/directorio/${n.slug}`;
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    width: 520,
    errorCorrectionLevel: "M",
    color: { dark: "#1d4ed8", light: "#ffffff" },
  });

  return (
    <main className="pb-16 pt-24 print:p-0">
      {/* Al imprimir, el cartel cubre toda la hoja y oculta navbar y footer. */}
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          .cartel-hoja { position: fixed; inset: 0; z-index: 2147483647; margin: 0 !important; max-width: none !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="mx-auto mb-5 flex max-w-xl flex-col items-center gap-3 px-4 text-center print:hidden">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cartel con QR de tu negocio</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Imprímelo y pégalo en tu local o en la vitrina. Quien escanee el QR verá tu ficha: horario, ubicación y
          WhatsApp.
        </p>
        <BotonImprimir />
        <Link href={`/directorio/${n.slug}`} className="text-sm text-blue-600 hover:underline">
          ← Volver a la ficha
        </Link>
      </div>

      <section className="cartel-hoja mx-auto flex aspect-[1/1.414] w-full max-w-xl flex-col items-center justify-between rounded-2xl border-4 border-blue-600 bg-white p-8 text-center shadow-xl">
        <div className="flex w-full flex-col items-center gap-3">
          {n.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={n.logo_url} alt="" className="h-20 w-20 rounded-xl object-cover" />
          )}
          <h2 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">{n.nombre}</h2>
          <p className="text-base text-gray-600">
            {nombreCategoria(n.categoria)} · {nombreMunicipio(n.municipio)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="rounded-full bg-blue-600 px-5 py-1.5 text-lg font-bold text-white">Escanea y contáctanos</p>
          {/* eslint-disable-next-line react/no-danger */}
          <div className="w-64 sm:w-72 [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="text-sm text-gray-600">Horario, ubicación y WhatsApp en un toque</p>
        </div>

        <div className="w-full border-t border-gray-200 pt-3">
          <p className="text-lg font-semibold text-blue-700">neurai.dev/directorio/{n.slug}</p>
          <p className="text-xs text-gray-500">Directorio de negocios del Putumayo</p>
        </div>
      </section>
    </main>
  );
}
