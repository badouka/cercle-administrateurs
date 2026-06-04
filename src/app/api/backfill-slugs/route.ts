import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Route de backfill — à appeler une seule fois : GET /api/backfill-slugs
// Génère les slugs manquants pour toutes les galeries Médiathèque

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export const GET = async () => {
  const payload = await getPayload({ config: configPromise })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { docs } = await (payload.find as any)({
    collection:     'mediatheque',
    depth:          0,
    limit:          200,
    overrideAccess: true,
  })

  const results: { id: number; titre: string; ancien: string | null; nouveau: string | null }[] = []

  for (const doc of docs as { id: number; titre: string; slug?: string | null }[]) {
    if (!doc.slug) {
      const newSlug = toSlug(doc.titre)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payload.update as any)({
        collection:     'mediatheque',
        id:             doc.id,
        data:           { slug: newSlug },
        overrideAccess: true,
      })

      results.push({ id: doc.id, titre: doc.titre, ancien: null, nouveau: newSlug })
    } else {
      results.push({ id: doc.id, titre: doc.titre, ancien: doc.slug, nouveau: null })
    }
  }

  const updated = results.filter(r => r.nouveau !== null).length

  return Response.json({
    message: `${updated} slug(s) généré(s)`,
    results,
  })
}
