'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface BureauCarouselProps {
  membres: Array<{
    id: string
    prenom: string
    nom: string
    slug?: string | null
    photo?: { url?: string | null } | null
    poste?: { posteCap?: string | null; organisme?: string | null } | null
  }>
}

function initiales(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
}

export function BureauCarousel({ membres }: BureauCarouselProps) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-ink/10 lg:grid-cols-[280px_1fr]">
      {/* ── Colonne gauche ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 bg-[#F5F4EF] p-8 sm:p-10">
        {/* Logo CAP */}
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-3 -skew-x-12 bg-[#1a7a3a]" />
          <span className="h-9 w-3 -skew-x-12 bg-[#FCD116]" />
          <span className="ml-1 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-ink">
            CAP
          </span>
        </div>

        <h2 className="font-serif text-3xl font-bold text-ink sm:text-4xl">Le bureau</h2>

        <p className="text-base leading-relaxed text-ink/70">
          Il est composé de onze (11) membres et joue le rôle d&apos;organe exécutif de
          l&apos;Association.
        </p>

        <hr className="border-ink/10" />

        <p className="text-base leading-relaxed text-ink/70">
          L&apos;association regroupe les présidents de conseil d&apos;administration, de
          surveillance ou d&apos;orientation des établissements du secteur parapublic.
        </p>

        <Link
          href="/annuaire"
          className="mt-auto inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#1a7a3a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a7a3a]/90"
        >
          Voir tous les membres
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* ── Colonne droite : carousel ──────────────────────────────────────── */}
      <div className="flex flex-col gap-6 p-8 sm:p-10">
        {membres.length === 0 ? (
          <p className="text-ink/50">Aucun membre du bureau renseigné pour le moment.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {membres.slice(0, 3).map(membre => {
              const photoUrl = membre.photo?.url ?? null
              const posteCap  = membre.poste?.posteCap?.trim()
              const organisme = membre.poste?.organisme?.trim()

              return (
                <Link
                  key={membre.id}
                  href={`/annuaire/${membre.slug || membre.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white"
                >
                  <div className="h-[380px] w-full shrink-0 overflow-hidden bg-ink/5">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={`${membre.prenom} ${membre.nom}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-ink/10">
                        <span className="font-serif text-5xl font-medium text-ink/30">
                          {initiales(membre.prenom, membre.nom)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 bg-white p-4">
                    <p className="font-serif text-base font-bold text-ink">
                      {membre.prenom} {membre.nom}
                    </p>
                    {posteCap && <p className="text-xs text-ink/50">{posteCap}</p>}
                    {organisme && <p className="text-xs text-ink/50">{organisme}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
