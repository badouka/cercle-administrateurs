import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cap-senegal.org'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Espaces privés / techniques exclus de l'indexation.
        disallow: [
          '/admin',
          '/api/',
          '/dashboard',
          '/gestionnaire/',
          '/connexion',
          '/inscription',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
