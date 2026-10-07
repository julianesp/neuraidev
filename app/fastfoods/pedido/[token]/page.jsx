import { notFound } from "next/navigation";
import { getPedidoPorToken } from "@/lib/fastfoods/pedidos";
import { variablesTema } from "@/lib/fastfoods/utils";
import SeguimientoPedido from "@/app/fastfoods/_components/SeguimientoPedido";

export const dynamic = "force-dynamic";

// El enlace es privado (lleva nombre y dirección del cliente): fuera de buscadores.
export const metadata = {
  title: "Tu pedido",
  robots: { index: false, follow: false },
};

export default async function PedidoPage({ params }) {
  const { token } = await params;
  const pedido = await getPedidoPorToken(token);
  if (!pedido) notFound();

  return (
    <div
      style={variablesTema(pedido.tema)}
      className="min-h-screen bg-[var(--ff-fondo)] text-[var(--ff-texto)]"
    >
      <SeguimientoPedido token={token} inicial={pedido} />
    </div>
  );
}
