import { getPayload } from 'payload'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import config from '@payload-config'

export const metadata: Metadata = { title: 'Médiathèque' }

export default async function MediathequePage() {
  const payload = await getPayload({ config })

  const { docs: medias } = await payload.find({
    collection:     'media',
    where:          { mimeType: { contains: 'image/' } },
    sort:           '-createdAt',
    depth:          0,
    limit:          200,
    overrideAccess: true,
  })

  const images = medias as Media[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">Médiathèque</h1>
        <p className="mt-2 text-gray-500">
          Photos et vidéos des activités du CAP.
        </p>
      </div>

      {images.length === 0 ? (
        <p className="text-gray-500">Aucun média disponible pour le moment.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map(media => (
            media.url ? (
              <figure
                key={media.id}
                className="group overflow-hidden rounded-xl border border-[#E5E5E5] bg-white hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-gray-100">
                  <Image
                    src={media.url}
                    alt={media.alt}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                {media.alt && (
                  <figcaption className="px-4 py-2.5 text-xs text-gray-500 truncate border-t border-gray-100">
                    {media.alt}
                  </figcaption>
                )}
              </figure>
            ) : null
          ))}
        </div>
      )}
    </div>
  )
}
