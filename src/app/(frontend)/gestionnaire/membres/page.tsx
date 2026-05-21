import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User, Membre } from '@/payload-types'
import config from '@payload-config'
import { Users, ArrowLeft } from 'lucide-react'
import { MembreActionButtons } from '../MembreActionButtons'

export const metadata: Metadata = { title: 'Gestion des membres' }

function formatDate(d: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

const STATUT_CONFIG = {
  actif:     { label: 'Actif',      cls: 'bg-black text-white' },
  inactif:   { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
  suspendu:  { label: 'Suspendu',   cls: 'bg-red-100 text-red-700' },
} as const

export default async function MembreManagementPage() {
  const [payload, headers] = await Promise.all([getPayload({ config }), getHeaders()])
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/connexion')

  const role = (user as User).role
  if (role !== 'gestionnaire' && role !== 'admin') redirect('/dashboard')

  const { docs: membres, totalDocs } = await payload.find({
    collection:     'membres',
    sort:           '-createdAt',
    limit:          200,
    depth:          1,
    overrideAccess: true,
  })

  const pending  = membres.filter(m => m.adhesion?.statut === 'inactif')
  const actifs   = membres.filter(m => m.adhesion?.statut === 'actif')
  const suspendus = membres.filter(m => m.adhesion?.statut === 'suspendu')

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
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-black p-3">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Membres</h1>
            <p className="text-sm text-gray-500">{totalDocs} membre{totalDocs > 1 ? 's' : ''} au total</p>
          </div>
        </div>
      </div>

      {/* ── Stats rapides ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Actifs',      count: actifs.length,    cls: 'border-[#E5E5E5]' },
          { label: 'En attente',  count: pending.length,   cls: pending.length > 0 ? 'border-yellow-300 bg-yellow-50' : 'border-[#E5E5E5]' },
          { label: 'Suspendus',   count: suspendus.length, cls: suspendus.length > 0 ? 'border-red-200 bg-red-50' : 'border-[#E5E5E5]' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.cls}`}>
            <p className="text-xl font-bold text-black">{s.count}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Membres en attente ── */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-black border-b-2 border-black pb-3 mb-4">
            En attente de validation ({pending.length})
          </h2>
          <ul className="divide-y divide-gray-100 rounded-xl border border-yellow-200 bg-yellow-50 overflow-hidden">
            {(pending as Membre[]).map(m => (
              <li key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-black">{m.prenom} {m.nom}</p>
                  {m.poste?.organisme && (
                    <p className="text-xs text-gray-600 mt-0.5">{m.poste.titre ? `${m.poste.titre} — ` : ''}{m.poste.organisme}</p>
                  )}
                  {m.adhesion?.numeroAdhesion && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">N° {m.adhesion.numeroAdhesion}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Inscrit le {formatDate(m.createdAt)}</p>
                </div>
                <MembreActionButtons membreId={m.id} nom={`${m.prenom} ${m.nom}`} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Tous les membres ── */}
      <section>
        <h2 className="text-base font-bold text-black border-b-2 border-black pb-3 mb-4">
          Tous les membres
        </h2>

        {membres.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun membre enregistré.</p>
        ) : (
          <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#F9F9F9]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Membre</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organisme</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N° Adhésion</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(membres as Membre[]).map(m => {
                    const statut = STATUT_CONFIG[m.adhesion?.statut ?? 'inactif']
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-black">{m.prenom} {m.nom}</p>
                          {m.poste?.titre && (
                            <p className="text-xs text-gray-400 mt-0.5">{m.poste.titre}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          {m.poste?.organisme ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono text-gray-500">
                          {m.adhesion?.numeroAdhesion ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {m.adhesion?.dateAdhesion
                            ? formatDate(m.adhesion.dateAdhesion)
                            : formatDate(m.createdAt)
                          }
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statut.cls}`}>
                            {statut.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {m.adhesion?.statut === 'inactif' && (
                            <MembreActionButtons membreId={m.id} nom={`${m.prenom} ${m.nom}`} />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
