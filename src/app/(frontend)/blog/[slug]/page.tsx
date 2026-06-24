import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { BlogPost, Media } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, Calendar } from 'lucide-react'
import { ShareButtons } from '@/components/ShareButtons'
import { lexicalToHtml } from '@/lib/lexical-to-html'

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload  = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'blog-posts',
    where:          { and: [{ slug: { equals: slug } }, { statut: { equals: 'published' } }] },
    limit:          1,
    overrideAccess: true,
  })

  const post = docs[0] as BlogPost | undefined
  if (!post) return { title: 'Article non trouvé — CAP' }

  return {
    title:       `${post.titre} — Blog CAP`,
    description: post.extrait || undefined,
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'blog-posts',
    where:          { and: [{ slug: { equals: slug } }, { statut: { equals: 'published' } }] },
    depth:          1,
    limit:          1,
    overrideAccess: true,
  })

  const post = docs[0] as BlogPost | undefined
  if (!post) notFound()

  const image    = typeof post.image === 'object' && post.image ? (post.image as Media) : null
  const htmlBody = lexicalToHtml(post.contenu)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">

      {/* ── Back link ── */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Retour au blog
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

        {/* ── Date ── */}
        {post.publie_le && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <time
              dateTime={post.publie_le}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500"
            >
              <Calendar size={13} />
              {formatDate(post.publie_le)}
            </time>
          </div>
        )}

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
          <ShareButtons title={post.titre} path={`/blog/${post.slug}`} />
        </div>

      </article>

      {/* ── Bottom back link ── */}
      <div className="mt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={15} />
          Retour au blog
        </Link>
      </div>
    </div>
  )
}
