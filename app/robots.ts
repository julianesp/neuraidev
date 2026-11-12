import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://neurai.dev'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/sign-in',
          '/sign-up',
          '/perfil',
          '/_next/data/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
