'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface BlogCard {
  id:        number
  titre:     string
  href:      string | null
  excerpt:   string
  imageUrl:  string | null
  imageAlt:  string
  publieLe:  string | null
  categorie: string | null
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

interface Props {
  posts:      BlogCard[]
  categories: string[]
}

export function BlogList({ posts, categories }: Props) {
  const [active, setActive] = useState<string | null>(null)

  const visiblePosts = useMemo(
    () => (active ? posts.filter(p => p.categorie === active) : posts),
    [posts, active],
  )

  return (
    <div>
      {/* Filtres par catégorie */}
      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive(null)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              active === null
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            Tous
          </button>
          {categories.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                active === c
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {visiblePosts.length === 0 ? (
        <p className="text-gray-500">Aucun article dans cette catégorie.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map(post => (
            <article
              key={post.id}
              className="flex flex-col rounded-xl border border-[#E5E5E5] bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {post.imageUrl ? (
                post.href ? (
                  <Link href={post.href} className="block relative aspect-video bg-gray-100">
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt}
                      fill
                      className="object-cover hover:opacity-90 transition-opacity"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </Link>
                ) : (
                  <div className="relative aspect-video bg-gray-100">
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )
              ) : (
                post.href ? (
                  <Link href={post.href} className="block aspect-video bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
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
                <div className="flex flex-wrap items-center gap-2">
                  {post.categorie && (
                    <span className="inline-flex items-center rounded-full bg-[#0B6B3A]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0B6B3A]">
                      {post.categorie}
                    </span>
                  )}
                  {post.publieLe && (
                    <time dateTime={post.publieLe} className="text-xs text-gray-400">
                      {formatDate(post.publieLe)}
                    </time>
                  )}
                </div>

                {/* Titre */}
                {post.href ? (
                  <Link href={post.href}>
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
                {post.excerpt && (
                  <p className="text-sm text-gray-600 flex-1 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                {/* Lire la suite */}
                {post.href && (
                  <Link
                    href={post.href}
                    className="text-xs font-semibold text-black underline underline-offset-2 hover:text-gray-600 transition-colors self-start"
                  >
                    Lire l&apos;article →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
