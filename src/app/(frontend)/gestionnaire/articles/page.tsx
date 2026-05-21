import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User, Post } from '@/payload-types'
import config from '@payload-config'
import { FileText, PlusCircle, ArrowLeft } from 'lucide-react'
import { PostListActions } from './PostListActions'

export const metadata: Metadata = { title: 'Gestion des articles' }

function formatDate(d: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

const CATEGORIES: Record<string, string> = {
  actualites:           'Actualités',
  ateliers_seminaires:  'Ateliers & Séminaires',
}

export default async function ArticlesPage() {
  const [payload, headers] = await Promise.all([getPayload({ config }), getHeaders()])
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/connexion')

  const role = (user as User).role
  if (role !== 'gestionnaire' && role !== 'admin') redirect('/dashboard')

  const { docs: posts, totalDocs } = await payload.find({
    collection:     'posts',
    sort:           '-updatedAt',
    limit:          200,
    depth:          1,
    overrideAccess: true,
  })

  const isAdmin   = role === 'admin'
  const publiés   = posts.filter(p => p.statut === 'publie').length
  const brouillons = posts.filter(p => p.statut === 'brouillon').length

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

      {/* ── Header ── */}
      <div>
        <Link
          href="/gestionnaire"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft size={13} /> Tableau de bord
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-black p-3">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Articles</h1>
              <p className="text-sm text-gray-500">{totalDocs} article{totalDocs > 1 ? 's' : ''} au total</p>
            </div>
          </div>
          <Link
            href="/gestionnaire/articles/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shrink-0"
          >
            <PlusCircle size={15} />
            Nouvel article
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',       count: totalDocs,  cls: 'border-[#E5E5E5]' },
          { label: 'Publiés',     count: publiés,    cls: 'border-[#E5E5E5]' },
          { label: 'Brouillons',  count: brouillons, cls: brouillons > 0 ? 'border-gray-300 bg-gray-50' : 'border-[#E5E5E5]' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.cls}`}>
            <p className="text-xl font-bold text-black">{s.count}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Liste ── */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">Aucun article pour le moment</p>
          <p className="text-xs text-gray-400 mt-1">Créez votre premier article pour commencer.</p>
          <Link
            href="/gestionnaire/articles/nouveau"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            <PlusCircle size={14} />
            Créer un article
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F9F9F9]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mis à jour</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(posts as Post[]).map(post => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-black max-w-[240px] truncate">{post.titre}</p>
                      {post.slug && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{post.slug}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {CATEGORIES[post.categorie] ?? post.categorie}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.statut === 'publie'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {post.statut === 'publie' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <PostListActions
                        postId={post.id}
                        titre={post.titre}
                        statut={post.statut}
                        isAdmin={isAdmin}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
