import { MetadataRoute } from 'next'

/**
 * Genera el archivo robots.txt dinámicamente
 * Next.js sirve este archivo automáticamente en /robots.txt
 *
 * Documentación: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://neurai.dev'

  // Bloquear indexación en previews de Vercel
  const isPreview = process.env.VERCEL_ENV !== 'production';

  if (isPreview) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/_next/data/',
          '/*.json$',
          '/*.env$',
          '/*.config.js$',
          '/vercel.json',
          '/*?*preview=',
          '/*?*utm_*',
          '/*?*fbclid=',
          '/preview/',
        ],
      },
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/',
          '/_next/static/',
          '/_next/image',
        ],
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/_next/static/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
