import React from "react";

export const metadata = {
  title: "Política de Privacidad | Neurai.dev",
  description: "Política de privacidad y protección de datos de Neurai.dev. Conoce cómo recopilamos, usamos y protegemos tu información personal.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CO')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              En Neurai.dev, respetamos su privacidad y nos comprometemos a proteger sus datos personales.
              Esta política de privacidad le informará sobre cómo cuidamos sus datos personales cuando visita
              nuestro sitio web y le informará sobre sus derechos de privacidad y cómo la ley lo protege.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Neurai.dev es una tienda online de tecnología, accesorios y servicios profesionales ubicada en
              Colombia. Operamos el sitio web www.neurai.dev.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Información que Recopilamos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales sobre usted,
              que hemos agrupado de la siguiente manera:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li><strong>Datos de identidad:</strong> nombre, apellidos, nombre de usuario o identificador similar.</li>
              <li><strong>Datos de contacto:</strong> dirección de correo electrónico, número de teléfono, dirección de facturación y entrega.</li>
              <li><strong>Datos técnicos:</strong> dirección de protocolo de Internet (IP), datos de inicio de sesión, tipo y versión del navegador, configuración de zona horaria y ubicación, tipos y versiones de complementos del navegador, sistema operativo y plataforma.</li>
              <li><strong>Datos de perfil:</strong> nombre de usuario y contraseña, compras o pedidos realizados por usted, sus intereses, preferencias, comentarios y respuestas a encuestas.</li>
              <li><strong>Datos de uso:</strong> información sobre cómo utiliza nuestro sitio web, productos y servicios.</li>
              <li><strong>Datos de marketing y comunicaciones:</strong> sus preferencias para recibir marketing nuestro y de terceros, y sus preferencias de comunicación.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Cómo Usamos su Información
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Utilizamos su información personal para los siguientes propósitos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Procesar y entregar sus pedidos</li>
              <li>Gestionar su cuenta y proporcionarle atención al cliente</li>
              <li>Personalizar su experiencia en nuestro sitio web</li>
              <li>Mejorar nuestro sitio web, productos y servicios</li>
              <li>Enviarle correos electrónicos periódicos sobre su pedido o productos y servicios</li>
              <li>Detectar y prevenir fraudes</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Cookies y Tecnologías Similares
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro
              sitio web y mantener cierta información. Las cookies son archivos con una pequeña cantidad de datos
              que pueden incluir un identificador único anónimo.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Recordar sus preferencias y configuraciones</li>
              <li>Entender cómo utiliza nuestro sitio web</li>
              <li>Mejorar su experiencia de navegación</li>
              <li>Mostrar anuncios relevantes</li>
              <li>Analizar el tráfico del sitio web con Google Analytics</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Para más información sobre nuestro uso de cookies, consulte nuestra{" "}
              <a href="/politica-cookies" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Política de Cookies
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Compartir su Información
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              No vendemos, comercializamos ni transferimos de ninguna otra forma sus datos personales identificables
              a terceros. Esto no incluye a terceros de confianza que nos ayudan a operar nuestro sitio web,
              realizar nuestro negocio o brindarle servicios, siempre que esas partes acepten mantener esta información confidencial.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Podemos compartir su información con:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>Proveedores de servicios de pago para procesar transacciones</li>
              <li>Empresas de mensajería para entregar sus pedidos</li>
              <li>Proveedores de servicios de análisis (como Google Analytics)</li>
              <li>Autoridades legales cuando sea requerido por ley</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Seguridad de Datos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Hemos implementado medidas de seguridad apropiadas para evitar que sus datos personales se pierdan
              accidentalmente, se usen o se acceda a ellos de manera no autorizada, se alteren o se divulguen.
              Además, limitamos el acceso a sus datos personales a aquellos empleados, agentes, contratistas y
              otros terceros que tienen una necesidad comercial de conocerlos.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Sin embargo, tenga en cuenta que ningún método de transmisión por Internet o método de almacenamiento
              electrónico es 100% seguro. Si bien nos esforzamos por utilizar medios comercialmente aceptables para
              proteger sus datos personales, no podemos garantizar su seguridad absoluta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Sus Derechos Legales
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              De acuerdo con la legislación colombiana de protección de datos (Ley 1581 de 2012), usted tiene los siguientes derechos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li><strong>Derecho de acceso:</strong> Puede solicitar copias de sus datos personales.</li>
              <li><strong>Derecho de rectificación:</strong> Puede solicitar que corrijamos cualquier información que crea que es inexacta.</li>
              <li><strong>Derecho de supresión:</strong> Puede solicitar que eliminemos sus datos personales en ciertas condiciones.</li>
              <li><strong>Derecho a restringir el procesamiento:</strong> Puede solicitar que restrinjamos el procesamiento de sus datos personales.</li>
              <li><strong>Derecho a oponerse al procesamiento:</strong> Puede oponerse a nuestro procesamiento de sus datos personales.</li>
              <li><strong>Derecho a la portabilidad de datos:</strong> Puede solicitar que transfiramos los datos que hemos recopilado a otra organización.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Retención de Datos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Conservaremos sus datos personales solo durante el tiempo que sea necesario para los fines establecidos
              en esta política de privacidad. Conservaremos y utilizaremos sus datos personales en la medida necesaria
              para cumplir con nuestras obligaciones legales, resolver disputas y hacer cumplir nuestras políticas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Enlaces a Otros Sitios Web
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Nuestro sitio web puede contener enlaces a otros sitios web que no son operados por nosotros.
              Si hace clic en un enlace de terceros, será dirigido al sitio de ese tercero. Le recomendamos
              encarecidamente que revise la política de privacidad de cada sitio que visite.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Privacidad de los Niños
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Nuestro servicio no está dirigido a ninguna persona menor de 18 años. No recopilamos conscientemente
              información personal identificable de nadie menor de 18 años. Si es padre o tutor y sabe que su hijo
              nos ha proporcionado datos personales, contáctenos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Cambios a Esta Política de Privacidad
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Podemos actualizar nuestra política de privacidad de vez en cuando. Le notificaremos cualquier cambio
              publicando la nueva política de privacidad en esta página y actualizando la fecha de &quot;última actualización&quot;.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Le recomendamos que revise esta política de privacidad periódicamente para conocer cualquier cambio.
              Los cambios a esta política de privacidad son efectivos cuando se publican en esta página.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Contáctenos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si tiene alguna pregunta sobre esta política de privacidad o sobre cómo manejamos sus datos personales,
              no dude en contactarnos:
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
