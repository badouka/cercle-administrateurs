import { getPayload } from 'payload'
import type { Metadata } from 'next'
import type { BlogPost, Media } from '@/payload-types'
import config from '@payload-config'
import { PageHero } from '@/components/PageHero'
import { BlogClient, type BlogPostCard } from '@/components/BlogClient'

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

function formatDateFr(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export default async function BlogPage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'blog-posts',
    where:          { statut: { equals: 'published' } },
    depth:          1,
    limit:          50,
    sort:           '-publie_le',
    overrideAccess: true,
  })

  const posts: BlogPostCard[] = (docs as BlogPost[]).map(post => {
    const image = typeof post.image === 'object' && post.image ? (post.image as Media) : null
    return {
      id: post.id,
      titre: post.titre,
      slug: post.slug ?? null,
      excerpt: post.extrait?.trim() || lexicalToExcerpt(post.contenu),
      image: image?.filename ?? null,
      categorie: post.categorie?.trim() || null,
      date: formatDateFr(post.publie_le),
    }
  })

  return (
    <div>
      <PageHero
        title="Blog"
        subtitle="Articles et réflexions de la communauté du Cercle des Administrateurs Publics."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Blog', href: '/blog' },
        ]}
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <BlogClient posts={posts} />
        </div>
      </section>
    </div>
  )
}
