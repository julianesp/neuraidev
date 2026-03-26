"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <AuthenticateWithRedirectCallback
      signUpForceRedirectUrl="/tienda/onboarding"
      signInForceRedirectUrl="/tienda/dashboard"
    />
  );
}
