import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Post, Media } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { ShareButtons } from '@/components/ShareButtons'

// ── Lexical → HTML ─────────────────────────────────────────────────────────────

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderNode(node: any): string {
  if (!node || typeof node !== 'object') return ''

  switch (node.type) {

    case 'root':
      return renderChildren(node.children)

    case 'paragraph': {
      const inner = renderChildren(node.children)
      return inner ? `<p>${inner}</p>` : '<p>&nbsp;</p>'
    }

    case 'heading': {
      const tag = /^h[1-6]$/.test(node.tag ?? '') ? node.tag : 'h2'
      return `<${tag}>${renderChildren(node.children)}</${tag}>`
    }

    case 'text': {
      const fmt  = node.format ?? 0
      let   text = escHtml(node.text ?? '')
      // newline within text node → <br>
      text = text.replace(/\n/g, '<br />')
      if (fmt & 16) return `<code>${text}</code>`
      if (fmt & 1)  text = `<strong>${text}</strong>`
      if (fmt & 2)  text = `<em>${text}</em>`
      if (fmt & 8)  text = `<u>${text}</u>`
      if (fmt & 4)  text = `<s>${text}</s>`
      if (fmt & 32) text = `<sub>${text}</sub>`
      if (fmt & 64) text = `<sup>${text}</sup>`
      return text
    }

    case 'linebreak':
      return '<br />'

    case 'horizontalrule':
      return '<hr />'

    case 'link':
    case 'autolink': {
      // Payload Lexical stores url in node.url or node.fields.url
      const url  = escHtml(node.url ?? node.fields?.url ?? '#')
      const attr = node.newTab || node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${url}"${attr}>${renderChildren(node.children)}</a>`
    }

    case 'list': {
      const tag   = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${renderChildren(node.children)}</${tag}>`
    }

    case 'listitem':
      return `<li>${renderChildren(node.children)}</li>`

    case 'quote':
      return `<blockquote>${renderChildren(node.children)}</blockquote>`

    case 'code': {
      const lang = node.language ? ` class="language-${escHtml(node.language)}"` : ''
      return `<pre><code${lang}>${renderChildren(node.children)}</code></pre>`
    }

    case 'upload': {
      // Inline uploaded image in content
      const media = node.value
      if (!media || typeof media !== 'object' || !media.url) return ''
      const alt = escHtml(media.alt ?? '')
      const src = escHtml(media.url)
      return `<figure><img src="${src}" alt="${alt}" loading="lazy" />${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`
    }

    default:
      // Fallback: render children if present, or text
      if (Array.isArray(node.children)) return renderChildren(node.children)
      if (typeof node.text === 'string')  return escHtml(node.text)
      return ''
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderChildren(children: any[] | undefined): string {
  if (!Array.isArray(children)) return ''
  return children.map(renderNode).join('')
}

function lexicalToHtml(doc: Post['contenu']): string {
  try {
    return renderChildren(doc?.root?.children ?? [])
  } catch {
    return ''
  }
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
