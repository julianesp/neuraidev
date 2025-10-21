import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Mantenimiento de Computadores: Guía Completa 2025 | Neurai.dev",
  description: "Guía completa de mantenimiento preventivo y correctivo para computadores. Aprende a mantener tu PC funcionando como nuevo, mejorar el rendimiento y prolongar su vida útil.",
  keywords: "mantenimiento computador, limpiar PC, optimizar computador, mantenimiento preventivo, Colombia",
};

export default function MantenimientoComputador() {
  return (
    <article className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-800">Inicio</Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">Blog</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-600">Mantenimiento de Computadores</span>
        </nav>

        <header className="mb-8">
          <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Tutoriales
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Mantenimiento de Computadores: Guía Completa 2025
          </h1>
          <div className="flex items-center text-gray-600 text-sm space-x-4">
            <time>12 de enero de 2025</time>
            <span>•</span>
            <span>10 min de lectura</span>
          </div>
        </header>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg h-96 flex items-center justify-center text-white text-6xl mb-8">
          🛠️
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
          <p className="text-xl mb-6">
            Un computador bien mantenido puede durar muchos años funcionando perfectamente. En esta guía completa,
            aprenderás todo sobre mantenimiento preventivo y correctivo para mantener tu PC en óptimas condiciones.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            ¿Por Qué es Importante el Mantenimiento?
          </h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Mejora el rendimiento y velocidad del sistema</li>
            <li>Prolonga la vida útil de los componentes</li>
            <li>Previene fallas y averías costosas</li>
            <li>Reduce el consumo de energía</li>
            <li>Mantiene temperaturas óptimas de funcionamiento</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Mantenimiento Preventivo: Cada 6 Meses
          </h2>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            1. Limpieza Física del Computador
          </h3>
          <p className="mb-4">La acumulación de polvo es el enemigo número uno de tu PC:</p>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3">Herramientas Necesarias:</h4>
            <ul className="list-disc pl-6 text-blue-800 dark:text-blue-200 space-y-1">
              <li>Aire comprimido o sopladora eléctrica</li>
              <li>Destornilladores</li>
              <li>Brocha suave</li>
              <li>Alcohol isopropílico</li>
              <li>Paños de microfibra</li>
              <li>Pulsera antiestática (recomendado)</li>
            </ul>
          </div>

          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Proceso de Limpieza:</h4>
          <ol className="list-decimal pl-6 mb-6 space-y-3">
            <li><strong>Apaga y desconecta completamente el computador</strong></li>
            <li><strong>Abre la carcasa:</strong> Retira los tornillos del panel lateral</li>
            <li><strong>Limpia el polvo:</strong> Usa aire comprimido en ventiladores, disipadores y ranuras</li>
            <li><strong>Limpia los ventiladores:</strong> Usa una brocha para las aspas</li>
            <li><strong>Revisa los filtros:</strong> Limpialos o reemplázalos si están muy sucios</li>
            <li><strong>Limpia la RAM y slots:</strong> Retira y limpia los contactos con alcohol isopropílico</li>
            <li><strong>Verifica conexiones:</strong> Asegúrate de que todos los cables estén bien conectados</li>
          </ol>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded mb-8">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Precauciones:</h4>
            <ul className="list-disc pl-6 text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>No uses aspiradora directamente en componentes (genera estática)</li>
              <li>Mantén el aire comprimido en posición vertical</li>
              <li>No toques componentes sin pulsera antiestática</li>
              <li>No uses líquidos en componentes electrónicos (excepto alcohol isopropílico en contactos)</li>
            </ul>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            2. Cambio de Pasta Térmica
          </h3>
          <p className="mb-4">
            La pasta térmica se seca con el tiempo, reduciendo la transferencia de calor entre el procesador
            y el disipador. Debería cambiarse cada 1-2 años:
          </p>
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Retira el disipador del CPU (consulta el manual si es necesario)</li>
            <li>Limpia la pasta vieja con alcohol isopropílico y paño de microfibra</li>
            <li>Aplica una pequeña cantidad de pasta nueva (tamaño de un grano de arroz)</li>
            <li>Reinstala el disipador asegurándote de que quede bien sujeto</li>
          </ol>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            3. Optimización del Sistema Operativo
          </h3>

          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Para Windows:</h4>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Limpieza de disco:</strong> Elimina archivos temporales y basura</li>
            <li><strong>Desfragmentación:</strong> Solo para discos HDD (no SSD)</li>
            <li><strong>Actualizaciones:</strong> Mantén Windows y drivers actualizados</li>
            <li><strong>Programas de inicio:</strong> Desactiva aplicaciones innecesarias que inician con Windows</li>
            <li><strong>Antivirus:</strong> Escaneo completo mensual</li>
          </ul>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Comandos Útiles de Windows:</h4>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm space-y-2">
              <p># Limpieza de archivos temporales</p>
              <p>cleanmgr</p>
              <p className="mt-2"># Verificar salud del disco</p>
              <p>chkdsk C: /f</p>
              <p className="mt-2"># Verificar archivos del sistema</p>
              <p>sfc /scannow</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Mantenimiento Correctivo: Problemas Comunes
          </h2>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Problema 1: PC Lenta
          </h3>
          <p className="mb-4"><strong>Causas posibles:</strong></p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Disco duro lleno (menos del 20% de espacio libre)</li>
            <li>RAM insuficiente</li>
            <li>Disco duro HDD fragmentado o dañado</li>
            <li>Malware o virus</li>
            <li>Muchos programas ejecutándose en segundo plano</li>
          </ul>

          <p className="mb-4"><strong>Soluciones:</strong></p>
          <ol className="list-decimal pl-6 mb-8 space-y-2">
            <li>Libera espacio en disco (elimina archivos innecesarios, desinstala programas)</li>
            <li>Upgrade a SSD (la mejora más notable que puedes hacer)</li>
            <li>Aumenta la RAM (mínimo 8GB recomendado para Windows 11)</li>
            <li>Escanea y elimina malware</li>
            <li>Desactiva programas de inicio innecesarios</li>
          </ol>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Problema 2: Sobrecalentamiento
          </h3>
          <p className="mb-4"><strong>Síntomas:</strong> Apagones repentinos, ventiladores ruidosos, rendimiento reducido</p>

          <p className="mb-4"><strong>Soluciones:</strong></p>
          <ol className="list-decimal pl-6 mb-8 space-y-2">
            <li>Limpia el polvo de ventiladores y disipadores</li>
            <li>Reemplaza la pasta térmica</li>
            <li>Mejora la ventilación (agrega ventiladores si es necesario)</li>
            <li>Verifica que todos los ventiladores funcionen correctamente</li>
            <li>No bloquees las rejillas de ventilación</li>
          </ol>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Problema 3: Ruidos Extraños
          </h3>
          <p className="mb-4"><strong>Tipos de ruido y causas:</strong></p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Zumbido continuo:</strong> Ventiladores sucios o desgastados</li>
            <li><strong>Clic repetitivo:</strong> Disco duro HDD dañado (respalda datos inmediatamente)</li>
            <li><strong>Chirrido agudo:</strong> Ventilador del CPU o fuente de poder fallando</li>
            <li><strong>Vibración:</strong> Tornillos flojos o componentes mal montados</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Calendario de Mantenimiento Recomendado
          </h2>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Cada Mes:</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mb-6">
              <li>Limpieza exterior (teclado, pantalla, carcasa)</li>
              <li>Verificar espacio en disco</li>
              <li>Escaneo antivirus</li>
              <li>Actualizar software y drivers</li>
            </ul>

            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Cada 6 Meses:</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mb-6">
              <li>Limpieza interna completa</li>
              <li>Verificar temperaturas (usa HWMonitor o similar)</li>
              <li>Optimización del sistema operativo</li>
              <li>Respaldo completo de datos importantes</li>
            </ul>

            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Cada 1-2 Años:</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Cambio de pasta térmica</li>
              <li>Reemplazo de ventiladores defectuosos</li>
              <li>Formateo y reinstalación del sistema (opcional pero recomendado)</li>
              <li>Evaluación de upgrades (RAM, SSD, etc.)</li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Upgrades Recomendados para Mejorar Rendimiento
          </h2>

          <div className="space-y-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-3">
                1. SSD - Mejora Más Notable (Prioridad #1)
              </h3>
              <p className="text-green-800 dark:text-green-200 mb-2">
                Reemplazar un HDD por un SSD puede hacer que tu PC parezca nueva. Beneficios:
              </p>
              <ul className="list-disc pl-6 text-green-700 dark:text-green-300 space-y-1">
                <li>Windows arranca en 10-15 segundos (vs 1-2 minutos con HDD)</li>
                <li>Aplicaciones se abren instantáneamente</li>
                <li>Sistema más responsivo en general</li>
                <li>Sin partes móviles = más silencioso y confiable</li>
              </ul>
              <p className="mt-3 text-green-800 dark:text-green-200">
                <strong>Costo en Colombia:</strong> Desde $120.000 (256GB) - En Neurai.dev tenemos SSD EXRAM de calidad
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-3">
                2. RAM - Más Memoria = Mejor Multitarea (Prioridad #2)
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-2">
                Si tu PC tiene 4GB o menos, upgrading a 8GB+ mejorará drásticamente el rendimiento:
              </p>
              <ul className="list-disc pl-6 text-blue-700 dark:text-blue-300 space-y-1">
                <li>Abre más pestañas del navegador sin ralentizaciones</li>
                <li>Ejecuta múltiples programas simultáneamente</li>
                <li>Mejor para edición de fotos/videos</li>
              </ul>
              <p className="mt-3 text-blue-800 dark:text-blue-200">
                <strong>Costo en Colombia:</strong> Desde $100.000 (8GB DDR4) - Tenemos Puskill DDR4 en stock
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            ¿Cuándo es Momento de Reemplazar tu PC?
          </h2>
          <p className="mb-4">Considera reemplazar tu computador si:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Tiene más de 7-8 años y los upgrades ya no son suficientes</li>
            <li>El procesador es muy antiguo y no soporta software moderno</li>
            <li>Las reparaciones cuestan más del 50% del valor de un equipo nuevo</li>
            <li>Ya no recibe actualizaciones de seguridad del sistema operativo</li>
            <li>No cumple con tus necesidades actuales incluso después de upgrades</li>
          </ul>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8 rounded-lg text-white mt-12">
            <h3 className="text-2xl font-bold mb-4">¿Necesitas Ayuda con el Mantenimiento?</h3>
            <p className="mb-6 text-lg">
              En Neurai.dev ofrecemos servicio completo de mantenimiento preventivo y correctivo para computadores.
              También vendemos componentes para upgrades: SSD, RAM, y más.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/servicios/tecnicos" className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
                Ver Servicios Técnicos
              </Link>
              <a href="https://wa.me/573174503604?text=Necesito servicio de mantenimiento de PC" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-block">
                Agendar Mantenimiento
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
