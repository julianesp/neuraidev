"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

// Vuelta del inicio de sesión con Facebook desde /calificar: Clerk termina
// el login (o crea la cuenta) y regresa al formulario.
export default function CalificarSsoCallback() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-600 dark:text-gray-300">Conectando con Facebook…</p>
      <AuthenticateWithRedirectCallback />
    </main>
  );
}
