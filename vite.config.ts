import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { workersCacheCdnAdapter } from "@vinext/cloudflare/cache/workers-cache-cdn-adapter";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import { createHash } from "node:crypto";
import { patchCssModules } from "vite-css-modules";
import path from "node:path";

// @clerk/nextjs (usePathnameWithoutCatchAll) hace require("next/navigation")
// dentro de un módulo ESM: con webpack funciona, en Vite/workerd lanza
// "require is not defined" y <SignIn>/<SignUp> dan 500. Se cambia por import.
const clerkRequireANavigation = {
  name: "neurai:clerk-require-next-navigation",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    if (!id.includes("@clerk/nextjs") || !code.includes('require("next/navigation")')) return;
    return {
      code:
        'import * as __clerkNextNavigation from "next/navigation";\n' +
        code.replaceAll('require("next/navigation")', "__clerkNextNavigation"),
      map: null,
    };
  },
};

export default defineConfig({
  environments: {
    client: {
      build: {
        // lib/db-d1.js hace import("cloudflare:workers") dentro de un try;
        // en el navegador ese módulo no existe y nunca se usa.
        rolldownOptions: { external: ["cloudflare:workers"] },
      },
    },
  },
  optimizeDeps: {
    // Sin pre-empaquetar, el plugin de arriba también aplica en `vite dev`
    exclude: ["@clerk/nextjs"],
  },
  plugins: [
    clerkRequireANavigation,
    patchCssModules({ exportMode: "default" }),
    vinext({
      cache: { cdn: workersCacheCdnAdapter() },
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
  resolve: {
    alias: [
      // jspdf solo exporta "node" y "browser"; en workerd se usa la build ES
      { find: /^jspdf$/, replacement: "jspdf/dist/jspdf.es.min.js" },
    ],
  },
  css: {
    modules: {
      generateScopedName(name: string, filename: string) {
        const relativePath = path.relative(import.meta.dirname, filename.replace(/\?.*$/, "")).replaceAll("\\", "/");
        return `_${name}_${createHash("sha256").update(relativePath).digest("hex").slice(0, 7)}`;
      },
    },
  },
});
