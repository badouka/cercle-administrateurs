import { getPayload } from 'payload'
import type { Metadata } from 'next'
import type { Post, Media } from '@/payload-types'
import config from '@payload-config'
import { PageHero } from '@/components/PageHero'
import { ActualitesClient, type ActualitePost } from '@/components/ActualitesClient'

export const metadata: Metadata = { title: 'Actualités' }

// Extrait un texte court (max maxChars) d'un contenu richText Lexical.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lexicalToExcerpt(content: any, maxChars = 200): string {
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

export default async function ActualitesPage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'posts',
    where:          { statut: { equals: 'publie' } },
    depth:          1,
    limit:          50,
    sort:           '-publie_le',
    overrideAccess: true,
  })

  const posts: ActualitePost[] = (docs as Post[]).map(p => {
    const image = p.image && typeof p.image === 'object' ? (p.image as Media) : null
    return {
      id: p.id,
      titre: p.titre,
      slug: p.slug ?? null,
      excerpt: lexicalToExcerpt(p.contenu, 200),
      image: image?.filename ?? null,
      categorie: p.categorie ?? null,
      type: p.categorie ?? null,
      date: formatDateFr(p.publie_le),
    }
  })

  return (
    <div>
      <PageHero
        title="La vie du Cercle"
        subtitle="Toute l'actualité du Cercle des Administrateurs Publics : décisions, partenariats et temps forts."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Actualités', href: '/actualites' },
        ]}
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <ActualitesClient posts={posts} />
        </div>
      </section>
    </div>
  )
}
