import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

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
