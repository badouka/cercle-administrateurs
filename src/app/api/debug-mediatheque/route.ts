import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Route temporaire de diagnostic — à supprimer en production
export const GET = async () => {
  const payload = await getPayload({ config: configPromise })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { docs, totalDocs } = await (payload.find as any)({
    collection:     'mediatheque',
    depth:          0,
    limit:          50,
    overrideAccess: true,
  })

  const summary = docs.map((d: Record<string, unknown>) => ({
    id:     d.id,
    titre:  d.titre,
    slug:   d.slug ?? '⚠️ NULL',
    statut: d.statut,
    nbPhotos: Array.isArray(d.photos) ? d.photos.length : 0,
  }))

  return Response.json({ totalDocs, galeries: summary })
}
