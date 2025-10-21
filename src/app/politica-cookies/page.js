import React from "react";

export const metadata = {
  title: "Política de Cookies | Neurai.dev",
  description: "Política de cookies de Neurai.dev. Información sobre el uso de cookies y tecnologías similares en nuestro sitio web.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PoliticaCookies() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Política de Cookies
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CO')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. ¿Qué son las Cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (computadora, tablet o móvil)
              cuando visita un sitio web. Las cookies permiten que el sitio web reconozca su dispositivo y almacene
              información sobre sus preferencias o acciones pasadas.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              En Neurai.dev utilizamos cookies y tecnologías similares para mejorar su experiencia de navegación,
              analizar el tráfico del sitio y personalizar el contenido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. ¿Cómo Utilizamos las Cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Utilizamos cookies para los siguientes propósitos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li><strong>Funcionalidad esencial:</strong> Para recordar sus preferencias y mejorar la funcionalidad del sitio</li>
              <li><strong>Análisis:</strong> Para entender cómo los visitantes interactúan con nuestro sitio web</li>
              <li><strong>Personalización:</strong> Para mostrar contenido relevante según sus intereses</li>
              <li><strong>Publicidad:</strong> Para mostrar anuncios relevantes en nuestro sitio y en otros sitios</li>
              <li><strong>Seguridad:</strong> Para proteger su cuenta y detectar actividades fraudulentas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Tipos de Cookies que Utilizamos
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.1 Cookies Estrictamente Necesarias
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Estas cookies son esenciales para que pueda navegar por el sitio web y utilizar sus funciones.
              Sin estas cookies, servicios como el carrito de compras no funcionarían correctamente.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Ejemplos:</strong></p>
              <ul className="list-disc pl-6 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Cookies de sesión de usuario</li>
                <li>Cookies de autenticación</li>
                <li>Cookies del carrito de compras</li>
                <li>Cookies de seguridad</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.2 Cookies de Rendimiento y Análisis
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Estas cookies recopilan información sobre cómo los visitantes utilizan nuestro sitio web,
              como qué páginas visitan con más frecuencia y si reciben mensajes de error. Estas cookies
              no recopilan información que identifique a un visitante.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Ejemplos:</strong></p>
              <ul className="list-disc pl-6 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><strong>Google Analytics:</strong> Analiza el comportamiento de los usuarios en el sitio</li>
                <li><strong>Vercel Analytics:</strong> Recopila métricas de rendimiento del sitio</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.3 Cookies de Funcionalidad
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Estas cookies permiten que el sitio web recuerde las elecciones que hace (como su nombre de usuario,
              idioma o región) y proporcionan características mejoradas y más personales.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Ejemplos:</strong></p>
              <ul className="list-disc pl-6 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Preferencias de tema (modo oscuro/claro)</li>
                <li>Configuración de idioma</li>
                <li>Productos vistos recientemente</li>
                <li>Preferencias de visualización</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.4 Cookies de Publicidad y Marketing
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Estas cookies se utilizan para mostrar anuncios que son relevantes para usted y sus intereses.
              También se utilizan para limitar el número de veces que ve un anuncio y para medir la efectividad
              de las campañas publicitarias.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Ejemplos:</strong></p>
              <ul className="list-disc pl-6 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><strong>Google AdSense:</strong> Muestra anuncios personalizados</li>
                <li><strong>Facebook Pixel:</strong> Rastrea conversiones y remarketing</li>
                <li>Cookies de redes sociales (cuando comparte contenido)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Cookies de Terceros
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Además de nuestras propias cookies, también utilizamos cookies de terceros para informar
              estadísticas de uso del sitio web, entregar anuncios y mejorar su experiencia.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Servicios de Terceros que Utilizamos:
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Google Analytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Analiza cómo los usuarios interactúan con nuestro sitio web.
                </p>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Política de privacidad de Google Analytics →
                </a>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Google AdSense</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Muestra anuncios personalizados basados en sus intereses.
                </p>
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Política de anuncios de Google →
                </a>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vercel Analytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Recopila métricas de rendimiento y análisis web.
                </p>
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Política de privacidad de Vercel →
                </a>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Facebook/Meta</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Utilizado para funciones de redes sociales y publicidad.
                </p>
                <a
                  href="https://www.facebook.com/privacy/policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Política de privacidad de Facebook →
                </a>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. ¿Cómo Puede Controlar las Cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Tiene el derecho de decidir si acepta o rechaza las cookies. Puede ejercer sus derechos de cookies
              configurando sus preferencias en el banner de consentimiento de cookies que aparece cuando visita
              nuestro sitio web por primera vez.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.1 Configuración del Navegador
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              La mayoría de los navegadores web permiten cierto control de las cookies a través de la configuración
              del navegador. Para obtener más información sobre cómo administrar las cookies, visite la sección de
              ayuda de su navegador:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.2 Exclusión de Publicidad Personalizada
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Puede optar por no recibir publicidad personalizada de Google visitando:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Configuración de anuncios de Google
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/settings/ads/plugin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Complemento de exclusión de Google Analytics
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Consecuencias de Desactivar las Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si decide bloquear o eliminar cookies, algunas partes de nuestro sitio web pueden no funcionar
              correctamente. Por ejemplo:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
              <li>No podrá iniciar sesión en su cuenta</li>
              <li>El carrito de compras no funcionará correctamente</li>
              <li>No podremos recordar sus preferencias</li>
              <li>Algunas funciones del sitio pueden no estar disponibles</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Cookies de Sesión vs. Cookies Persistentes
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
              Cookies de Sesión
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Son cookies temporales que se eliminan cuando cierra su navegador. Utilizamos cookies de sesión
              para permitir que nuestro sitio web rastree su movimiento de página en página para que no se le
              solicite la misma información que ya ha proporcionado en el sitio.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
              Cookies Persistentes
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Son cookies que permanecen en su dispositivo durante un período de tiempo establecido o hasta que
              las elimine. Utilizamos cookies persistentes para recordar sus preferencias y configuraciones cuando
              visite nuestro sitio en el futuro.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Actualización de Esta Política
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Podemos actualizar esta Política de Cookies de vez en cuando para reflejar cambios en las cookies
              que utilizamos o por otras razones operativas, legales o regulatorias. Le recomendamos que revise
              esta política periódicamente para mantenerse informado sobre nuestro uso de cookies y tecnologías relacionadas.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              La fecha en la parte superior de esta Política de Cookies indica cuándo se actualizó por última vez.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Más Información
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si tiene preguntas sobre nuestro uso de cookies o esta Política de Cookies, póngase en contacto con nosotros:
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

          <section className="mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                💡 Información Útil
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Para más información sobre cómo protegemos su privacidad, consulte nuestra{" "}
                <a
                  href="/politica-privacidad"
                  className="underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Política de Privacidad
                </a>
                {" "}y nuestros{" "}
                <a
                  href="/terminos-condiciones"
                  className="underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Términos y Condiciones
                </a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
