import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { BlogForm } from '../BlogForm'

export const metadata: Metadata = { title: 'Nouvel article de blog' }

export default async function NouvelArticleBlogPage() {
  const [payload, headers] = await Promise.all([getPayload({ config }), getHeaders()])
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/connexion')

  const role = (user as User).role
  if (role !== 'gestionnaire' && role !== 'admin') redirect('/dashboard')

  const { docs } = await payload.find({
    collection:     'blog-posts',
    limit:          0,
    depth:          0,
    overrideAccess: true,
  })
  const existingCategories = [
    ...new Set(docs.map(d => d.categorie?.trim()).filter((c): c is string => !!c)),
  ].sort((a, b) => a.localeCompare(b, 'fr'))

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <Link
          href="/gestionnaire/blog"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft size={13} /> Blog
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-black p-3">
            <PlusCircle size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Nouvel article</h1>
            <p className="text-sm text-gray-500">Rédigez et publiez un article de blog sur la plateforme CAP.</p>
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-8">
        <BlogForm existingCategories={existingCategories} />
      </div>
    </div>
  )
}
