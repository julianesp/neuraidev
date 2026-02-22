"use client";

import ProductNotificationSubscribe from "@/components/ProductNotificationSubscribe";
import { Bell, Package, Mail, Shield, Clock } from "lucide-react";
import Link from "next/link";

export default function NotificacionesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-6">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Notificaciones de Productos
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sé el primero en enterarte de nuestros nuevos productos. Recibe un email cada vez que subamos algo nuevo a la tienda.
          </p>
        </div>

        {/* Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Productos Exclusivos
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Accede primero a productos nuevos y ofertas especiales antes que nadie.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Solo lo que te Interesa
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Elige las categorías que te interesan y recibe solo notificaciones relevantes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Sin Spam
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Solo te enviamos emails cuando hay productos nuevos. Sin publicidad innecesaria.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Cancela Cuando Quieras
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Puedes cancelar tu suscripción en cualquier momento con un solo clic.
            </p>
          </div>
        </div>

        {/* Formulario de Suscripción */}
        <ProductNotificationSubscribe className="mb-12" />

        {/* Info Adicional */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Cómo funciona?
          </h2>
          <ol className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Ingresa tu email y elige tus preferencias de notificación</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Confirma tu suscripción haciendo clic en el email que te enviaremos</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Recibe notificaciones cada vez que subamos productos que te interesan</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Haz clic en el email para ver el producto y comprarlo antes que se agote</span>
            </li>
          </ol>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <strong>Privacidad:</strong> Tu email está seguro con nosotros. No lo compartimos con terceros ni enviamos spam.
              Solo recibirás notificaciones de nuevos productos según tus preferencias.
            </p>
          </div>
        </div>

        {/* Link de vuelta */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
