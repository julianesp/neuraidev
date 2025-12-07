"use client";

import { usePathname } from "next/navigation";
import Footer from "@/containers/Footer/page";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // No mostrar el footer en rutas del dashboard
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return <Footer />;
}
