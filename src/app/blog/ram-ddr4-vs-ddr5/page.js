import React from "react";
import Link from "next/link";

export const metadata = {
  title: "RAM DDR4 vs DDR5: ¿Vale la Pena el Upgrade en 2025? | Neurai.dev",
  description: "Comparativa completa entre memoria RAM DDR4 y DDR5. Diferencias de velocidad, compatibilidad, precios y si realmente vale la pena actualizar en 2025.",
  keywords: "RAM DDR4, DDR5, memoria RAM, upgrade PC, Colombia",
};

export default function RAMDDR4vsDDR5() {
  return (
    <article className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Inicio</Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Blog</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-600 dark:text-gray-400">RAM DDR4 vs DDR5</span>
        </nav>

        <header className="mb-8">
          <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Hardware
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            RAM DDR4 vs DDR5: ¿Vale la Pena el Upgrade en 2025?
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm space-x-4">
            <time dateTime="2025-01-08">8 de enero de 2025</time>
            <span>•</span>
            <span>6 min de lectura</span>
          </div>
        </header>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg h-96 flex items-center justify-center text-white text-6xl mb-8">
          🧠
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <p className="text-xl mb-6">
            La memoria RAM DDR5 llegó al mercado prometiendo revolucionar el rendimiento de las PCs.
            ¿Pero realmente vale la pena en 2025? En esta guía te explicamos las diferencias, ventajas
            y si deberías actualizar desde DDR4.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded mb-8">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 Respuesta Rápida
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-0">
              <strong>Para la mayoría de usuarios en 2025: DDR4 sigue siendo excelente.</strong> DDR5
              es más rápido, pero la diferencia en uso real es mínima. Solo considera DDR5 si estás
              armando un PC nuevo de gama alta o trabajas con cargas muy pesadas.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Diferencias Técnicas Principales
          </h2>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white dark:bg-gray-800 border">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-900 dark:text-white">Característica</th>
                  <th className="px-6 py-3 text-left text-purple-700 dark:text-purple-300">DDR4</th>
                  <th className="px-6 py-3 text-left text-indigo-700 dark:text-indigo-300">DDR5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 font-semibold">Velocidad Base</td>
                  <td className="px-6 py-4">2133 - 3200 MHz</td>
                  <td className="px-6 py-4">4800 - 8400 MHz</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="px-6 py-4 font-semibold">Voltaje</td>
                  <td className="px-6 py-4">1.2V</td>
                  <td className="px-6 py-4">1.1V (más eficiente)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold">Canales por módulo</td>
                  <td className="px-6 py-4">1 canal</td>
                  <td className="px-6 py-4">2 canales</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="px-6 py-4 font-semibold">Capacidad máxima/módulo</td>
                  <td className="px-6 py-4">32GB</td>
                  <td className="px-6 py-4">128GB</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold">Precio (16GB)</td>
                  <td className="px-6 py-4">$180.000 - $250.000 COP</td>
                  <td className="px-6 py-4">$350.000 - $550.000 COP</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="px-6 py-4 font-semibold">Año de lanzamiento</td>
                  <td className="px-6 py-4">2014</td>
                  <td className="px-6 py-4">2021</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Ventajas de DDR5
          </h2>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-8">
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-3">✅</span>
                <div>
                  <strong className="text-green-900 dark:text-green-300">Mayor Velocidad:</strong>
                  <p className="text-green-800 dark:text-green-200">Hasta 2x más rápido que DDR4 en transferencias de datos</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-3">✅</span>
                <div>
                  <strong className="text-green-900 dark:text-green-300">Más Eficiente:</strong>
                  <p className="text-green-800 dark:text-green-200">Menor voltaje = menos consumo energético y calor</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-3">✅</span>
                <div>
                  <strong className="text-green-900 dark:text-green-300">Capacidades Mayores:</strong>
                  <p className="text-green-800 dark:text-green-200">Módulos hasta 128GB (vs 32GB de DDR4)</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 dark:text-green-400 mr-3">✅</span>
                <div>
                  <strong className="text-green-900 dark:text-green-300">Futuro-proof:</strong>
                  <p className="text-green-800 dark:text-green-200">Tecnología más reciente con mayor recorrido</p>
                </div>
              </li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Desventajas de DDR5
          </h2>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg mb-8">
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-red-600 dark:text-red-400 mr-3">❌</span>
                <div>
                  <strong className="text-red-900 dark:text-red-300">Mucho Más Caro:</strong>
                  <p className="text-red-800 dark:text-red-200">Casi el doble de precio que DDR4 equivalente</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 dark:text-red-400 mr-3">❌</span>
                <div>
                  <strong className="text-red-900 dark:text-red-300">Requiere Hardware Nuevo:</strong>
                  <p className="text-red-800 dark:text-red-200">Solo compatible con motherboards nuevas (Intel 12th gen+, AMD Ryzen 7000+)</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 dark:text-red-400 mr-3">❌</span>
                <div>
                  <strong className="text-red-900 dark:text-red-300">Latencias Mayores:</strong>
                  <p className="text-red-800 dark:text-red-200">Aunque más rápido, tiene mayor latencia inicial que DDR4 tuneado</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 dark:text-red-400 mr-3">❌</span>
                <div>
                  <strong className="text-red-900 dark:text-red-300">Beneficios Limitados:</strong>
                  <p className="text-red-800 dark:text-red-200">En uso real (gaming, ofimática), la diferencia con DDR4 es mínima</p>
                </div>
              </li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Rendimiento en el Mundo Real
          </h2>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Gaming:
          </h3>
          <p className="mb-4">
            En juegos, DDR5 ofrece entre 0-5% más FPS comparado con DDR4 rápido. La diferencia es
            imperceptible. Tu GPU es el cuello de botella, no la RAM.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ejemplo (1080p Ultra):</p>
            <p>• DDR4-3200: 165 FPS promedio</p>
            <p>• DDR5-6000: 170 FPS promedio</p>
            <p className="text-blue-600 dark:text-blue-400 mt-2">Diferencia: 3% (imperceptible)</p>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Productividad (Ofimática, Navegación):
          </h3>
          <p className="mb-4">
            Para uso general, DDR4 y DDR5 son indistinguibles. El SSD es mucho más importante
            para la velocidad percibida.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Trabajo Profesional (Edición de Video, 3D, Desarrollo):
          </h3>
          <p className="mb-6">
            Aquí DDR5 sí muestra ventajas: 10-15% más rápido en renderizado y compilación. Si trabajas
            con archivos enormes, DDR5 vale la pena.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            ¿Cuándo Vale la Pena DDR5?
          </h2>

          <div className="space-y-6 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-l-4 border-green-500">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-3">
                ✅ SÍ Considera DDR5 Si:
              </h3>
              <ul className="space-y-2 text-green-800 dark:text-green-200">
                <li>• Estás armando un PC nuevo de gama alta (presupuesto $4M+)</li>
                <li>• Compras procesador Intel 13th/14th gen o AMD Ryzen 7000</li>
                <li>• Trabajas con edición de video 4K/8K profesional</li>
                <li>• Haces renderizado 3D, simulaciones, o compilación de código</li>
                <li>• Quieres futuro-proof por 5+ años</li>
                <li>• El precio no es problema</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-3">
                ✋ Quédate con DDR4 Si:
              </h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                <li>• Tu PC actual usa DDR4 (no es compatible upgrade)</li>
                <li>• Presupuesto limitado o medio ($1M-$3M)</li>
                <li>• Usas la PC principalmente para gaming</li>
                <li>• Uso general: ofimática, navegación, multimedia</li>
                <li>• Cada peso cuenta en tu build</li>
              </ul>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Recomendaciones por Caso de Uso
          </h2>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">🎮 Gamer</h3>
              <p className="mb-2"><strong>Recomendación:</strong> DDR4 3200-3600 MHz, 16GB (2x8GB)</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                La diferencia en FPS es mínima. Mejor invierte ese dinero extra en una GPU más potente.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">💼 Oficina / Estudiante</h3>
              <p className="mb-2"><strong>Recomendación:</strong> DDR4 2666-3200 MHz, 8-16GB</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Para tareas básicas, DDR4 es más que suficiente y mucho más económico.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">🎬 Creador de Contenido</h3>
              <p className="mb-2"><strong>Recomendación:</strong> DDR5 5600+ MHz, 32GB (2x16GB)</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Si trabajas profesionalmente con video/3D, el boost de velocidad sí vale la inversión.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">💻 Programador</h3>
              <p className="mb-2"><strong>Recomendación:</strong> DDR4 3200 MHz, 16-32GB</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A menos que compiles proyectos enormes, DDR4 es perfecto. Prioriza más GB sobre velocidad.
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Compatibilidad: ¿Puedo Usar DDR5 en Mi PC?
          </h2>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded mb-8">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-3">
              ⚠️ IMPORTANTE: DDR4 y DDR5 NO son compatibles entre sí
            </h3>
            <p className="text-yellow-800 dark:text-yellow-200 mb-4">
              Las motherboards están diseñadas para uno u otro. No puedes poner DDR5 en una placa DDR4.
              Los slots físicos son diferentes para prevenir errores.
            </p>
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Procesadores compatibles con DDR5:</strong>
            </p>
            <ul className="list-disc pl-6 text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
              <li>Intel: 12th gen (Alder Lake) en adelante</li>
              <li>AMD: Ryzen 7000 series (AM5) en adelante</li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Precios en Colombia (2025)
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-300 mb-4">DDR4</h3>
              <ul className="space-y-2 text-purple-800 dark:text-purple-200">
                <li>• 8GB (1x8GB): $90.000 - $120.000</li>
                <li>• 16GB (2x8GB): $180.000 - $250.000</li>
                <li>• 32GB (2x16GB): $350.000 - $480.000</li>
              </ul>
              <p className="mt-4 text-sm text-purple-600 dark:text-purple-400">
                Excelente relación precio-rendimiento
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-4">DDR5</h3>
              <ul className="space-y-2 text-indigo-800 dark:text-indigo-200">
                <li>• 16GB (2x8GB): $350.000 - $480.000</li>
                <li>• 32GB (2x16GB): $650.000 - $900.000</li>
                <li>• 64GB (2x32GB): $1.400.000+</li>
              </ul>
              <p className="mt-4 text-sm text-indigo-600 dark:text-indigo-400">
                Premium price, tecnología reciente
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Conclusión
          </h2>

          <p className="mb-4">
            <strong>En 2025, DDR4 sigue siendo la opción inteligente para la mayoría.</strong> Es
            maduro, estable, económico y suficientemente rápido para casi todo.
          </p>

          <p className="mb-4">
            DDR5 es el futuro y eventualmente será estándar, pero a principios de 2025 aún está en
            su fase de adopción temprana. Los precios son altos y los beneficios en uso real son limitados.
          </p>

          <p className="mb-6">
            <strong>Mi recomendación:</strong> Si estás actualizando un PC existente, DDR4 es lo tuyo.
            Si estás armando un nuevo build de gama alta con procesador de última generación, entonces
            considera DDR5. Para todo lo demás, ahorra el dinero e invierte en un mejor CPU, GPU o SSD.
          </p>

          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 rounded-lg text-white mt-12">
            <h3 className="text-2xl font-bold mb-4">¿Necesitas RAM para tu PC?</h3>
            <p className="mb-6 text-lg">
              En Neurai.dev tenemos memoria RAM DDR4 de calidad marca Puskill. También te asesoramos
              sobre cuál es la mejor opción para tu caso específico.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/accesorios/computadoras"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Ver Memorias RAM
              </Link>
              <a
                href="https://wa.me/573174503604?text=Hola, necesito asesoría sobre RAM"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-block"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
