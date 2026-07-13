import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Post, Media } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, Calendar, Tag, Download } from 'lucide-react'
import { ShareButtons } from '@/components/ShareButtons'
import { PageHero } from '@/components/PageHero'
import GaleriePost from '@/components/GaleriePost'

import { lexicalToHtml } from '@/lib/lexical-to-html'

// Image de couverture de l'article (champ « image »).
function coverImage(post: Post): Media | null {
  return post.image && typeof post.image === 'object' ? (post.image as Media) : null
}

// Images supplémentaires de la galerie (champ « images ») qui défilent dans l'article.
function galleryImages(post: Post): Media[] {
  return (post.images ?? [])
    .map(item => (item.image && typeof item.image === 'object' ? (item.image as Media) : null))
    .filter((m): m is Media => m !== null)
}

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

  const image   = coverImage(post)
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

  const cover = coverImage(post)
  const galerie = galleryImages(post).filter(m => !!m.url)
  const htmlBody = lexicalToHtml(post.contenu)
  const catLabel = CATEGORIE_LABELS[post.categorie] ?? post.categorie

  const documents = (post.documents ?? [])
    .map(doc => {
      const fichier = typeof doc.fichier === 'object' && doc.fichier ? (doc.fichier as Media) : null
      return fichier?.url ? { id: doc.id, titre: doc.titre, url: fichier.url } : null
    })
    .filter((d): d is { id: string | null | undefined; titre: string; url: string } => d !== null)

  // Articles de la même catégorie (hors article courant) pour la sidebar.
  const { docs: liesDocs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { categorie: { equals: post.categorie } },
        { slug: { not_equals: slug } },
        { statut: { equals: 'publie' } },
      ],
    },
    depth:          1,
    limit:          3,
    sort:           '-publie_le',
    overrideAccess: true,
  })

  const articlesLies = (liesDocs as Post[]).map(a => ({
    id:            a.id,
    slug:          a.slug,
    titre:         a.titre,
    date:          formatDate(a.publie_le),
    imageUrl:      coverImage(a)?.url ?? null,
  }))
  const hasSidebar = articlesLies.length > 0

  return (
    <div>
      <PageHero
        title={post.titre}
        subtitle={undefined}
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Actualités', href: '/actualites' },
          { label: post.titre, href: `/actualites/${post.slug}` },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">

      {/* ── Back link ── */}
      <Link
        href="/actualites"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Retour aux actualités
      </Link>

      <div className={hasSidebar ? 'grid gap-8 lg:grid-cols-[1fr_270px]' : 'grid grid-cols-1 gap-8'}>

        {/* ── Colonne gauche : article ── */}
        <article className="min-w-0">

          {/* ── Image de couverture ── */}
          {cover?.url ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-8">
              <Image
                src={cover.url}
                alt={cover.alt || post.titre}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 850px"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-8">
              <span className="text-4xl font-bold text-gray-200 select-none tracking-widest">CAP</span>
            </div>
          )}

          {/* ── Galerie d'images (miniatures + lightbox) ── */}
          {galerie.length > 0 && (
            <div className="mb-8">
              <GaleriePost photos={galerie} titre={post.titre} />
            </div>
          )}

          {/* ── Contenu de l'article ── */}
          <div className="bg-white rounded-xl p-8 border border-[#14110B]/10">

            {/* Catégorie + date */}
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

            {/* Title */}
            <h1 className="text-3xl font-bold text-black leading-tight mb-8 sm:text-4xl">
              {post.titre}
            </h1>

            {/* Content */}
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: htmlBody }}
            />

            {/* Documents associés */}
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
          </div>

          {/* ── Separator + share ── */}
          <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
            <ShareButtons title={post.titre} path={`/actualites/${post.slug}`} />
          </div>

        </article>

        {/* ── Colonne droite : sidebar « À lire aussi » ── */}
        {hasSidebar && (
          <aside>
            <div className="relative overflow-hidden rounded-xl bg-[#FAF8F3] p-4 sticky top-24">
              <div className="relative z-10">
                {/* En-tête */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-0.5 w-6 bg-[#C8A24A]" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#1a7a3a]">
                    À lire aussi
                  </span>
                </div>

                {/* Liste des articles liés */}
                <div className="grid gap-3">
                  {articlesLies.map(a => (
                    <Link
                      key={a.id}
                      href={`/actualites/${a.slug}`}
                      className="grid grid-cols-[70px_1fr] overflow-hidden rounded-lg border border-[#14110B]/10 bg-white transition-colors hover:bg-[#FAF8F3]"
                    >
                      {/* Image */}
                      <div className="relative w-[70px] flex-none overflow-hidden bg-[#FAF8F3]" style={{ minHeight: '70px' }}>
                        {a.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.imageUrl}
                            alt={a.titre}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[#EEF6F1]" />
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="p-2">
                        {a.date && (
                          <p className="text-[10px] text-[#14110B]/50">{a.date}</p>
                        )}
                        <p className="line-clamp-2 text-[11px] font-bold leading-snug text-[#14110B]">
                          {a.titre}
                        </p>
                        <span className="text-[10px] font-semibold text-[#1a7a3a]">Lire →</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Bouton */}
                <Link
                  href="/actualites"
                  className="mt-3 block w-full rounded-lg bg-[#1a7a3a] py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#1a7a3a]/90"
                >
                  Toutes les actualités →
                </Link>
              </div>
            </div>
          </aside>
        )}

      </div>

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
    </div>
  )
}
