import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User, Membre } from '@/payload-types'
import config from '@payload-config'
import { Users, ArrowLeft, FileText, ExternalLink } from 'lucide-react'
import type { Media } from '@/payload-types'
import { MembreActionButtons, MembreInfoLink, type MembreInfo } from '../MembreActionButtons'
import { MembresTableClient } from '@/components/MembresTableClient'

export const metadata: Metadata = { title: 'Gestion des membres' }

function formatDate(d: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

function getJustificatifUrl(m: Membre): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const j = (m as any).justificatif
  if (!j) return null
  if (typeof j === 'object' && j.url) return (j as Media).url ?? null
  return null
}

function buildMembreInfo(m: Membre): MembreInfo {
  const photo = typeof m.photo === 'object' && m.photo ? (m.photo as Media) : null
  return {
    prenom:                  m.prenom,
    nom:                     m.nom,
    genre:                   m.genre,
    email:                   typeof m.user === 'object' && m.user ? m.user.email : null,
    fonctionProfessionnelle: m.poste?.fonctionProfessionnelle,
    organisme:               m.poste?.organisme,
    siteOrganisme:           m.poste?.siteOrganisme,
    telephone:               m.coordonnees?.telephone,
    telephoneSecondaire:     m.coordonnees?.telephoneSecondaire,
    photoUrl:                photo?.url ?? null,
  }
}

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
    <div className="mx-auto max-w-5xl px-4 py-10 pt-24 sm:px-6 lg:px-8 space-y-8">

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
            {(pending as Membre[]).map(m => {
              const justifUrl = getJustificatifUrl(m)
              return (
                <li key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black">{m.prenom} {m.nom}</p>
                    {m.poste?.organisme && (
                      <p className="text-xs text-gray-600 mt-0.5">{m.poste.posteCap ? `${m.poste.posteCap} — ` : ''}{m.poste.organisme}</p>
                    )}
                    {m.adhesion?.numeroAdhesion && (
                      <p className="text-xs text-gray-400 font-mono mt-0.5">N° {m.adhesion.numeroAdhesion}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Inscrit le {formatDate(m.createdAt)}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      {justifUrl && (
                        <a
                          href={justifUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-black underline underline-offset-2 hover:text-gray-600 transition-colors"
                        >
                          <FileText size={11} />
                          Voir le justificatif
                          <ExternalLink size={10} />
                        </a>
                      )}
                      <MembreInfoLink nom={`${m.prenom} ${m.nom}`} info={buildMembreInfo(m)} />
                    </div>
                  </div>
                  <MembreActionButtons membreId={m.id} nom={`${m.prenom} ${m.nom}`} />
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* ── Tous les membres ── */}
      <section>
        <h2 className="text-base font-bold text-black border-b-2 border-black pb-3 mb-4">
          Tous les membres
        </h2>

        <MembresTableClient membres={membres as Membre[]} />
      </section>
    </div>
  )
}
