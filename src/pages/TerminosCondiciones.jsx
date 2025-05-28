import React, { useEffect, useState } from "react";
import RootLayout from "../app/layout";

export default function TerminosCondiciones() {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Términos y Condiciones
            </h1>
            {/* <p className="text-gray-600 text-lg">
              Última actualización: {new Date().toLocaleDateString("es-CO")}
            </p> */}
          </div>

          {/* Introducción */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bienvenid@ a nuestra tienda online. Al acceder y utilizar este
              sitio web, usted acepta cumplir con estos términos y condiciones
              de uso. Si no está de acuerdo con alguno de estos términos, le
              recomendamos no utilizar nuestros servicios.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Somos una pequeña y mediana empresa colombiana dedicada a la venta
              de accesorios para celulares, computadores, libros y objetos
              varios a través de nuestra plataforma digital.
            </p>
          </section>

          {/* Términos Comerciales */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Términos Comerciales
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  2.1 Precios y Disponibilidad
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Los precios mostrados en el sitio web incluyen IVA cuando
                  aplique. Nos reservamos el derecho de modificar precios sin
                  previo aviso. La disponibilidad de productos está sujeta a
                  existencias.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  2.2 Proceso de Compra
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Al realizar un pedido, usted hace una oferta de compra. Nos
                  reservamos el derecho de aceptar o rechazar cualquier pedido.
                  La confirmación de su pedido se enviará por Whatsapp o correo
                  electrónico, según la preferencia del cliente.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  2.3 Métodos de Pago
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Aceptamos pagos con tarjetas de crédito, débito,
                  transferencias bancarias y plataformas de pago digital
                  dirigidas a la cuenta Nequi. El pago debe completarse antes
                  del envío del producto.
                </p>
              </div>
            </div>
          </section>

          {/* Envíos y Entregas */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Envíos y Entregas
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  3.1 Cobertura
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Realizamos envíos a nivel nacional en Colombia o hasta donde
                  tenga cobertura la transportadora Interrapidísimo. Los tiempos
                  de entrega varían según la ubicación.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  3.2 Costos de Envío
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Los costos de envío se calculan según el peso y el destino.
                  Por el momento NO se ofrece envío gratuito.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  3.3 Responsabilidad en Transporte
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Una vez el producto sea entregado a la empresa de transporte,
                  la responsabilidad del estado del producto, es por parte de la
                  transportadora.
                </p>
              </div>
            </div>
          </section>

          {/* Devoluciones y Garantías */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Devoluciones y Garantías
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  4.1 Política de Devoluciones
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Aceptamos devoluciones dentro de los 15 días posteriores a la
                  entrega, siempre que el producto esté en condiciones
                  originales, sin uso y con empaques originales.
                  <span>El cliente asume los costos de devolución.</span>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  4.2 Garantías
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Los productos electrónicos cuentan con garantía de un mes de
                  uso.{" "}
                  <span>Los libros y objetos varios NO tienen garantía.</span>
                  La garantía no cubre daños por mal uso.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  4.3 Reembolsos
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Los reembolsos se procesarán dentro de 5-10 días hábiles
                  después de recibir y verificar el producto devuelto,
                  utilizando el mismo método de pago original o transferencia
                  por Nequi.
                </p>
              </div>
            </div>
          </section>

          {/* Protección de Datos */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Protección de Datos Personales
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  5.1 Recolección de Información
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Recolectamos información personal necesaria para procesar
                  pedidos: nombre, dirección, teléfono, correo electrónico y
                  datos de facturación.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  5.2 Uso de Datos
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos sus datos para procesar pedidos, realizar entregas,
                  brindar soporte al cliente y enviar información promocional
                  (solo con su consentimiento).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  5.3 Derechos del Usuario
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Usted tiene derecho a conocer, actualizar, rectificar y
                  suprimir sus datos personales. Para ejercer estos derechos,
                  contacte a julii1295@gmail.com.
                </p>
              </div>
            </div>
          </section>

          {/* Responsabilidades y Limitaciones */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Responsabilidades y Limitaciones
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  6.1 Uso Correcto
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  El cliente debe usar los productos de acuerdo con las
                  instrucciones del fabricante y para los fines previstos. El
                  mal uso anula la garantía.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  6.2 Limitación de Responsabilidad
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Nuestra responsabilidad se limita al valor del producto
                  adquirido. No nos hacemos responsables por daños indirectos,
                  pérdida de datos o lucro cesante.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  6.3 Fuerza Mayor
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  No seremos responsables por retrasos o incumplimientos
                  causados por situaciones de fuerza mayor, incluyendo desastres
                  naturales, huelgas o restricciones gubernamentales.
                </p>
              </div>
            </div>
          </section>

          {/* Aspectos Legales */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Aspectos Legales
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  7.1 Modificaciones
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos y
                  condiciones en cualquier momento. Las modificaciones entrarán
                  en vigor inmediatamente después de su publicación en el sitio
                  web.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  7.2 Contacto
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Para cualquier consulta sobre estos términos y condiciones,
                  puede contactarnos a través de:
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-gray-700">📧 Email: julii1295@gmail.com</p>
                  <p className="text-gray-700">📞 Teléfono: +57 317 450 3604</p>
                  <p className="text-gray-700">
                    📍 Dirección: Calle 1A # 6 - 7, Colón - Putumayo
                  </p>
                  <p className="text-gray-700">🆔 NIT: 1124315657-2</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t pt-8 mt-12">
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Al continuar utilizando nuestros servicios, usted acepta estos
                términos y condiciones.
              </p>
              {/* <p className="text-gray-500 text-xs mt-2">
                Documento generado automáticamente - Válido desde{" "}
                {new Date().toLocaleDateString("es-CO")}
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
