import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cap-senegal.org'

// Généré à chaque requête : le contenu (actualités, blog, membres) évolue en
// continu et ne doit pas être figé au build.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Pages statiques publiques ──────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/a-propos`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/a-propos/mot-du-president`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE_URL}/a-propos/nos-partenaires`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/annuaire`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/annuaire/bureau`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/actualites`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/documents`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/magazines`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/mentions-legales`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/politique-confidentialite`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // ── Pages dynamiques issues de Payload ─────────────────────────────────────
  let dynamicRoutes: MetadataRoute.Sitemap = []

  try {
    const payload = await getPayload({ config })

    const [posts, blogPosts, membres] = await Promise.all([
      payload.find({
        collection:     'posts',
        where:          { statut: { equals: 'publie' } },
        depth:          0,
        pagination:     false,
        overrideAccess: true,
      }),
      payload.find({
        collection:     'blog-posts',
        where:          { statut: { equals: 'published' } },
        depth:          0,
        pagination:     false,
        overrideAccess: true,
      }),
      payload.find({
        collection:     'membres',
        where:          { statut: { equals: 'actif' } },
        depth:          0,
        pagination:     false,
        overrideAccess: true,
      }),
    ])

    const postRoutes: MetadataRoute.Sitemap = posts.docs
      .filter(d => d.slug)
      .map(d => ({
        url:             `${SITE_URL}/actualites/${d.slug}`,
        lastModified:    d.updatedAt ? new Date(d.updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority:        0.7,
      }))

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.docs
      .filter(d => d.slug)
      .map(d => ({
        url:             `${SITE_URL}/blog/${d.slug}`,
        lastModified:    d.updatedAt ? new Date(d.updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority:        0.6,
      }))

    const membreRoutes: MetadataRoute.Sitemap = membres.docs
      .filter(d => d.slug)
      .map(d => ({
        url:             `${SITE_URL}/annuaire/${d.slug}`,
        lastModified:    d.updatedAt ? new Date(d.updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority:        0.5,
      }))

    dynamicRoutes = [...postRoutes, ...blogRoutes, ...membreRoutes]
  } catch (err) {
    // En cas d'échec d'accès à la base, on renvoie au moins les pages statiques.
    console.error('[sitemap] Impossible de générer les routes dynamiques :', err)
  }

  return [...staticRoutes, ...dynamicRoutes]
}
