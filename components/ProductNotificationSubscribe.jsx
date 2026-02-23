"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Mail, Bell, Check, X } from "lucide-react";

export default function ProductNotificationSubscribe({ className = "" }) {
  const { user, isLoaded } = useUser();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [notificarTodos, setNotificarTodos] = useState(true);
  const [categoriasInteres, setCategoriasInteres] = useState([]);

  // Pre-llenar datos del usuario si está logueado
  useEffect(() => {
    if (isLoaded && user) {
      // Obtener el email principal del usuario
      const userEmail = user.emailAddresses?.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
      if (userEmail) {
        setEmail(userEmail);
      }

      // Obtener el nombre completo o nombre de usuario
      const userName = user.fullName || user.firstName || user.username || "";
      if (userName) {
        setNombre(userName);
      }
    }
  }, [isLoaded, user]);

  const categorias = [
    { value: "celulares", label: "Celulares" },
    { value: "computadoras", label: "Computadoras" },
    { value: "gadgets", label: "Gadgets y Accesorios" },
    { value: "damas", label: "Productos para Damas" },
    { value: "belleza", label: "Belleza y Cuidado Personal" },
    { value: "libros", label: "Libros" },
  ];

  const handleCategoriaToggle = (categoria) => {
    if (categoriasInteres.includes(categoria)) {
      setCategoriasInteres(categoriasInteres.filter(c => c !== categoria));
    } else {
      setCategoriasInteres([...categoriasInteres, categoria]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("El email es requerido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          nombre,
          notificar_todos: notificarTodos,
          categorias_interes: notificarTodos ? [] : categoriasInteres,
          clerk_user_id: user?.id || null, // Asociar con cuenta de Clerk si está logueado
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al suscribirse");
      }

      setSuccess(true);
      setEmail("");
      setNombre("");
      setCategoriasInteres([]);

      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-700 dark:text-green-300">
              ¡Suscripción exitosa!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Te enviaremos un email de confirmación
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Te notificaremos cuando subamos nuevos productos. Revisa tu email para confirmar tu suscripción.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-green-700 dark:text-green-400 hover:underline"
        >
          Suscribir otro email
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Notificaciones de Productos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user ? `¡Hola ${user.firstName || 'amigo'}!` : 'Recibe un email'} cuando subamos nuevos productos
          </p>
        </div>
      </div>

      {user && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            ✓ Detectamos tu cuenta. Usaremos el email: <strong>{email}</strong>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={user && email} // Deshabilitar si el email viene de Clerk
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          {user && email && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email obtenido de tu cuenta de {user.externalAccounts?.[0]?.provider || 'Clerk'}
            </p>
          )}
        </div>

        {/* Nombre (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre (opcional)
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Opciones de notificación */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notificarTodos}
              onChange={(e) => setNotificarTodos(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notificarme de todos los productos nuevos
            </span>
          </label>

          {!notificarTodos && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Selecciona las categorías que te interesan:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {categorias.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoriasInteres.includes(cat.value)}
                      onChange={() => handleCategoriaToggle(cat.value)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {cat.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <X className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Botón de suscripción */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Suscribiendo...
            </>
          ) : (
            <>
              <Bell className="w-5 h-5" />
              Suscribirse a Notificaciones
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Puedes cancelar tu suscripción en cualquier momento. No compartimos tu email con terceros.
        </p>
      </form>
    </div>
  );
}
