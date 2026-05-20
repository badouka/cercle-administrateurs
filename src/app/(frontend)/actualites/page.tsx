import { getPayload } from 'payload'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { Post, Media } from '@/payload-types'
import config from '@payload-config'
import { ShareButtons } from '@/components/ShareButtons'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lexicalToExcerpt(content: Post['contenu'], maxChars = 200): string {
  try {
    let text = ''
    for (const node of content?.root?.children ?? []) {
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

const CATEGORIE_COLORS: Record<string, string> = {
  actualites:          'bg-cap-100 text-cap-800',
  ateliers_seminaires: 'bg-gold-500/15 text-amber-800',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Actualités' }

export default async function ActualitesPage() {
  const payload = await getPayload({ config })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { statut: { equals: 'publie' } },
    sort: '-publie_le',
    depth: 1,
    limit: 50,
    overrideAccess: true,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* En-tête */}
      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-cap-800">Actualités</h1>
        <p className="mt-2 text-gray-500">
          Restez informé des dernières nouvelles du Cercle des Administrateurs Publics.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">Aucun article disponible pour le moment.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => {
            const image   = typeof post.image === 'object' && post.image ? post.image as Media : null
            const excerpt = lexicalToExcerpt(post.contenu)

            return (
              <article
                key={post.id}
                id={`article-${post.id}`}
                className="flex flex-col rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                {image?.url ? (
                  <div className="relative aspect-video bg-gray-100">
                    <Image
                      src={image.url}
                      alt={image.alt || post.titre}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-cap-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-cap-600/30 select-none">CAP</span>
                  </div>
                )}

                <div className="flex flex-col flex-1 p-5 gap-3">
                  {/* Catégorie + date */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-0.5 font-medium ${CATEGORIE_COLORS[post.categorie] ?? 'bg-gray-100 text-gray-600'}`}>
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
                  <h2 className="text-base font-semibold text-gray-900 leading-snug">
                    {post.titre}
                  </h2>

                  {/* Extrait */}
                  {excerpt && (
                    <p className="text-sm text-gray-600 flex-1 line-clamp-3 leading-relaxed">
                      {excerpt}
                    </p>
                  )}

                  {/* Boutons de partage */}
                  <div className="pt-3 border-t border-gray-100">
                    <ShareButtons
                      title={post.titre}
                      path={`/actualites#article-${post.id}`}
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
