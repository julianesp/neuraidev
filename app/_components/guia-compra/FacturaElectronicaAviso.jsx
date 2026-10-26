import { Receipt } from "lucide-react";

const WHATSAPP_FACTURA =
  "https://wa.me/573174503604?text=" +
  encodeURIComponent(
    "Hola, hice una compra en neurai.dev y necesito factura electrónica. Mi referencia de pago es: ",
  );

/** La factura electrónica se genera a mano, así que el cliente la pide por WhatsApp. */
export default function FacturaElectronicaAviso() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-blue-400 bg-blue-50 p-5 text-center sm:flex-row sm:text-left dark:border-blue-700 dark:bg-blue-950">
      <Receipt className="h-8 w-8 shrink-0 fill-none text-blue-600 dark:text-blue-400" />
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">
          ¿Necesitas factura electrónica? ¡Pídela!
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Después de pagar puedes descargar tu factura de compra como
          comprobante. Si necesitas factura electrónica, escríbenos con tu
          referencia de pago y te la enviamos.
        </p>
      </div>
      <a
        href={WHATSAPP_FACTURA}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Pedir por WhatsApp
      </a>
    </div>
  );
}
