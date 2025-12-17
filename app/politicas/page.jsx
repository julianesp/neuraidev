"use client";

import React from "react";

export default function PoliticasPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Fondo con backdrop-filter */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-50/15 to-pink-100/20 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-pink-900/20"></div>
      <div className="absolute inset-0 backdrop-blur-[1px] bg-white/5 dark:bg-black/10"></div>
      
      {/* Contenido */}
      <div className="max-w-4xl mx-auto bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-8 relative z-10 border border-white/20 dark:border-gray-700/30">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Políticas y privacidad
          </h1>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Introducción
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Bienvenido a nuestra página de políticas y privacidad. Aquí
              encontrará información sobre cómo manejamos sus datos personales.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              En neurai.dev, respetamos su privacidad y nos comprometemos a
              proteger sus datos personales. Esta política de privacidad
              describe cómo recopilamos, utilizamos y protegemos la información
              que nos proporciona cuando utiliza nuestros servicios de formateo
              y mantenimiento de computadores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Utilizamos sus datos personales para:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Prestar los servicios solicitados de mantenimiento y formateo</li>
              <li>Comunicarnos con usted sobre su servicio</li>
              <li>Enviar presupuestos y facturas</li>
              <li>Proporcionar soporte técnico</li>
              <li>Mejorar nuestros servicios</li>
              <li>Enviar información sobre promociones (solo con su consentimiento)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Acceso a sus datos personales
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Durante el servicio técnico, nuestros técnicos podrían tener
              acceso a archivos almacenados en su equipo. Este acceso se limita
              estrictamente a las operaciones necesarias para realizar el
              servicio solicitado. No accedemos, copiamos ni conservamos sus
              archivos personales sin su autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Protección de datos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Implementamos medidas de seguridad adecuadas para proteger sus
              datos contra pérdida, acceso no autorizado, divulgación o
              alteración. Estas medidas incluyen:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Acceso restringido a la información por parte de nuestro personal</li>
              <li>Acuerdos de confidencialidad con nuestros técnicos</li>
              <li>Capacitación del personal en protección de datos</li>
              <li>Copias de seguridad periódicas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Conservación de datos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Conservamos sus datos personales solo durante el tiempo necesario
              para los fines para los que fueron recopilados, incluyendo el
              cumplimiento de requisitos legales, contables o de informes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Sus derechos sobre sus datos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              De acuerdo con las regulaciones de protección de datos, usted tiene
              los siguientes derechos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Derecho de acceso:</strong> Puede solicitar una copia de
                los datos personales que tenemos sobre usted
              </li>
              <li>
                <strong>Derecho de rectificación:</strong> Puede solicitar que
                corrijamos datos inexactos o incompletos
              </li>
              <li>
                <strong>Derecho de eliminación:</strong> Puede solicitar que
                eliminemos sus datos personales
              </li>
              <li>
                <strong>Derecho de portabilidad:</strong> Puede solicitar una
                copia de sus datos en formato estructurado
              </li>
              <li>
                <strong>Derecho de oposición:</strong> Puede oponerse al
                procesamiento de sus datos para ciertos fines
              </li>
            </ul>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-900 dark:text-blue-100 mb-2">
                <strong>¿Desea eliminar sus datos?</strong>
              </p>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                Si desea ejercer su derecho de eliminación, puede hacerlo a
                través de nuestro formulario oficial:
              </p>
              <a
                href="/eliminar-datos"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
              >
                Solicitar eliminación de datos
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Contacto
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Si tiene alguna pregunta sobre nuestras políticas de privacidad,
              no dude en contactarnos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}