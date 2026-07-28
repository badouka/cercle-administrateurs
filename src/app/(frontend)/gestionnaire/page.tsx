import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User, Membre, Post } from '@/payload-types'
import config from '@payload-config'
import {
  FileText, PlusCircle, Clock, CheckCircle2,
  ChevronRight, Settings2, AlertCircle, ExternalLink,
  BookOpen, Newspaper, LayoutTemplate,
} from 'lucide-react'
import type { Media } from '@/payload-types'
import { MembreActionButtons } from './MembreActionButtons'
import { PostListActions } from './articles/PostListActions'
import { BlogListActions } from './blog/BlogListActions'
import { DocumentListActions } from './documents/DocumentListActions'


export const metadata: Metadata = { title: 'Tableau de bord gestionnaire' }

function formatDate(d: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(d))
}

const CATEGORIES: Record<string, string> = {
  actualites:           'Actualités',
  ateliers_seminaires:  'Ateliers & Séminaires',
}

// Table réutilisable pour articles et blogs
function ContentTable({
  items,
  editBase,
  categories,
  canDelete,
  emptyLabel,
}: {
  items: Post[]
  editBase: string
  categories?: Record<string, string>
  canDelete: boolean
  emptyLabel: string
}) {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] px-5 py-4">
        <AlertCircle size={18} className="text-gray-400 shrink-0" />
        <p className="text-sm text-gray-500">{emptyLabel}</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-[#F9F9F9]">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-2/5">Titre</th>
            {categories && <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>}
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Modifié le</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(post => (
            <tr key={post.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-black w-2/5">
                <span className="block truncate max-w-[160px]">{post.titre}</span>
              </td>
              {categories && (
                <td className="hidden sm:table-cell px-5 py-3.5 text-gray-500 text-xs">
                  {categories[post.categorie] ?? post.categorie}
                </td>
              )}
              <td className="px-5 py-3.5">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  post.statut === 'publie'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {post.statut === 'publie' ? 'Publié' : 'Brouillon'}
                </span>
              </td>
              <td className="hidden sm:table-cell px-5 py-3.5 text-gray-400 text-xs">
                {formatDate(post.updatedAt)}
              </td>
              <td className="px-5 py-3.5 text-right">
                <PostListActions
                  postId={post.id}
                  titre={post.titre}
                  statut={post.statut}
                  editHref={`${editBase}/${post.id}/modifier`}
                  canDelete={canDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function GestionnairePage() {
  const [payload, headers] = await Promise.all([getPayload({ config }), getHeaders()])
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/connexion')
  const role = (user as User).role
  if (role !== 'gestionnaire' && role !== 'admin') redirect('/dashboard')

  const [
    { docs: membresEnAttente, totalDocs: totalEnAttente },
    { docs: recentPosts,      totalDocs: totalPosts },
    { docs: recentBlogs,      totalDocs: totalBlogs },
    { docs: recentPages },
    { totalDocs: totalMembres },
    { docs: recentDocs },
  ] = await Promise.all([
    payload.find({
      collection:     'membres',
      where:          { 'adhesion.statut': { equals: 'inactif' } },
      sort:           'createdAt',
      limit:          5,
      depth:          1,
      overrideAccess: true,
    }),
    payload.find({
      collection:     'posts',
      sort:           '-updatedAt',
      limit:          3,
      depth:          0,
      overrideAccess: true,
    }),
    payload.find({
      collection:     'blog-posts',
      sort:           '-updatedAt',
      limit:          3,
      depth:          0,
      overrideAccess: true,
    }),
    payload.find({
      collection:     'pages',
      sort:           '-updatedAt',
      limit:          3,
      depth:          0,
      overrideAccess: true,
    }),
    payload.find({
      collection:     'membres',
      where:          { 'adhesion.statut': { equals: 'actif' } },
      limit:          0,
      overrideAccess: true,
    }),
    payload.find({
      collection:     'documents',
      sort:           '-updatedAt',
      limit:          3,
      depth:          0,
      overrideAccess: true,
    }),

  ])

  const canDelete = role === 'gestionnaire' || role === 'admin'

  return (
    <div className="mx-auto max-w-5xl px-4 pt-24 pb-10 sm:px-6 lg:px-8 space-y-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings2 size={20} className="text-black" />
            <h1 className="text-2xl font-bold text-black">Tableau de bord</h1>
          </div>
          <p className="text-sm text-gray-500">
            Gestion des membres et du contenu de la plateforme CAP.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          <Link
            href="/gestionnaire/documents/nouveau"
            className="inline-flex items-center gap-2 rounded-lg border border-black px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-50 transition-colors"
          >
            <PlusCircle size={15} />
            Nouveau document
          </Link>
          <Link
            href="/gestionnaire/blog/nouveau"
            className="inline-flex items-center gap-2 rounded-lg border border-black px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-50 transition-colors"
          >
            <PlusCircle size={15} />
            Nouvel article blog
          </Link>
          <Link
            href="/gestionnaire/articles/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            <PlusCircle size={15} />
            Nouvel article
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Membres actifs',  value: totalMembres,   icon: CheckCircle2, href: '/gestionnaire/membres' },
          { label: 'En attente',      value: totalEnAttente, icon: Clock,        href: '/gestionnaire/membres', alert: totalEnAttente > 0 },
          { label: 'Articles',        value: totalPosts,     icon: Newspaper,    href: '/gestionnaire/articles' },
          { label: 'Articles blog',   value: totalBlogs,     icon: BookOpen,     href: '/gestionnaire/blog' },
        ].map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-xl border p-5 hover:shadow-sm transition-shadow ${
              stat.alert ? 'border-yellow-300 bg-yellow-50' : 'border-[#E5E5E5] bg-white'
            }`}
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${stat.alert ? 'bg-yellow-100' : 'bg-[#F5F5F5]'}`}>
              <stat.icon size={18} className={stat.alert ? 'text-yellow-700' : 'text-gray-500'} />
            </div>
            <p className={`text-2xl font-bold ${stat.alert ? 'text-yellow-900' : 'text-black'}`}>
              {stat.value}
            </p>
            <p className={`text-xs mt-0.5 ${stat.alert ? 'text-yellow-700' : 'text-gray-500'}`}>
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* ── Membres en attente ── */}
      <section>
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-black">Membres en attente</h2>
            {totalEnAttente > 0 && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                {totalEnAttente}
              </span>
            )}
          </div>
          <Link href="/gestionnaire/membres" className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors">
            Voir tous <ChevronRight size={14} />
          </Link>
        </div>
        {membresEnAttente.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-800">Aucun membre en attente de validation.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
            {(membresEnAttente as Membre[]).map(m => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const j = (m as any).justificatif
              const justifUrl: string | null = j && typeof j === 'object' && j.url ? (j as Media).url ?? null : null
              return (
                <li key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black">{m.prenom} {m.nom}</p>
                    {m.poste?.organisme && <p className="text-xs text-gray-500 mt-0.5">{m.poste.organisme}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">Inscrit le {formatDate(m.createdAt)}</p>
                    {justifUrl && (
                      <a href={justifUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-black underline underline-offset-2 hover:text-gray-600 transition-colors">
                        <FileText size={11} /> Voir le justificatif <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <MembreActionButtons membreId={m.id} nom={`${m.prenom} ${m.nom}`} />
                </li>
              )
            })}
            {totalEnAttente > 5 && (
              <li className="px-5 py-3 bg-gray-50">
                <Link href="/gestionnaire/membres" className="text-xs font-medium text-gray-500 hover:text-black">
                  + {totalEnAttente - 5} autres en attente →
                </Link>
              </li>
            )}
          </ul>
        )}
      </section>

      {/* ── Articles récents ── */}
      <section>
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Newspaper size={17} className="text-black" />
            <h2 className="text-lg font-bold text-black">Articles récents</h2>
          </div>
          <Link href="/gestionnaire/articles" className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors">
            Voir tous <ChevronRight size={14} />
          </Link>
        </div>
        <ContentTable
          items={recentPosts as Post[]}
          editBase="/gestionnaire/articles"
          categories={CATEGORIES}
          canDelete={canDelete}
          emptyLabel="Aucun article. Créez le premier !"
        />
      </section>

      {/* ── Blog récents ── */}
      <section>
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <div className="flex items-center gap-2">
            <BookOpen size={17} className="text-black" />
            <h2 className="text-lg font-bold text-black">Articles blog récents</h2>
          </div>
          <Link href="/gestionnaire/blog" className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors">
            Voir tous <ChevronRight size={14} />
          </Link>
        </div>


        {recentBlogs.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] px-5 py-4">
            <AlertCircle size={18} className="text-gray-400 shrink-0" />
            <p className="text-sm text-gray-500">Aucun article de blog. Créez le premier !</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F9F9F9]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-2/5">Titre</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Modifié le</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(recentBlogs as any[]).map(post => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-black w-2/5">
                      <span className="block truncate max-w-[160px]">{post.titre}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.statut === 'published' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {post.statut === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-5 py-3.5 text-gray-400 text-xs">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <BlogListActions postId={post.id} titre={post.titre} statut={post.statut} canDelete={canDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


      </section>


{/* ── Pages du site ── */}
      <section>
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <div className="flex items-center gap-2">
            <LayoutTemplate size={17} className="text-black" />
            <h2 className="text-lg font-bold text-black">Pages du site</h2>
          </div>
          <Link href="/gestionnaire/pages" className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors">
            Voir toutes <ChevronRight size={14} />
          </Link>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F9F9F9]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Page</th>
                <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Modifiée le</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { slug: 'a-propos',         label: 'Qui sommes-nous ?' },
                { slug: 'mot-du-president', label: 'Mot du Président' },
                { slug: 'partenaires',      label: 'Nos partenaires' },
              ].map(({ slug, label }) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const page = (recentPages as any[]).find(p => p.slug === slug)
                return (
                  <tr key={slug} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-black">{label}</td>
                    <td className="hidden sm:table-cell px-5 py-3.5 text-gray-400 text-xs">
                      {page ? formatDate(page.updatedAt) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/gestionnaire/pages/${slug}`}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-black hover:text-black transition-colors"
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

{/* ── Documents récents ── */}
<section>
  <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
    <div className="flex items-center gap-2">
      <FileText size={17} className="text-black" />
      <h2 className="text-lg font-bold text-black">Documents récents</h2>
    </div>
    <Link href="/gestionnaire/documents" className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors">
      Voir tous <ChevronRight size={14} />
    </Link>
  </div>
  {recentDocs.length === 0 ? (
    <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] px-5 py-4">
      <AlertCircle size={18} className="text-gray-400 shrink-0" />
      <p className="text-sm text-gray-500">Aucun document.</p>
    </div>
  ) : (
    <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-[#F9F9F9]">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
            <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Accès</th>
            <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Modifié le</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(recentDocs as any[]).map(doc => (
            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-black max-w-[180px] truncate">{doc.titre}</td>
              <td className="hidden sm:table-cell px-5 py-3.5 text-gray-500 text-xs">{doc.categorie ?? '—'}</td>
              <td className="px-5 py-3.5">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  doc.acces === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {doc.acces === 'public' ? 'Public' : 'Membres'}
                </span>
              </td>
              <td className="hidden sm:table-cell px-5 py-3.5 text-gray-400 text-xs">
                {formatDate(doc.updatedAt)}
              </td>
              <td className="px-5 py-3.5 text-right">
                <DocumentListActions documentId={doc.id} titre={doc.titre} canDelete={canDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>


    </div>
  )
}