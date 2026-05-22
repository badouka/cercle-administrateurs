import { getPayload } from 'payload'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import config from '@payload-config'
import { DocumentsFilter } from './DocumentsFilter'

export const metadata: Metadata = { title: 'Documents' }

const PUBLIC_CATEGORIES = [
  'textes_statutaires',
  'textes_reglementaires',
  'docs_politique_economique',
] as const

export default async function DocumentsPage() {
  const payload = await getPayload({ config })

  const { docs, totalDocs } = await payload.find({
    collection: 'documents',
    where: {
      and: [
        { acces:     { equals: 'public' } },
        { categorie: { in: PUBLIC_CATEGORIES } },
      ],
    },
    depth: 1,
    sort: 'titre',
    limit: 500,
    overrideAccess: true,
  })

  // Flatten to plain serialisable objects for the client component
  const serialised = docs.map(doc => {
    const fichier = typeof doc.fichier === 'object' && doc.fichier ? (doc.fichier as Media) : null
    return {
      id:          doc.id,
      titre:       doc.titre,
      description: doc.description ?? null,
      categorie:   doc.categorie,
      fichier:     fichier ? { url: fichier.url ?? null, filesize: fichier.filesize ?? null } : null,
    }
  })

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
        <DocumentsFilter docs={serialised} />
      )}

      {/* Note accès membres */}
      <div className="mt-12 rounded-xl border border-gray-200 bg-[#F5F5F5] p-5">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-black">Membres du CAP :</span>{' '}
          d&apos;autres documents (PV de réunion, ressources) sont accessibles après connexion dans votre espace membre.
        </p>
      </div>
    </div>
  )
}
