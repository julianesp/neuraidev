import React from "react";

export const metadata = {
  title: "Términos y Condiciones | Neurai.dev",
  description: "Términos y condiciones de uso del sitio web Neurai.dev. Lee nuestros términos antes de realizar compras o utilizar nuestros servicios.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TerminosCondiciones() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Términos y Condiciones
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CO')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bienvenido a Neurai.dev. Al acceder y utilizar este sitio web, usted acepta cumplir con estos
              términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos,
              no debe utilizar nuestro sitio web.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Es su responsabilidad
              revisar estos términos periódicamente. El uso continuado del sitio web después de la publicación
              de cambios constituye su aceptación de dichos cambios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Neurai.dev es una plataforma de comercio electrónico que ofrece:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Venta de productos tecnológicos (celulares, computadores, accesorios)</li>
              <li>Venta de libros nuevos y usados</li>
              <li>Productos para damas</li>
              <li>Artículos generales</li>
              <li>Servicios profesionales (desarrollo web, soporte técnico, servicios contables, transporte)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Operamos en Colombia y realizamos envíos a nivel nacional.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Registro y Cuenta de Usuario
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Para realizar compras o contratar servicios en nuestro sitio web, es posible que deba crear una cuenta.
              Al crear una cuenta, usted se compromete a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Proporcionar información precisa, actual y completa</li>
              <li>Mantener y actualizar su información para que siga siendo precisa, actual y completa</li>
              <li>Mantener la seguridad de su contraseña y cuenta</li>
              <li>Notificarnos inmediatamente de cualquier uso no autorizado de su cuenta</li>
              <li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Nos reservamos el derecho de suspender o terminar su cuenta si sospechamos que la información
              proporcionada es falsa, inexacta o incompleta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Productos y Servicios
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4.1 Descripción de Productos
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Hacemos todo lo posible para mostrar con precisión los colores, características, especificaciones
              y detalles de los productos disponibles en nuestro sitio web. Sin embargo, no garantizamos que
              las descripciones, colores u otro contenido sean precisos, completos, confiables, actuales o libres de errores.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4.2 Disponibilidad
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Todos los productos están sujetos a disponibilidad. Nos reservamos el derecho de descontinuar
              cualquier producto en cualquier momento. En caso de que un producto no esté disponible después
              de haber realizado un pedido, le notificaremos y le ofreceremos un reembolso completo.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4.3 Precios
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Todos los precios están expresados en Pesos Colombianos (COP) e incluyen IVA cuando aplique.
              Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso.
              Los precios aplicables serán aquellos vigentes en el momento de realizar el pedido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Proceso de Compra y Pago
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5.1 Realización de Pedidos
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Al realizar un pedido, usted hace una oferta para comprar el producto o servicio. Todos los pedidos
              están sujetos a aceptación por nuestra parte. Podemos rechazar cualquier pedido por cualquier motivo,
              incluyendo pero no limitado a: disponibilidad del producto, errores en la descripción o precio del producto,
              o problemas identificados por nuestro departamento de prevención de fraude.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5.2 Métodos de Pago
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Aceptamos los siguientes métodos de pago:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Tarjetas de crédito y débito</li>
              <li>Transferencias bancarias</li>
              <li>Pago contra entrega (según disponibilidad en su zona)</li>
              <li>Otros métodos de pago disponibles en la plataforma</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5.3 Confirmación de Pedido
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Recibirá un correo electrónico de confirmación después de realizar su pedido. Esta confirmación
              no significa que su pedido haya sido aceptado. Su pedido constituye una oferta para comprar el producto.
              Todos los pedidos están sujetos a nuestra aceptación, la cual se le comunicará mediante un correo
              electrónico de confirmación de envío.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Envíos y Entregas
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6.1 Áreas de Envío
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Realizamos envíos a todas las ciudades principales de Colombia. Los tiempos de entrega pueden
              variar según la ubicación y el método de envío seleccionado.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6.2 Costos de Envío
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Los costos de envío se calcularán y mostrarán durante el proceso de compra antes de completar su pedido.
              Los costos pueden variar según el peso, tamaño y destino del envío.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6.3 Tiempos de Entrega
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Los tiempos de entrega son estimados y pueden variar debido a circunstancias fuera de nuestro control.
              No somos responsables de retrasos en la entrega causados por la empresa de mensajería, condiciones
              climáticas, huelgas u otros eventos de fuerza mayor.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6.4 Recepción de Productos
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Al recibir su pedido, debe inspeccionar el paquete inmediatamente. Si nota algún daño en el embalaje
              o en los productos, debe notificarlo a la empresa de mensajería y contactarnos dentro de las 24 horas siguientes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Devoluciones y Reembolsos
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7.1 Política de Devoluciones
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Aceptamos devoluciones dentro de los 5 días calendario posteriores a la recepción del producto,
              siempre que el producto:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Esté en su empaque original sin abrir (para productos nuevos)</li>
              <li>No haya sido usado, dañado o alterado</li>
              <li>Incluya todos los accesorios, manuales y documentación original</li>
              <li>Tenga el comprobante de compra original</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7.2 Productos No Retornables
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Los siguientes productos no pueden ser devueltos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Productos de higiene personal por razones de salud y seguridad</li>
              <li>Productos personalizados o hechos a medida</li>
              <li>Software descargable o productos digitales</li>
              <li>Libros usados (excepto en caso de defecto)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7.3 Proceso de Devolución
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Para iniciar una devolución, debe contactarnos a través de:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Email: info@neurai.dev</li>
              <li>WhatsApp: +57 317 450 3604</li>
              <li>Teléfono: +57 317 450 3604</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7.4 Reembolsos
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Una vez recibida y verificada la devolución, procesaremos su reembolso dentro de los 10 días hábiles.
              El reembolso se realizará al método de pago original utilizado en la compra. Los costos de envío
              originales no son reembolsables, excepto en casos de productos defectuosos o error por nuestra parte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Garantías
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              8.1 Garantía de Productos
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Todos nuestros productos nuevos cuentan con la garantía del fabricante según lo especificado
              en cada producto. Los productos usados pueden tener garantía limitada según se indique en la descripción.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              8.2 Garantía de Servicios
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Nuestros servicios profesionales (desarrollo web, soporte técnico, servicios contables) incluyen
              garantía de calidad según lo acordado en cada contrato de servicio específico.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              8.3 Reclamos de Garantía
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Para hacer válida la garantía, debe presentar el comprobante de compra original y contactarnos
              dentro del período de garantía especificado.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Propiedad Intelectual
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Todo el contenido incluido en este sitio web, como texto, gráficos, logos, iconos de botones,
              imágenes, clips de audio, descargas digitales, compilaciones de datos y software, es propiedad
              de Neurai.dev o de sus proveedores de contenido y está protegido por las leyes de propiedad
              intelectual de Colombia y tratados internacionales.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              No puede reproducir, duplicar, copiar, vender, revender o explotar ninguna parte del sitio web
              sin nuestro permiso expreso por escrito.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Uso Prohibido
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Usted acepta no utilizar el sitio web para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Cualquier propósito ilegal o no autorizado</li>
              <li>Violar leyes locales, estatales, nacionales o internacionales</li>
              <li>Infringir o violar nuestros derechos de propiedad intelectual o los de terceros</li>
              <li>Cargar o transmitir virus o cualquier otro tipo de código malicioso</li>
              <li>Recopilar o rastrear información personal de otros usuarios</li>
              <li>Hacer spam, phishing, pharming, pretexting, spidering, crawling o scraping</li>
              <li>Interferir con o burlar las funciones de seguridad del sitio web</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              En ningún caso Neurai.dev, sus directores, empleados, socios, agentes, proveedores o afiliados
              serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos,
              incluyendo pero no limitado a pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas
              intangibles, resultantes de:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Su acceso o uso o incapacidad de acceder o usar el servicio</li>
              <li>Cualquier conducta o contenido de terceros en el servicio</li>
              <li>Cualquier contenido obtenido del servicio</li>
              <li>Acceso no autorizado, uso o alteración de sus transmisiones o contenido</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Indemnización
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Usted acepta defender, indemnizar y mantener indemne a Neurai.dev y sus licenciatarios y licenciadores,
              y sus empleados, contratistas, agentes, funcionarios y directores, de y contra cualquier reclamo,
              daños, obligaciones, pérdidas, responsabilidades, costos o deudas, y gastos (incluidos, entre otros,
              honorarios de abogados), resultantes de o que surjan de:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Su uso y acceso al servicio</li>
              <li>Su violación de cualquier término de estos Términos y Condiciones</li>
              <li>Su violación de cualquier derecho de terceros, incluidos, entre otros, cualquier derecho de autor, propiedad o privacidad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Ley Aplicable y Jurisdicción
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de Colombia,
              sin tener en cuenta sus disposiciones sobre conflictos de leyes.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Cualquier disputa que surja de o en relación con estos términos estará sujeta a la jurisdicción
              exclusiva de los tribunales de Colombia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              14. Divisibilidad
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si alguna disposición de estos Términos y Condiciones se considera inválida o inaplicable,
              dicha disposición se eliminará o limitará en la medida mínima necesaria, y las disposiciones
              restantes de estos Términos y Condiciones continuarán en pleno vigor y efecto.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              15. Acuerdo Completo
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Estos Términos y Condiciones, junto con nuestra Política de Privacidad y cualquier otro aviso
              legal publicado por nosotros en el sitio web, constituyen el acuerdo completo entre usted y
              Neurai.dev con respecto al uso del sitio web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              16. Contacto
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Neurai.dev</strong>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Email: info@neurai.dev
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Teléfono: +57 317 450 3604
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp:{" "}
                <a
                  href="https://wa.me/573174503604"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +57 317 450 3604
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Sitio web: www.neurai.dev
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
