"use client";

import { useState } from "react";
import { Gift, X, Check } from "lucide-react";

/**
 * Modal para registro voluntario de clientes en el sistema de descuentos
 * Se muestra después de un pago exitoso
 */
export default function CustomerRegistrationModal({ orderData, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = invitación, 2 = formulario, 3 = éxito
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: orderData?.customer_name || orderData?.nombre_cliente || '',
    email: orderData?.customer_email || orderData?.correo_cliente || '',
    phone: orderData?.customer_phone || orderData?.telefono_cliente || ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      setStep(3);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl transform transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                ¡Espera!
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4">
            ¿Te gustaría recibir{" "}
            <span className="font-bold text-purple-600 dark:text-purple-400">
              descuentos exclusivos
            </span>{" "}
            en tus próximas compras?
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Regístrate en nuestro programa de clientes y obtén:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Códigos de descuento personalizados
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Ofertas exclusivas antes que nadie
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Promociones especiales para clientes frecuentes
                </span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
            >
              ¡Sí, quiero descuentos!
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              No, gracias
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Solo te enviaremos ofertas relevantes, nunca spam
          </p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Regístrate
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Al registrarte, aceptas recibir ofertas y promociones exclusivas por correo electrónico.
                Puedes darte de baja en cualquier momento.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
              >
                {loading ? 'Registrando...' : 'Registrarme'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Registro exitoso!
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ahora eres parte de nuestro programa de clientes. Pronto recibirás ofertas y descuentos exclusivos en tu correo.
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
              🎁 Tu primer beneficio:
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Revisa tu correo en los próximos días para recibir un código de descuento especial de bienvenida.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }
}
