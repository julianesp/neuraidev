const path = require("path");

// Headers de seguridad
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.googletagmanager.com https://vercel.live https://va.vercel-scripts.com https://connect.facebook.net https://*.clerk.accounts.dev https://www.google.com https://www.gstatic.com https://challenges.cloudflare.com https://checkout.wompi.co https://production.wompi.co https://sandbox.wompi.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' https: data: blob: https://selectafm.com",
      "font-src 'self' https://fonts.gstatic.com",
      "media-src 'self' blob: data: https://yfglwidanlpqsmbnound.supabase.co https://*.supabase.co https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com https://radio25.virtualtronics.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://*.clerk.accounts.dev https://api.clerk.com https://www.google.com https://www.gstatic.com https://challenges.cloudflare.com https://yfglwidanlpqsmbnound.supabase.co https://*.supabase.co wss://yfglwidanlpqsmbnound.supabase.co wss://*.supabase.co https://production.wompi.co https://sandbox.wompi.co https://radio25.virtualtronics.com",
      "frame-src 'self' https://www.youtube.com https://youtube.com https://www.facebook.com https://*.clerk.accounts.dev https://www.google.com https://www.recaptcha.net https://recaptcha.google.com https://challenges.cloudflare.com https://checkout.wompi.co https://player.vimeo.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.wompi.co https://production.wompi.co",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,

  // Configurar el directorio raíz del workspace
  outputFileTracingRoot: path.join(__dirname, "./"),

  // Mejorar sourcemaps para debugging
  productionBrowserSourceMaps: false,

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...securityHeaders,
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          ...securityHeaders,
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Admin-Secret",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },

  // Configuración de imágenes remotas
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pixabay.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "supabase.com",
      },
      {
        protocol: "https",
        hostname: "nwxetoffoghsimkqfsbv.supabase.co",
      },
      {
        protocol: "https",
        hostname: "yfglwidanlpqsmbnound.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.canva.com",
      },
      {
        protocol: "https",
        hostname: "0dwas2ied3dcs14f.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "selectafm.com",
      },
      {
        protocol: "https",
        hostname: "radio25.virtualtronics.com",
      },
    ],
    qualities: [75, 85, 90, 95, 100],
    // Configurar timeouts y cache para imágenes
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    // Aumentar límite de tamaño para imágenes
    domains: [], // Usar remotePatterns en su lugar
  },

  // Configurar timeouts para el servidor
  experimental: {
    // Aumentar timeout de carga de imágenes (30 segundos)
    proxyTimeout: 30000,
    // Optimizar prefetch
    optimisticClientCache: true,
  },

  // Configuración de Turbopack (habilitado por defecto en Next.js 16)
  turbopack: {
    // Configuración vacía - la mayoría de aplicaciones funcionan bien sin configuración adicional
    // Si necesitas configurar loaders o resolver aliases, puedes hacerlo aquí
  },

  // Configuración de compilación optimizada para seguridad
  webpack: (config, { isServer }) => {
    // Configuraciones adicionales de seguridad para webpack
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Silenciar advertencia de serialización de strings grandes en caché
    config.infrastructureLogging = {
      level: "error",
    };

    return config;
  },

  // Variables de entorno públicas controladas
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Configuraciones adicionales de seguridad
  poweredByHeader: false,
  generateEtags: false,

  // Optimizaciones de seguridad para el bundle
  serverExternalPackages: ["bcryptjs"],

  // Redirecciones para manejar variaciones de URL
  async redirects() {
    return [
      // Redirecciones para la sección de computadoras
      {
        source: "/accesorios/computacio/:slug*",
        destination: "/accesorios/computadoras/:slug*",
        permanent: true,
      },
      {
        source: "/accesorios/computacion/:slug*",
        destination: "/accesorios/computadoras/:slug*",
        permanent: true,
      },
      // Redirecciones para libros
      {
        source: "/accesorios/librosnuevos/:slug*",
        destination: "/accesorios/libros-nuevos/:slug*",
        permanent: true,
      },
      {
        source: "/accesorios/librosusados/:slug*",
        destination: "/accesorios/libros-usados/:slug*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
