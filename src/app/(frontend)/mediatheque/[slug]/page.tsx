import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import config from '@payload-config'
import { CalendarDays, ArrowLeft } from 'lucide-react'

// Types locaux (avant génération payload-types)
interface Galerie {
  id: number
  titre: string
  slug?: string | null
  date?: string | null
  description?: string | null
  photos: (number | Media)[]
  statut: 'publie' | 'brouillon'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const payload  = await getPayload({ config })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { docs } = await (payload.find as any)({
    collection:     'mediatheque',
    where:          { slug: { equals: slug } },
    depth:          0,
    limit:          1,
    overrideAccess: true,  // status filtré manuellement ci-dessous
  })

  const galerie = docs[0] as Galerie | undefined
  return { title: galerie ? `${galerie.titre} — Médiathèque` : 'Médiathèque' }
}

export default async function GaleriePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const payload  = await getPayload({ config })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { docs: allDocs } = await (payload.find as any)({
    collection:     'mediatheque',
    where:          { slug: { equals: slug } },
    depth:          1,
    limit:          1,
    overrideAccess: true,
  })

  const raw = allDocs[0] as Galerie | undefined
  if (!raw || raw.statut !== 'publie') notFound()
  const galerie = raw

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Retour */}
      <Link
        href="/mediatheque"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Médiathèque
      </Link>

      {/* En-tête galerie */}
      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">{galerie.titre}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {galerie.date && (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-gray-400" />
              {formatDate(galerie.date)}
            </span>
          )}
          <span className="text-gray-400">
            {galerie.photos.length} photo{galerie.photos.length > 1 ? 's' : ''}
          </span>
        </div>
        {galerie.description && (
          <p className="mt-4 text-gray-600 max-w-2xl leading-relaxed">
            {galerie.description}
          </p>
        )}
      </div>

      {/* Grille masonry */}
      <div style={{ columns: '3 300px', gap: '8px' }}>
        {galerie.photos.map((photo, index) => {
          const media = typeof photo === 'object' && photo ? photo as Media : null
          if (!media?.url) return null

          return (
            <figure
              key={media.id ?? index}
              style={{ breakInside: 'avoid', marginBottom: '8px' }}
              className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-gray-50 hover:shadow-md transition-shadow"
            >
              <Image
                src={media.url}
                alt={media.alt || galerie.titre}
                width={media.width ?? 800}
                height={media.height ?? 600}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </figure>
          )
        })}
      </div>
    </div>
  )
}
