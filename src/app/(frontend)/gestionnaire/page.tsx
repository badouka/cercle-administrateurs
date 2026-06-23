import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User, Membre, Post } from '@/payload-types'
import config from '@payload-config'
import {
  Users, FileText, PlusCircle, Clock, CheckCircle2,
  ChevronRight, Settings2, AlertCircle, ExternalLink, BookOpen, Newspaper,
} from 'lucide-react'
import type { Media } from '@/payload-types'
import { MembreActionButtons } from './MembreActionButtons'
import { PostListActions } from './articles/PostListActions'

export const metadata: Metadata = { title: 'Tableau de bord gestionnaire' }

function formatDate(d: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

const CATEGORIES: Record<string, string> = {
  actualites:           'Actualités',
  ateliers_seminaires:  'Ateliers & Séminaires',
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
    { totalDocs: totalMembres },
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
      limit:          8,
      depth:          1,
      overrideAccess: true,
    }),
    payload.find({
      collection:     'membres',
      where:          { 'adhesion.statut': { equals: 'actif' } },
      limit:          0,
      overrideAccess: true,
    }),
  ])

  const isAdmin = role === 'admin'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

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
        <Link
          href="/gestionnaire/articles/nouveau"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shrink-0"
        >
          <PlusCircle size={15} />
          Nouvel article
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Membres actifs',     value: totalMembres,   icon: CheckCircle2, href: '/gestionnaire/membres' },
          { label: 'En attente',         value: totalEnAttente, icon: Clock,        href: '/gestionnaire/membres', alert: totalEnAttente > 0 },
          { label: 'Articles publiés',   value: totalPosts,     icon: FileText,     href: '/gestionnaire/articles' },
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
          <Link
            href="/gestionnaire/membres"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors"
          >
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
                    {m.poste?.organisme && (
                      <p className="text-xs text-gray-500 mt-0.5">{m.poste.organisme}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Inscrit le {formatDate(m.createdAt)}</p>
                    {justifUrl && (
                      <a
                        href={justifUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-black underline underline-offset-2 hover:text-gray-600 transition-colors"
                      >
                        <FileText size={11} />
                        Voir le justificatif
                        <ExternalLink size={10} />
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
          <h2 className="text-lg font-bold text-black">Articles récents</h2>
          <Link
            href="/gestionnaire/articles"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors"
          >
            Voir tous <ChevronRight size={14} />
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] px-5 py-4">
            <AlertCircle size={18} className="text-gray-400 shrink-0" />
            <p className="text-sm text-gray-500">Aucun article. Créez le premier !</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F9F9F9]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(recentPosts as Post[]).map(post => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-black max-w-[200px] truncate">{post.titre}</td>
                    <td className="hidden sm:table-cell px-5 py-3.5 text-gray-500 text-xs">
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
        )}
      </section>

      {/* ── Pages du site ── */}
      <section>
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <div className="flex items-center gap-2">
            <BookOpen size={17} className="text-black" />
            <h2 className="text-lg font-bold text-black">Pages du site</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: '/gestionnaire/pages/a-propos',         label: 'Qui sommes-nous ?', desc: 'Histoire, mission et valeurs du CAP' },
            { href: '/gestionnaire/pages/mot-du-president', label: 'Mot du Président',  desc: 'Message du Président de l\'association' },
            { href: '/gestionnaire/pages/partenaires',      label: 'Nos partenaires',   desc: 'Liste des partenaires institutionnels' },
          ].map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start gap-3 rounded-xl border border-[#E5E5E5] bg-white px-4 py-4 hover:shadow-sm hover:border-black transition-all"
            >
              <div className="rounded-lg bg-[#F5F5F5] p-2 shrink-0 mt-0.5">
                <FileText size={16} className="text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-black leading-snug">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
              </div>
              <ChevronRight size={14} className="ml-auto text-gray-400 shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Liens rapides ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Accès rapide
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/gestionnaire/membres"
            className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 hover:shadow-sm hover:border-black transition-all"
          >
            <div className="rounded-lg bg-[#F5F5F5] p-2.5">
              <Users size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Gestion des membres</p>
              <p className="text-xs text-gray-500">Approuver, rejeter, consulter les profils</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-400" />
          </Link>
          <Link
            href="/gestionnaire/articles"
            className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 hover:shadow-sm hover:border-black transition-all"
          >
            <div className="rounded-lg bg-[#F5F5F5] p-2.5">
              <FileText size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Gestion des articles</p>
              <p className="text-xs text-gray-500">Créer, modifier, publier des articles</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-400" />
          </Link>
          <Link
            href="/gestionnaire/blog"
            className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 hover:shadow-sm hover:border-black transition-all"
          >
            <div className="rounded-lg bg-[#F5F5F5] p-2.5">
              <Newspaper size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Blog</p>
              <p className="text-xs text-gray-500">Rédiger et publier des articles de blog</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-400" />
          </Link>
        </div>
      </section>
    </div>
  )
}
