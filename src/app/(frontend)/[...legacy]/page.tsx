import { notFound, permanentRedirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

// Résolveur des anciennes URL du site WordPress qui ne se déduisent pas d'une
// simple règle de chemin et demandent une recherche en base :
//
//   /annuaire-des-membres/cheikh-badiane                    -> /annuaire/cheikhbadiane
//   /annuaire-des-membres/le-bureau-executif/aida_bodian    -> /annuaire/aidabodian
//   /la-dsp-outille-les-presidents-...                      -> /actualites/la-dsp-outille-...
//
// Les correspondances fixes (rubriques, /wp-content, etc.) sont déclarées dans
// next.config.ts : elles n'ont pas besoin de la base et sont traitées en amont.
//
// Cette route n'est atteinte que par les chemins qu'aucune autre route ne
// capte — c'est-à-dire l'espace des 404. Quand rien ne correspond, elle rend
// le 404 habituel.

export const dynamic = 'force-dynamic'

/**
 * Aligne un slug WordPress sur le format des slugs Payload.
 * L'ancien site séparait les mots (`cheikh-badiane`, `aida_bodian`), le hook
 * de la collection `membres` les concatène (`cheikhbadiane`).
 */
function normaliserSlug(valeur: string): string {
  return valeur
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function trouverSlug(payload: any, collection: string, where: Record<string, any>): Promise<string | null> {
  try {
    const { docs } = await payload.find({
      collection,
      where,
      depth:          0,
      limit:          1,
      overrideAccess: true,
    })
    return docs[0]?.slug ?? null
  } catch {
    return null
  }
}

export default async function LegacyRedirect({
  params,
}: {
  params: Promise<{ legacy: string[] }>
}) {
  const { legacy } = await params
  const segments = (legacy ?? []).filter(Boolean)

  if (segments.length === 0) notFound()

  const payload = await getPayload({ config })

  // ── Fiches membres de l'ancien annuaire ────────────────────────────────────
  if (segments[0] === 'annuaire-des-membres') {
    // Le dernier segment porte le nom ; « le-bureau-executif » n'est qu'un
    // niveau intermédiaire de l'ancienne arborescence.
    const dernier = segments[segments.length - 1]
    const slug    = await trouverSlug(payload, 'membres', {
      slug: { equals: normaliserSlug(dernier) },
    })

    // Membre non repris sur le nouveau site (cas observé : habib-sy) : on
    // renvoie vers l'annuaire plutôt que vers un 404.
    permanentRedirect(slug ? `/annuaire/${slug}` : '/annuaire')
  }

  // ── Articles publiés à la racine sur l'ancien site ─────────────────────────
  if (segments.length === 1) {
    const slug = await trouverSlug(payload, 'posts', {
      and: [{ slug: { equals: segments[0] } }, { statut: { equals: 'publie' } }],
    })
    if (slug) permanentRedirect(`/actualites/${slug}`)
  }

  notFound()
}
