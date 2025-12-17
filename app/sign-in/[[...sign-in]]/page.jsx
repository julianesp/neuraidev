"use client";

import { SignIn } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido a Neurai.dev
          </h1>
          <p className="text-gray-600">
            Inicia sesión para gestionar tu tienda online
          </p>
        </div>

        <SignIn
          localization={esES}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿No tienes cuenta?{" "}
            <Link
              href="/sign-up"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
