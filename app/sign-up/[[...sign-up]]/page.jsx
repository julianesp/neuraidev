"use client";

import { SignUp } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SignUpPage() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Ocultar el mensaje de bienvenida después de 2 segundos
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 mt-8 sm:mt-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Crea tu cuenta
          </h1>
          {showWelcome && (
            <p className="text-sm sm:text-base text-gray-600 transition-opacity duration-500 animate-fade-out">
              Únete a neurai.dev y crea tu tienda online
            </p>
          )}
        </div>

        <SignUp
          localization={esES}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
