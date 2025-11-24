"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function SobreNosotros() {
  const teamMembers = [
    {
      name: "Equipo Técnico",
      role: "Desarrollo y Soporte",
      description: "Expertos en tecnología y desarrollo de software",
      icon: "💻",
    },
    {
      name: "Área Comercial",
      role: "Atención al Cliente",
      description: "Dedicados a brindar la mejor experiencia de compra",
      icon: "🛍️",
    },
    {
      name: "Logística",
      role: "Envíos y Entregas",
      description: "Garantizamos entregas rápidas y seguras",
      icon: "📦",
    },
  ];

  const values = [
    {
      title: "Calidad",
      description: "Ofrecemos productos y servicios de la más alta calidad",
      icon: "⭐",
    },
    {
      title: "Confiabilidad",
      description: "Somos un socio confiable para nuestros clientes",
      icon: "🤝",
    },
    {
      title: "Innovación",
      description: "Nos mantenemos a la vanguardia de la tecnología",
      icon: "🚀",
    },
    {
      title: "Servicio al Cliente",
      description: "Tu satisfacción es nuestra prioridad número uno",
      icon: "💙",
    },
  ];

  const milestones = [
    {
      year: "2018",
      title: "Inicio de Operaciones",
      description: "Comenzamos como una pequeña tienda de accesorios tecnológicos",
    },
    {
      year: "2020",
      title: "Expansión de Servicios",
      description: "Agregamos servicios de desarrollo web y soporte técnico",
    },
    {
      year: "2022",
      title: "Plataforma Online",
      description: "Lanzamiento de nuestra tienda online www.neurai.dev",
    },
    {
      year: "2024",
      title: "Crecimiento Continuo",
      description: "Más de 1000 clientes satisfechos y servicios ampliados",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Sobre Neurai.dev</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Tu socio confiable en tecnología, accesorios y servicios profesionales en Colombia.
            Más que una tienda, somos una comunidad comprometida con la innovación y la excelencia.
          </p>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Nuestra Historia
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Neurai.dev nació en 2018 con una visión clara: hacer la tecnología accesible para todos
                en Colombia. Lo que comenzó como una pequeña tienda de accesorios tecnológicos ha crecido
                hasta convertirse en una plataforma integral que ofrece productos de calidad y servicios
                profesionales especializados.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Nos especializamos en celulares, computadores, accesorios tecnológicos, libros y productos
                variados. Además, ofrecemos servicios profesionales de desarrollo web, soporte técnico en
                sistemas, servicios contables y de transporte.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Nuestro compromiso es proporcionar productos auténticos, servicios de calidad y un
                servicio al cliente excepcional que supere las expectativas de nuestros clientes.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                ¿Por Qué Elegirnos?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Productos Auténticos</h4>
                    <p className="text-gray-600 dark:text-gray-400">Garantizamos la autenticidad de todos nuestros productos</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Envíos Seguros</h4>
                    <p className="text-gray-600 dark:text-gray-400">Entrega a todo Colombia con seguimiento</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Soporte Técnico</h4>
                    <p className="text-gray-600 dark:text-gray-400">Equipo especializado disponible para ayudarte</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Precios Competitivos</h4>
                    <p className="text-gray-600 dark:text-gray-400">Las mejores ofertas del mercado</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Línea de Tiempo */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Nuestro Camino
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                  {milestone.year}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {milestone.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Nuestros Valores
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Los principios que guían cada decisión que tomamos y cada producto o servicio que ofrecemos
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center hover:transform hover:scale-105 transition-transform"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestro Equipo */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Nuestro Equipo
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Un equipo multidisciplinario comprometido con tu satisfacción
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md text-center"
              >
                <div className="text-6xl mb-4">{member.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Nuestra Misión
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Proporcionar productos tecnológicos de calidad y servicios profesionales excepcionales
                que mejoren la vida de nuestros clientes, combinando innovación, confiabilidad y
                un servicio al cliente inigualable.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔭</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Nuestra Visión
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Ser reconocidos como la plataforma líder de comercio electrónico en Colombia,
                destacándonos por nuestra amplia gama de productos tecnológicos, servicios profesionales
                y un compromiso inquebrantable con la satisfacción del cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">1000+</div>
              <p className="text-xl">Clientes Satisfechos</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <p className="text-xl">Productos Disponibles</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">6+</div>
              <p className="text-xl">Años de Experiencia</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99%</div>
              <p className="text-xl">Tasa de Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Servicios */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            ¿Qué Ofrecemos?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Productos Tecnológicos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Celulares, computadores, accesorios y gadgets de última generación
              </p>
              <Link href="/accesorios" className="text-blue-600 dark:text-blue-400 hover:underline">
                Ver productos →
              </Link>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Desarrollo Web
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sitios web modernos, aplicaciones y soluciones digitales personalizadas
              </p>
              <Link href="/servicios/tecnicos" className="text-blue-600 dark:text-blue-400 hover:underline">
                Ver servicios →
              </Link>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Soporte Técnico
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Mantenimiento, reparación y actualización de equipos
              </p>
              <Link href="/servicios/tecnicos" className="text-blue-600 dark:text-blue-400 hover:underline">
                Más información →
              </Link>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Servicios Contables
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Contabilidad, declaraciones tributarias y asesoría financiera
              </p>
              <Link href="/servicios/contable" className="text-blue-600 dark:text-blue-400 hover:underline">
                Conocer más →
              </Link>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🚛</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Transporte y Logística
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Servicios de mudanzas, transporte de carga y entregas express
              </p>
              <Link href="/servicios/transporte" className="text-blue-600 dark:text-blue-400 hover:underline">
                Solicitar servicio →
              </Link>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Libros y Más
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Libros nuevos y usados, productos para damas y artículos generales
              </p>
              <Link href="/accesorios" className="text-blue-600 dark:text-blue-400 hover:underline">
                Explorar catálogo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            ¿Tienes Preguntas?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Nuestro equipo está listo para ayudarte. Contáctanos por cualquiera de nuestros canales.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="tel:+573174503604"
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Teléfono</h3>
              <p className="text-blue-600 dark:text-blue-400">+57 317 450 3604</p>
            </a>
            <a
              href="https://wa.me/573174503604"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">WhatsApp</h3>
              <p className="text-blue-600 dark:text-blue-400">Enviar mensaje</p>
            </a>
            <a
              href="mailto:info@neurai.dev"
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
              <p className="text-blue-600 dark:text-blue-400">info@neurai.dev</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
