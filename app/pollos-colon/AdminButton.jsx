"use client";

import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Settings } from "lucide-react";

export default function AdminButton() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (user) {
    return (
      <Link
        href="/admin/pollos-colon"
        className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
      >
        <Settings className="w-4 h-4" />
        Administrar publicaciones
      </Link>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
        <Settings className="w-4 h-4" />
        Administrar publicaciones
      </button>
    </SignInButton>
  );
}
