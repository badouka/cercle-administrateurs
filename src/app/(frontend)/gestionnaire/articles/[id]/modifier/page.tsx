import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User, Post, Media } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, Pencil } from 'lucide-react'
import { ArticleForm } from '../../ArticleForm'
import { lexicalToHtml } from '@/lib/lexical-to-html'

export const metadata: Metadata = { title: "Modifier l'article" }

export default async function ModifierArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [payload, headers] = await Promise.all([getPayload({ config }), getHeaders()])
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/connexion')

  const role = (user as User).role
  if (role !== 'gestionnaire' && role !== 'admin') redirect('/dashboard')

  const postId = Number(id)
  if (!postId) notFound()

  let post: Post
  try {
    post = await payload.findByID({
      collection:     'posts',
      id:             postId,
      depth:          1,
      overrideAccess: true,
    }) as Post
  } catch {
    notFound()
  }

  const image       = typeof post.image === 'object' && post.image ? (post.image as Media) : null
  const htmlContent = lexicalToHtml(post.contenu)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <Link
          href="/gestionnaire/articles"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft size={13} /> Articles
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-black p-3">
            <Pencil size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black truncate max-w-lg">{post.titre}</h1>
            <p className="text-sm text-gray-500">Modifier cet article</p>
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-8">
        <ArticleForm
          postId={postId}
          initialValues={{
            titre:     post.titre,
            contenu:   htmlContent,
            categorie: post.categorie,
            statut:    post.statut,
            imageId:   image?.id,
            imageUrl:  image?.url ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
