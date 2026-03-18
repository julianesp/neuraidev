"use client";

import { SignUp } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import Link from "next/link";
import { Store } from "lucide-react";

export default function RegistroTiendaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 mt-8 sm:mt-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Crea tu tienda en Neurai
          </h1>
          <p className="text-sm text-gray-500">
            Regístrate y empieza a vender en minutos
          </p>
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
          path="/para-tiendas/registro"
          signInUrl="/sign-in"
          forceRedirectUrl="/tienda/onboarding"
        />

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            ¿Ya tienes cuenta de tienda?{" "}
            <Link
              href="/sign-in?redirect_url=/tienda/dashboard"
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
