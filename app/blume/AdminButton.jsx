"use client";

import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";

const ADMIN_EMAIL = "hesucabrera223@umariana.edu.co";

export default function AdminButton() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const emails = user?.emailAddresses?.map((e) => e.emailAddress) || [];
  const esAdmin = emails.includes(ADMIN_EMAIL);

  if (user && esAdmin) {
    return (
      <Link
        href="/blume/admin"
        className="inline-flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xl w-10 h-10 rounded-full transition-colors"
        title="Administrar publicaciones"
      >
        ✏️
      </Link>
    );
  }

  if (!user) {
    return (
      <SignInButton mode="modal">
        <button
          className="inline-flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xl w-10 h-10 rounded-full transition-colors"
          title="Administrar publicaciones"
        >
          ✏️
        </button>
      </SignInButton>
    );
  }

  return null;
}
