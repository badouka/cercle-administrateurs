import { getPayload } from 'payload'
import type { Metadata } from 'next'
import type { Document, Media } from '@/payload-types'
import config from '@payload-config'
import { FileText, Download } from 'lucide-react'

// ─── Config catégories ────────────────────────────────────────────────────────

const PUBLIC_CATEGORIES = ['textes_statutaires', 'textes_reglementaires'] as const
type PublicCategorie = typeof PUBLIC_CATEGORIES[number]

const CATEGORIE_CONFIG: Record<PublicCategorie, { label: string; description: string }> = {
  textes_statutaires: {
    label:       'Textes statutaires',
    description: 'Statuts, règlements intérieurs et textes constitutifs du CAP.',
  },
  textes_reglementaires: {
    label:       'Textes réglementaires',
    description: 'Décrets, lois, circulaires et textes officiels de référence.',
  },
}

function formatFilesize(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024)        return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Documents' }

export default async function DocumentsPage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'documents',
    where: {
      and: [
        { acces:     { equals: 'public' } },
        { categorie: { in: PUBLIC_CATEGORIES } },
      ],
    },
    depth: 1,
    sort: 'titre',
    limit: 200,
    overrideAccess: true,
  })

  const grouped = Object.fromEntries(
    PUBLIC_CATEGORIES.map(cat => [cat, docs.filter(d => d.categorie === cat)]),
  ) as Record<PublicCategorie, Document[]>

  const totalDocs = docs.length

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">Documents</h1>
        <p className="mt-2 text-gray-500">
          Textes de référence et documents officiels du Cercle des Administrateurs Publics.
          {totalDocs > 0 && (
            <span className="ml-1 text-gray-400">({totalDocs} document{totalDocs > 1 ? 's' : ''})</span>
          )}
        </p>
      </div>

      {totalDocs === 0 ? (
        <p className="text-gray-500">Aucun document disponible pour le moment.</p>
      ) : (
        <div className="space-y-12">
          {PUBLIC_CATEGORIES.map(cat => {
            const catDocs = grouped[cat]
            if (catDocs.length === 0) return null
            const catConfig = CATEGORIE_CONFIG[cat]

            return (
              <section key={cat}>
                <div className="mb-5 flex items-end justify-between border-b-2 border-black pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-black">{catConfig.label}</h2>
                    <p className="mt-0.5 text-sm text-gray-500">{catConfig.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#F5F5F5] px-3 py-0.5 text-sm font-medium text-gray-700">
                    {catDocs.length}
                  </span>
                </div>

                <ul className="divide-y divide-gray-100">
                  {catDocs.map(doc => {
                    const fichier  = typeof doc.fichier === 'object' ? doc.fichier as Media : null
                    const filesize = formatFilesize(fichier?.filesize)

                    return (
                      <li key={doc.id} className="flex items-start gap-4 py-4">
                        <div className="mt-0.5 shrink-0 rounded-lg bg-[#F5F5F5] p-2.5">
                          <FileText size={18} className="text-gray-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-black leading-snug">{doc.titre}</p>
                          {doc.description && (
                            <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                          {filesize && (
                            <p className="mt-0.5 text-xs text-gray-400">PDF · {filesize}</p>
                          )}
                        </div>

                        {fichier?.url && (
                          <a
                            href={fichier.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-black px-3 py-2 text-xs font-semibold text-black hover:bg-black hover:text-white transition-colors"
                            title={`Télécharger ${doc.titre}`}
                          >
                            <Download size={13} />
                            PDF
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {/* Note accès membres */}
      <div className="mt-12 rounded-xl border border-gray-200 bg-[#F5F5F5] p-5">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-black">Membres du CAP :</span>{' '}
          d'autres documents (PV de réunion, ressources) sont accessibles après connexion dans votre espace membre.
        </p>
      </div>
    </div>
  )
}
