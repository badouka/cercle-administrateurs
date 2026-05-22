import { getPayload } from 'payload'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { Document, Media } from '@/payload-types'
import config from '@payload-config'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Magazines | CAP',
  description: 'Publications du Cercle des Administrateurs Publics du Sénégal',
}

export default async function MagazinesPage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'documents',
    where: {
      and: [
        { categorie: { equals: 'magazines' } },
        { acces:     { equals: 'public'    } },
      ],
    },
    depth:          1,
    sort:           '-createdAt',
    limit:          100,
    overrideAccess: true,
  })

  const magazines = docs as Document[]

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

      {/* En-tête */}
      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">Magazines</h1>
        <p className="mt-2 text-gray-500">
          Publications du Cercle des Administrateurs Publics
          {magazines.length > 0 && (
            <span className="ml-1 text-gray-400">
              ({magazines.length} numéro{magazines.length > 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>

      {magazines.length === 0 ? (
        <div className="rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] px-6 py-12 text-center">
          <FileText size={36} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-gray-500">Aucun magazine disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {magazines.map(doc => {
            const couverture = typeof doc.couverture === 'object' && doc.couverture
              ? (doc.couverture as Media)
              : null
            const fichier = typeof doc.fichier === 'object'
              ? (doc.fichier as Media)
              : null

            return (
              <article
                key={doc.id}
                className="group flex flex-col rounded-2xl border border-[#E5E5E5] overflow-hidden bg-white hover:shadow-lg transition-shadow duration-200"
              >
                {/* Couverture */}
                {couverture?.url ? (
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    <Image
                      src={couverture.url}
                      alt={doc.titre}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[3/4] flex-col items-center justify-center border-b-4 border-green-600 bg-green-50">
                    <FileText
                      size={52}
                      className="text-green-600 mb-4"
                      strokeWidth={1.5}
                    />
                    <span className="text-xs font-extrabold tracking-widest text-green-700 uppercase">
                      CAP
                    </span>
                    <span className="mt-1 text-xs text-green-600">Magazine</span>
                  </div>
                )}

                {/* Contenu */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-bold text-black leading-snug">{doc.titre}</h2>

                  {doc.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3 flex-1">
                      {doc.description}
                    </p>
                  )}

                  {fichier?.url && (
                    <a
                      href={fichier.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                    >
                      Lire la revue →
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
