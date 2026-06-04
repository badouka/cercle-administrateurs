import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Route de backfill — GET /api/backfill-slugs
// Régénère les slugs de toutes les galeries (corrige les slugs malformés)

const toSlug = (titre: string) =>
  titre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const GET = async () => {
  const payload = await getPayload({ config: configPromise })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { docs } = await (payload.find as any)({
    collection:     'mediatheque',
    depth:          0,
    limit:          200,
    overrideAccess: true,
  })

  const results: { id: number; titre: string; ancien: string | null; nouveau: string; updated: boolean }[] = []

  for (const doc of docs as { id: number; titre: string; slug?: string | null }[]) {
    const newSlug = toSlug(doc.titre)
    const needsUpdate = doc.slug !== newSlug

    if (needsUpdate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payload.update as any)({
        collection:     'mediatheque',
        id:             doc.id,
        data:           { slug: newSlug },
        overrideAccess: true,
      })
    }

    results.push({ id: doc.id, titre: doc.titre, ancien: doc.slug ?? null, nouveau: newSlug, updated: needsUpdate })
  }

  const updated = results.filter(r => r.updated).length

  return Response.json({
    message: `${updated} slug(s) corrigé(s) sur ${docs.length}`,
    results,
  })
}
