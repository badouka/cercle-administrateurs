import { getPayload } from 'payload'
import type { Metadata } from 'next'
import type { BlogPost, Media } from '@/payload-types'
import config from '@payload-config'
import { PageHero } from '@/components/PageHero'
import { BlogList, type BlogCard } from './BlogList'

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

export default async function BlogPage() {
  const payload = await getPayload({ config })

  const { docs: posts } = await payload.find({
    collection:     'blog-posts',
    where:          { statut: { equals: 'published' } },
    sort:           '-publie_le',
    depth:          1,
    limit:          50,
    overrideAccess: true,
  })

  const cards: BlogCard[] = (posts as BlogPost[]).map(post => {
    const image = typeof post.image === 'object' && post.image ? (post.image as Media) : null
    return {
      id:        post.id,
      titre:     post.titre,
      href:      post.slug ? `/blog/${post.slug}` : null,
      excerpt:   post.extrait?.trim() || lexicalToExcerpt(post.contenu),
      imageUrl:  image?.url ?? null,
      imageAlt:  image?.alt || post.titre,
      publieLe:  post.publie_le ?? null,
      categorie: post.categorie?.trim() || null,
    }
  })

  const categories = [
    ...new Set(cards.map(c => c.categorie).filter((c): c is string => !!c)),
  ].sort((a, b) => a.localeCompare(b, 'fr'))

  return (
    <div>
      <PageHero title="Blog" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-gray-200 pb-8">
          <p className="mt-2 text-gray-500">
            Articles et réflexions de la communauté du Cercle des Administrateurs Publics.
          </p>
        </div>

        {cards.length === 0 ? (
          <p className="text-gray-500">Aucun article publié pour le moment.</p>
        ) : (
          <BlogList posts={cards} categories={categories} />
        )}
      </div>
    </div>
  )
}
