import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Activity, Media } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, CalendarDays, MapPin, Users, Download } from 'lucide-react'
import { lexicalToHtml } from '@/lib/lexical-to-html'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr))
}

const TYPE_CONFIG = {
  atelier:   { label: 'Atelier' },
  seminaire: { label: 'Séminaire' },
}

const STATUT_CONFIG = {
  a_venir:  { label: 'À venir',  cls: 'bg-black text-white' },
  en_cours: { label: 'En cours', cls: 'bg-gray-700 text-white' },
  termine:  { label: 'Terminé',  cls: 'bg-[#F5F5F5] text-gray-500' },
}

// ─── Static params (ISR/SSG) ──────────────────────────────────────────────────

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection:     'activities',
    select:         { slug: true },
    limit:          1000,
    overrideAccess: true,
  })
  return docs.filter(a => a.slug).map(a => ({ slug: a.slug as string }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload  = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'activities',
    where:          { slug: { equals: slug } },
    depth:          1,
    limit:          1,
    overrideAccess: true,
  })

  const activite = docs[0] as Activity | undefined
  if (!activite) return { title: 'Activité non trouvée — CAP' }

  const image = typeof activite.image === 'object' && activite.image ? (activite.image as Media) : null

  return {
    title: `${activite.titre} — CAP`,
    openGraph: {
      title: activite.titre,
      type:  'article',
      images: image?.url
        ? [{ url: image.url, alt: image.alt, width: image.width ?? undefined, height: image.height ?? undefined }]
        : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ActiviteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload  = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'activities',
    where:          { slug: { equals: slug } },
    depth:          1,
    limit:          1,
    overrideAccess: true,
  })

  const activite = docs[0] as Activity | undefined
  if (!activite) notFound()

  const image        = typeof activite.image === 'object' && activite.image ? (activite.image as Media) : null
  const typeConfig   = activite.type ? TYPE_CONFIG[activite.type] : null
  const statutConfig = STATUT_CONFIG[activite.statut]
  const htmlBody     = lexicalToHtml(activite.description)
  const documents    = (activite.documents ?? []).filter(
    (d): d is typeof d & { fichier: Media } => typeof d.fichier === 'object' && d.fichier !== null,
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">

      {/* ── Back link ── */}
      <Link
        href="/activites"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Retour aux activités
      </Link>

      <article>

        {/* ── Featured image ── */}
        {image?.url ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-8">
            <Image
              src={image.url}
              alt={image.alt || activite.titre}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ) : (
          <div className="aspect-video rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-8">
            <span className="text-4xl font-bold text-gray-200 select-none tracking-widest">CAP</span>
          </div>
        )}

        {/* ── Badges ── */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {typeConfig && (
            <span className="rounded-full bg-[#F5F5F5] px-2.5 py-0.5 text-xs font-medium text-gray-700">
              {typeConfig.label}
            </span>
          )}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statutConfig.cls}`}>
            {statutConfig.label}
          </span>
        </div>

        {/* ── Title ── */}
        <h1 className="text-3xl font-bold text-black leading-tight mb-6 sm:text-4xl">
          {activite.titre}
        </h1>

        {/* ── Méta ── */}
        <ul className="space-y-2 text-sm text-gray-500 mb-8">
          <li className="flex items-start gap-2">
            <CalendarDays size={15} className="mt-0.5 shrink-0 text-gray-400" />
            <div>
              <span>{formatDate(activite.date_debut)}</span>
              {activite.date_fin && activite.date_fin !== activite.date_debut && (
                <span className="text-gray-400"> → {formatDateShort(activite.date_fin)}</span>
              )}
            </div>
          </li>
          {activite.lieu && (
            <li className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0 text-gray-400" />
              {activite.lieu}
            </li>
          )}
          {activite.places_disponibles != null && activite.statut === 'a_venir' && (
            <li className="flex items-center gap-2">
              <Users size={15} className="shrink-0 text-gray-400" />
              {activite.places_disponibles} place{activite.places_disponibles > 1 ? 's' : ''} disponible{activite.places_disponibles > 1 ? 's' : ''}
            </li>
          )}
        </ul>

        {/* ── Description ── */}
        {htmlBody && (
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: htmlBody }}
          />
        )}

        {/* ── Documents associés ── */}
        {documents.length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-black mb-3">Documents associés</h2>
            <div className="flex flex-wrap gap-3">
              {documents.map((doc, i) => (
                <a
                  key={doc.id ?? i}
                  href={doc.fichier.url ?? '#'}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  <Download size={15} />
                  {doc.titre}
                </a>
              ))}
            </div>
          </div>
        )}

      </article>

      {/* ── Bottom back link ── */}
      <div className="mt-10">
        <Link
          href="/activites"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={15} />
          Retour aux activités
        </Link>
      </div>
    </div>
  )
}
