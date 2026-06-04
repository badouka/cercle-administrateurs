import { getPayload } from 'payload'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import config from '@payload-config'
import { DocumentsFilter } from './DocumentsFilter'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Documents' }

export default async function DocumentsPage() {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: await headers() })
  const isLoggedIn = Boolean(user)

  const { docs, totalDocs } = await payload.find({
    collection: 'documents',
    where: isLoggedIn ? undefined : { acces: { equals: 'public' } },
    depth: 1,
    sort: 'titre',
    limit: 500,
    overrideAccess: true,
  })

  const serialised = docs.map(doc => {
    const fichier = typeof doc.fichier === 'object' && doc.fichier ? (doc.fichier as Media) : null
    return {
      id:          doc.id,
      titre:       doc.titre,
      description: doc.description ?? null,
      categorie:   doc.categorie,
      acces:       doc.acces,
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
        <DocumentsFilter docs={serialised} isLoggedIn={isLoggedIn} />
      )}

      {/* Message connexion pour visiteurs */}
      {!isLoggedIn && (
        <div className="mt-12 rounded-xl border border-gray-200 bg-[#F5F5F5] p-5">
          <p className="text-sm text-gray-600">
            <Link href="/connexion" className="font-semibold text-black underline underline-offset-2 hover:text-gray-700">
              Connectez-vous
            </Link>{' '}
            pour accéder aux PV de réunion, Ressources et autres documents réservés aux membres.
          </p>
        </div>
      )}
    </div>
  )
}
