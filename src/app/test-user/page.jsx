"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

/**
 * Página temporal para ver la información de tu usuario
 * Ve a: http://localhost:3000/test-user
 */
export default function TestUserPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">No has iniciado sesión</h1>
        <p>Ve a <Link href="/sign-in" className="text-blue-600 underline">/sign-in</Link> para iniciar sesión</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Información de tu Usuario</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📧 Email Principal</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Copia este email y agrégalo a <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">src/lib/auth/roles.js</code>
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {user.primaryEmailAddress?.emailAddress || 'No disponible'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">👤 Datos del Usuario</h2>
        <div className="space-y-2">
          <p><strong>ID:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">{user.id}</code></p>
          <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Nombre completo:</strong> {user.fullName}</p>
          <p><strong>Username:</strong> {user.username || 'No configurado'}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📧 Todos los Emails</h2>
        <ul className="space-y-2">
          {user.emailAddresses?.map((email, index) => (
            <li key={email.id} className="flex items-center gap-2">
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                {email.emailAddress}
              </span>
              {email.verification?.status === 'verified' && (
                <span className="text-green-600 text-sm">✓ Verificado</span>
              )}
              {index === 0 && (
                <span className="text-blue-600 text-sm">← Principal</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🔧 Información Completa (JSON)</h2>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-xs">
          {JSON.stringify({
            id: user.id,
            emails: user.emailAddresses?.map(e => e.emailAddress),
            primaryEmail: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            publicMetadata: user.publicMetadata,
          }, null, 2)}
        </pre>
      </div>

      <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="font-bold text-lg mb-2">📝 Próximo paso:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Copia tu email de arriba (el que está en azul)</li>
          <li>Abre el archivo: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">src/lib/auth/roles.js</code></li>
          <li>Reemplaza <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">&apos;tu-email@ejemplo.com&apos;</code> con tu email</li>
          <li>Guarda el archivo</li>
          <li>Vuelve a intentar acceder a <Link href="/dashboard" className="text-blue-600 underline">/dashboard</Link></li>
        </ol>
      </div>
    </div>
  );
}
