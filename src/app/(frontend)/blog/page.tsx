import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { BlogPost, Media } from '@/payload-types'
import config from '@payload-config'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = { title: 'Blog' }

function lexicalToExcerpt(content: BlogPost['contenu'], maxChars = 200): string {
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

export default async function BlogPage() {
  const [payload, headers] = await Promise.all([getPayload({ config }), getHeaders()])
  const { user } = await payload.auth({ headers })

  // Réservé aux membres connectés
  if (!user) redirect('/connexion')

  const { docs: posts } = await payload.find({
    collection:     'blog-posts',
    where:          { statut: { equals: 'published' } },
    sort:           '-publie_le',
    depth:          1,
    limit:          50,
    overrideAccess: true,
  })

  return (
    <div>
      <PageHero title="Blog" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-gray-200 pb-8">
          <p className="mt-2 text-gray-500">
            Articles et réflexions de la communauté du Cercle des Administrateurs Publics.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-500">Aucun article publié pour le moment.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(posts as BlogPost[]).map(post => {
              const image   = typeof post.image === 'object' && post.image ? post.image as Media : null
              const excerpt = post.extrait?.trim() || lexicalToExcerpt(post.contenu)
              const href    = post.slug ? `/blog/${post.slug}` : null

              return (
                <article
                  key={post.id}
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
                    {/* Date */}
                    {post.publie_le && (
                      <time dateTime={post.publie_le} className="text-xs text-gray-400">
                        {formatDate(post.publie_le)}
                      </time>
                    )}

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
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
