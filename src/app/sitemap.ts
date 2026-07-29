import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SITE_URL } from '@/lib/site'

// Généré à chaque requête : le contenu (actualités, blog, membres) évolue en
// continu et ne doit pas être figé au build.
export const dynamic = 'force-dynamic'

// Routes publiques uniquement. /activites, /mediatheque, /dashboard,
// /connexion et /inscription sont exclus : ils redirigent (307) ou sont
// réservés aux membres connectés, donc non indexables.
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`,                          changeFrequency: 'weekly',  priority: 1 },
  { url: `${SITE_URL}/a-propos`,                  changeFrequency: 'monthly', priority: 0.8 },
  { url: `${SITE_URL}/a-propos/mot-du-president`, changeFrequency: 'yearly',  priority: 0.6 },
  { url: `${SITE_URL}/a-propos/nos-partenaires`,  changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/annuaire`,                  changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${SITE_URL}/annuaire/bureau`,           changeFrequency: 'monthly', priority: 0.7 },
  { url: `${SITE_URL}/actualites`,                changeFrequency: 'daily',   priority: 0.9 },
  { url: `${SITE_URL}/blog`,                      changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${SITE_URL}/documents`,                 changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/magazines`,                 changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/contact`,                   changeFrequency: 'yearly',  priority: 0.5 },
  { url: `${SITE_URL}/mentions-legales`,          changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${SITE_URL}/politique-confidentialite`, changeFrequency: 'yearly',  priority: 0.3 },
]

interface DocAvecSlug {
  slug?:      string | null
  updatedAt?: string | null
}

/**
 * Interroge une collection et transforme ses documents en entrées de sitemap.
 * Chaque appel est isolé : une collection en échec ne fait plus tomber les
 * autres — une seule requête invalide vidait auparavant tout le contenu
 * dynamique du sitemap.
 */
async function routesDepuis(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload:    any,
  collection: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where:      Record<string, any>,
  prefixe:    string,
  priority:   number,
): Promise<MetadataRoute.Sitemap> {
  try {
    const { docs } = await payload.find({
      collection,
      where,
      depth:          0,
      pagination:     false,
      overrideAccess: true,
    })

    return (docs as DocAvecSlug[])
      .filter(d => d.slug)
      .map(d => ({
        url:             `${SITE_URL}${prefixe}/${d.slug}`,
        lastModified:    d.updatedAt ? new Date(d.updatedAt) : undefined,
        changeFrequency: 'monthly' as const,
        priority,
      }))
  } catch (err) {
    console.error(`[sitemap] Collection « ${collection} » ignorée :`, err)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let payload
  try {
    payload = await getPayload({ config })
  } catch (err) {
    console.error('[sitemap] Base inaccessible, routes statiques uniquement :', err)
    return STATIC_ROUTES
  }

  const [posts, blogPosts, membres] = await Promise.all([
    routesDepuis(payload, 'posts',      { statut: { equals: 'publie' } },           '/actualites', 0.7),
    routesDepuis(payload, 'blog-posts', { statut: { equals: 'published' } },        '/blog',       0.6),
    // Le statut des membres est imbriqué dans le groupe `adhesion` : interroger
    // `statut` à la racine lève une QueryError.
    routesDepuis(payload, 'membres',    { 'adhesion.statut': { equals: 'actif' } }, '/annuaire',   0.5),
  ])

  return [...STATIC_ROUTES, ...posts, ...blogPosts, ...membres]
}
