"use client";

import Image from "next/image";

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Sobre Nosotros
        </h1>

        <div className="grid md:grid-cols-1 gap-8 items-center mb-12">
          {/* <div>
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo.png?alt=media&token=96ed73e2-f6fd-4daf-ad5d-4cb0690aa9fb"
              alt="NeuraI.dev"
              width={400}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div> */}
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
              Historia
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              neurai.dev nace con la misión de ofrecer productos tecnológicos de
              calidad y servicios especializados en el Valle de Sibundoy y sus
              alrededores con un enfoque en la satisfacción del cliente tanto en
              el trabajo como en los precios de nuestros productos.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Somos una tienda local comprometida con brindar las mejores soluciones tecnológicas, desde accesorios para celulares, computadoras y otros dispositivos hasta servicios de desarrollo web y mantenimiento de equipos.
            </p>
          </div>
        </div>

        {/* Misión y Visión */}
        <div className="flex  mb-12">
          <div className="border border-black dark:bg-gray-800 rounded-lg p-8 w-1/2 mr-3">
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
              Misión
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Brindar soluciones tecnológicas accesibles y de calidad, adaptadas
              a las necesidades de nuestros clientes ofreciendo productos y servicios de buena calidad.
            </p>
          </div>

          <div className="border border-black dark:bg-gray-800 rounded-lg p-8 w-1/2">
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
              Visión
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ser la tienda de tecnología de referencia en el Valle de Sibundoy,
              reconocida por su compromiso con la satisfacción del cliente.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
            Nuestros Valores
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Calidad
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Ofrecemos productos y servicios de la más alta calidad
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Innovación
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Siempre a la vanguardia de la tecnología
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Compromiso
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Dedicados a la satisfacción de nuestros clientes
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
            Nuestros Servicios
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                🛍️ Tienda de Accesorios
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Accesorios para celulares, computadoras, productos para damas,
                libros y artículos generales.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                💻 Servicios Técnicos
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Formateo y mantenimiento de computadores, reparaciones y
                asesoría técnica.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                🌐 Desarrollo Web
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Creación de sitios web, tiendas en línea y aplicaciones
                personalizadas.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                📦 Envíos
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Servicio de entrega local y envíos a todo el país.{" "}
                <strong>Envío gratis solo para el Valle de Sibundoy</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
            Ubicación
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Colón - Putumayo
          </p>
          {/* <p className="text-gray-700 dark:text-gray-300 mb-2">
            📞 +57 317 450 3604
          </p> */}
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            📧 julii1295@gmail.com
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            🕒 Lunes a Viernes: 8:00 - 18:00
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            NIT: 1124315657-2
          </p>
        </div>
      </div>
    </div>
  );
}
