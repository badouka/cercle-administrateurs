import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Post, Media } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, Calendar, Tag, Download } from 'lucide-react'
import { ShareButtons } from '@/components/ShareButtons'

import { lexicalToHtml } from '@/lib/lexical-to-html'

function lexicalToExcerpt(doc: Post['contenu'], max = 200): string {
  try {
    let text = ''
    for (const node of doc?.root?.children ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const child of ((node as any).children ?? []) as any[]) {
        if (typeof child.text === 'string') text += child.text + ' '
      }
      if (text.length >= max) break
    }
    const t = text.trim()
    return t.length > max ? t.slice(0, max).trimEnd() + '…' : t
  } catch {
    return ''
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

const CATEGORIE_LABELS: Record<string, string> = {
  actualites:          'Actualités',
  ateliers_seminaires: 'Ateliers & Séminaires',
}

// ── Static params (ISR/SSG) ────────────────────────────────────────────────────

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection:     'posts',
    where:          { statut: { equals: 'publie' } },
    select:         { slug: true },
    limit:          1000,
    overrideAccess: true,
  })
  return docs.filter(p => p.slug).map(p => ({ slug: p.slug as string }))
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload  = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'posts',
    where:          { and: [{ slug: { equals: slug } }, { statut: { equals: 'publie' } }] },
    depth:          1,
    limit:          1,
    overrideAccess: true,
  })

  const post = docs[0] as Post | undefined
  if (!post) return { title: 'Article non trouvé — CAP' }

  const image   = typeof post.image === 'object' && post.image ? (post.image as Media) : null
  const excerpt = lexicalToExcerpt(post.contenu)

  return {
    title:       `${post.titre} — CAP`,
    description: excerpt || undefined,
    openGraph: {
      title:         post.titre,
      description:   excerpt || undefined,
      type:          'article',
      publishedTime: post.publie_le ?? undefined,
      images:        image?.url ? [{ url: image.url, alt: image.alt, width: image.width ?? undefined, height: image.height ?? undefined }] : [],
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.titre,
      description: excerpt || undefined,
      images:      image?.url ? [image.url] : [],
    },
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload  = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'posts',
    where:          { and: [{ slug: { equals: slug } }, { statut: { equals: 'publie' } }] },
    depth:          1,
    limit:          1,
    overrideAccess: true,
  })

  const post = docs[0] as Post | undefined
  if (!post) notFound()

  const image    = typeof post.image === 'object' && post.image ? (post.image as Media) : null
  const htmlBody = lexicalToHtml(post.contenu)
  const catLabel = CATEGORIE_LABELS[post.categorie] ?? post.categorie

  const documents = (post.documents ?? [])
    .map(doc => {
      const fichier = typeof doc.fichier === 'object' && doc.fichier ? (doc.fichier as Media) : null
      return fichier?.url ? { id: doc.id, titre: doc.titre, url: fichier.url } : null
    })
    .filter((d): d is { id: string | null | undefined; titre: string; url: string } => d !== null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">

      {/* ── Back link ── */}
      <Link
        href="/actualites"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Retour aux actualités
      </Link>

      <article>

        {/* ── Featured image ── */}
        {image?.url ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-8">
            <Image
              src={image.url}
              alt={image.alt || post.titre}
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

        {/* ── Catégorie + date ── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            <Tag size={10} />
            {catLabel}
          </span>
          {post.publie_le && (
            <time
              dateTime={post.publie_le}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500"
            >
              <Calendar size={13} />
              {formatDate(post.publie_le)}
            </time>
          )}
        </div>

        {/* ── Title ── */}
        <h1 className="text-3xl font-bold text-black leading-tight mb-8 sm:text-4xl">
          {post.titre}
        </h1>

        {/* ── Content ── */}
        <div
          className="article-prose"
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />

        {/* ── Documents associés ── */}
        {documents.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
              Documents associés
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {documents.map(doc => (
                <a
                  key={doc.id ?? doc.url}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2.5 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  <Download size={16} className="shrink-0" />
                  {doc.titre}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Separator + share ── */}
        <div className="mt-12 pt-8 border-t border-gray-200 space-y-4">
          <ShareButtons title={post.titre} path={`/actualites/${post.slug}`} />
        </div>

      </article>

      {/* ── Bottom back link ── */}
      <div className="mt-10">
        <Link
          href="/actualites"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={15} />
          Retour aux actualités
        </Link>
      </div>
    </div>
  )
}
