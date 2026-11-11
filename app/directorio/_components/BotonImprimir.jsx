"use client";

import { Printer } from "lucide-react";

export default function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold !text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700"
    >
      <Printer className="h-5 w-5" /> Imprimir cartel
    </button>
  );
}
