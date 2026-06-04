'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Post, Media } from '@/payload-types'
import { ShareButtons } from '@/components/ShareButtons'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lexicalToExcerpt(content: Post['contenu'], maxChars = 200): string {
  try {
    let text = ''
    for (const node of content?.root?.children ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const child of ((node as any).children ?? []) as any[]) {
        if (typeof child.text === 'string') text += child.text + ' '
      }
      if (text.length >= maxChars) break
    }
    const t = text.trim()
    return t.length > maxChars ? t.slice(0, maxChars).trimEnd() + '…' : t
  } catch {
    return ''
  }
}

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

type FilterValue = 'tous' | 'actualites' | 'ateliers_seminaires'

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'Tous',                  value: 'tous' },
  { label: 'Actualités',            value: 'actualites' },
  { label: 'Ateliers & Séminaires', value: 'ateliers_seminaires' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function ActualitesGrid({ posts }: { posts: Post[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('tous')

  const filtered = activeFilter === 'tous'
    ? posts
    : posts.filter(p => p.categorie === activeFilter)

  return (
    <>
      {/* Filtres */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={
              activeFilter === f.value
                ? 'rounded-full px-4 py-1.5 text-sm font-medium bg-black text-white'
                : 'rounded-full px-4 py-1.5 text-sm font-medium border border-gray-300 text-black hover:border-gray-500 transition-colors'
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">Aucun article dans cette catégorie.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(post => {
            const image   = typeof post.image === 'object' && post.image ? post.image as Media : null
            const excerpt = lexicalToExcerpt(post.contenu)
            const href    = post.slug ? `/actualites/${post.slug}` : null

            return (
              <article
                key={post.id}
                id={`article-${post.id}`}
                className="flex flex-col rounded-xl border border-[#E5E5E5] bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                {image?.url ? (
                  href ? (
                    <Link href={href} className="block relative aspect-video bg-gray-100">
                      <Image
                        src={image.url}
                        alt={image.alt || post.titre}
                        fill
                        className="object-cover hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </Link>
                  ) : (
                    <div className="relative aspect-video bg-gray-100">
                      <Image
                        src={image.url}
                        alt={image.alt || post.titre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )
                ) : (
                  href ? (
                    <Link href={href} className="block aspect-video bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <span className="text-3xl font-bold text-gray-300 select-none">CAP</span>
                    </Link>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-300 select-none">CAP</span>
                    </div>
                  )
                )}

                <div className="flex flex-col flex-1 p-5 gap-3">
                  {/* Catégorie + date */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-[#F5F5F5] px-2.5 py-0.5 font-medium text-gray-700">
                      {CATEGORIE_LABELS[post.categorie] ?? post.categorie}
                    </span>
                    {post.publie_le && (
                      <>
                        <span className="text-gray-300">·</span>
                        <time dateTime={post.publie_le} className="text-gray-400">
                          {formatDate(post.publie_le)}
                        </time>
                      </>
                    )}
                  </div>

                  {/* Titre */}
                  {href ? (
                    <Link href={href}>
                      <h2 className="text-base font-semibold text-black leading-snug hover:text-gray-700 transition-colors">
                        {post.titre}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className="text-base font-semibold text-black leading-snug">
                      {post.titre}
                    </h2>
                  )}

                  {/* Extrait */}
                  {excerpt && (
                    <p className="text-sm text-gray-600 flex-1 line-clamp-3 leading-relaxed">
                      {excerpt}
                    </p>
                  )}

                  {/* Lire la suite */}
                  {href && (
                    <Link
                      href={href}
                      className="text-xs font-semibold text-black underline underline-offset-2 hover:text-gray-600 transition-colors self-start"
                    >
                      Lire l'article →
                    </Link>
                  )}

                  {/* Boutons de partage */}
                  <div className="pt-3 border-t border-gray-100">
                    <ShareButtons
                      title={post.titre}
                      path={href ?? `/actualites#article-${post.id}`}
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
