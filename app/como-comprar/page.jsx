"use client";

import Link from "next/link";
import GuiaCompraEpayco from "@/app/_components/guia-compra/GuiaCompraEpayco";
import FacturaElectronicaAviso from "@/app/_components/guia-compra/FacturaElectronicaAviso";

export default function ComoComprarPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 text-gray-900 dark:text-white">
          Cómo comprar con ePayco
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Así funciona una compra en neurai.dev, desde el carrito hasta la
          factura. Mira el proceso paso a paso o toca un paso para verlo.
        </p>

        <div className="mb-14">
          <GuiaCompraEpayco />
        </div>

        {/* Estados del pago */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Estados que puedes ver en la respuesta de pago
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Aceptada
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                El pago quedó aprobado. Tu pedido se confirma y puedes descargar
                tu factura de compra con el botón “Ver Factura”.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Pendiente
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Común con PSE o Nequi mientras el banco responde. No pagues de
                nuevo: la página se actualiza sola cuando hay respuesta.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Rechazada
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                El banco no aprobó el pago y no se hizo ningún cobro. Puedes
                intentar con otro método.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-12">
          <FacturaElectronicaAviso />
        </div>

        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            ¿Dudas con tu pago? Escríbenos por WhatsApp al{" "}
            <a
              href="https://wa.me/573174503604"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              +57 317 450 3604
            </a>
            .
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/accesorios/generales"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Ver productos
            </Link>
            <Link
              href="/preguntas-frecuentes"
              className="border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-blue-600 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Preguntas frecuentes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
