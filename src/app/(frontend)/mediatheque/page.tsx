import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import config from '@payload-config'
import { CalendarDays, Images } from 'lucide-react'

export const metadata: Metadata = { title: 'Médiathèque' }

// Types locaux (avant génération payload-types)
interface GaleriePhoto {
  id: string
  photo: number | Media
  legende?: string | null
}

interface Galerie {
  id: number
  titre: string
  slug?: string | null
  date?: string | null
  description?: string | null
  photos: GaleriePhoto[]
  statut: 'publie' | 'brouillon'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

export default async function MediathequePage() {
  const payload = await getPayload({ config })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { docs } = await (payload.find as any)({
    collection:     'mediatheque',
    where:          { statut: { equals: 'publie' } },
    sort:           '-date',
    depth:          1,
    limit:          100,
    overrideAccess: true,
  })

  const galeries = docs as Galerie[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">Médiathèque</h1>
        <p className="mt-2 text-gray-500">
          Photos et vidéos des activités du CAP.
        </p>
      </div>

      {galeries.length === 0 ? (
        <p className="text-gray-500">Aucune galerie disponible pour le moment.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galeries.map(galerie => {
            const cover   = galerie.photos?.[0]?.photo
            const coverMedia = typeof cover === 'object' && cover ? cover as Media : null
            const href    = galerie.slug ? `/mediatheque/${galerie.slug}` : null
            const nbPhotos = galerie.photos?.length ?? 0

            return (
              <article
                key={galerie.id}
                className="group flex flex-col rounded-xl border border-[#E5E5E5] bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Couverture */}
                {href ? (
                  <Link href={href} className="block relative aspect-video bg-gray-100">
                    {coverMedia?.url ? (
                      <Image
                        src={coverMedia.url}
                        alt={coverMedia.alt || galerie.titre}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-300 select-none">CAP</span>
                      </div>
                    )}
                  </Link>
                ) : (
                  <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-300 select-none">CAP</span>
                  </div>
                )}

                <div className="flex flex-col flex-1 p-5 gap-3">
                  {/* Titre */}
                  {href ? (
                    <Link href={href}>
                      <h2 className="font-semibold text-black leading-snug hover:text-gray-700 transition-colors">
                        {galerie.titre}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className="font-semibold text-black leading-snug">{galerie.titre}</h2>
                  )}

                  {/* Méta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {galerie.date && (
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-gray-400" />
                        {formatDate(galerie.date)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Images size={13} className="text-gray-400" />
                      {nbPhotos} photo{nbPhotos > 1 ? 's' : ''}
                    </span>
                  </div>

                  {href && (
                    <Link
                      href={href}
                      className="text-xs font-semibold text-black underline underline-offset-2 hover:text-gray-600 transition-colors self-start mt-auto"
                    >
                      Voir la galerie →
                    </Link>
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
