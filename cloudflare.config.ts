import { bindings, defineConfig, defineWorker } from "cf/config";
import { createWorkersCacheConfig } from "@vinext/cloudflare/cache/config";

const cache = await createWorkersCacheConfig();

// Variables de servidor (las NEXT_PUBLIC_* las incrusta el build). Con
// nodejs_compat quedan también en process.env, como en Vercel.
const secretos = Object.fromEntries(
  [
    "ADMIN_EMAILS",
    "ADMIN_PASSWORD",
    "ADMIN_SECRET",
    "ADMIN_USERNAME",
    "ANTHROPIC_API_KEY",
    "APP_DOWNLOAD_URL",
    "APP_LATEST_VERSION_CODE",
    "APP_UPDATE_NOTE",
    "CLERK_SECRET_KEY",
    "CLERK_WEBHOOK_SECRET",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_D1_DATABASE_ID",
    "CLOUDFLARE_D1_TOKEN",
    "CLOUDFLARE_R2_ACCESS_KEY_ID",
    "CLOUDFLARE_R2_BUCKET_NAME",
    "CLOUDFLARE_R2_ENDPOINT",
    "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
    "EPAYCO_CUST_ID",
    "EPAYCO_P_KEY",
    "EPAYCO_PRIVATE_KEY",
    "EPAYCO_TEST_MODE",
    "FACEBOOK_APP_SECRET",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "OPENAI_API_KEY",
    "RESEND_API_KEY",
    "SUPER_ADMIN_EMAIL",
    "TELEGRAM_ADMIN_CHAT_ID",
    "TELEGRAM_BOT_TOKEN",
    "USE_CLAUDE",
    "VAPID_PRIVATE_KEY",
    "VAPID_PUBLIC_KEY",
    "WHATSAPP_APP_SECRET",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_VERIFY_TOKEN",
  ].map((nombre) => [nombre, bindings.secret()]),
);


export default defineConfig({
  accountId: "b85347650ec6de9ad5b2873c3389d0e6",
  worker: defineWorker({
    ...cache,
    name: "neuraidev",
    // prueba.neurai.dev se quita cuando la migración esté confirmada
    domains: ["neurai.dev", "www.neurai.dev", "prueba.neurai.dev"],
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-27",
    // Clerk, AWS SDK (R2), Buffer y crypto necesitan las APIs de Node
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ...cache.env,
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      // Base de datos neurai-db (antes se usaba solo por REST con CLOUDFLARE_D1_TOKEN)
      DB: bindings.d1({ id: "25f012f9-3f73-4e50-8703-5d123b8630a3", dev: { remote: true } }),
      ...secretos,
    },
  }),
});
