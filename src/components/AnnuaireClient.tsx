'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type AnnuaireFiltre = 'tous' | 'bureau' | 'membres'

export interface AnnuaireMembre {
  id: string
  prenom: string
  nom: string
  slug?: string | null
  photo?: string | null // url
  posteCap?: string | null
  fonctionProfessionnelle?: string | null
  organisme?: string | null
  isBureau: boolean
}

function initiales(prenom: string, nom: string): string {
  return `${(prenom ?? '').charAt(0)}${(nom ?? '').charAt(0)}`.toUpperCase()
}

const SEGMENTS: { key: AnnuaireFiltre; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'bureau', label: 'Membres Bureau' },
  { key: 'membres', label: 'Autres Membres' },
]

export function AnnuaireClient({
  membres,
  initialFiltre = 'tous',
  hideBadgeFilter = false,
}: {
  membres: AnnuaireMembre[]
  initialFiltre?: AnnuaireFiltre
  hideBadgeFilter?: boolean
}) {
  const [query, setQuery] = useState('')
  const [filtre, setFiltre] = useState<AnnuaireFiltre>(initialFiltre)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return membres.filter(m => {
      if (filtre === 'bureau' && !m.isBureau) return false
      if (filtre === 'membres' && m.isBureau) return false
      if (!q) return true
      const haystack = `${m.prenom} ${m.nom} ${m.posteCap ?? ''} ${m.organisme ?? ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [membres, query, filtre])

  return (
    <>
      {/* En-tête : recherche + segmented control */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par nom, fonction ou organisme…"
          className="w-full max-w-sm rounded-xl border border-[#14110B]/15 bg-[#FAF8F3] px-5 py-3 text-sm text-[#14110B] placeholder:text-[#14110B]/40 focus:border-[#1a7a3a] focus:outline-none"
        />
        {!hideBadgeFilter && (
          <div className="flex gap-2">
            {SEGMENTS.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => setFiltre(s.key)}
                className={
                  filtre === s.key
                    ? 'rounded-lg bg-[#1a7a3a] px-4 py-2 text-sm font-semibold text-white'
                    : 'rounded-lg bg-[#FAF8F3] px-4 py-2 text-sm text-[#14110B]/60 transition-colors hover:text-[#14110B]'
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mb-6 text-sm text-[#14110B]/50">{filtered.length} membre(s)</p>

      {filtered.length === 0 ? (
        <p className="text-[#14110B]/50">Aucun membre ne correspond à votre recherche.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map(m => (
            <Link
              key={m.id}
              href={`/annuaire/${m.slug || m.id}`}
              className="relative cursor-pointer overflow-hidden rounded-2xl border border-[#14110B]/10 border-t-4 border-t-[#1a7a3a] bg-white transition-all hover:border-[#C8A24A]/50 hover:shadow-md"
            >
              {m.isBureau ? (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-[#1a7a3a] px-2 py-0.5 text-xs font-bold text-white">
                  Bureau
                </span>
              ) : (
                <span className="absolute right-3 top-3 z-10 rounded-full border border-[#14110B]/15 bg-[#FAF8F3] px-2 py-0.5 text-xs text-[#14110B]/50">
                  Membre
                </span>
              )}

              <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#BFDDCD] to-[#EEF6F1]">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photo}
                    alt={`${m.prenom} ${m.nom}`}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-3xl font-bold text-[#1a7a3a]">
                    {initiales(m.prenom, m.nom)}
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="font-serif text-base font-bold leading-tight text-[#062812]">
                  {m.prenom} {m.nom}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#C8A24A]">
                  {m.posteCap && m.posteCap.trim() !== '' ? m.posteCap : 'Membre'}
                </p>
                {m.fonctionProfessionnelle && (
                  <p className="text-xs text-[#14110B]/50 mt-1 italic">{m.fonctionProfessionnelle}</p>
                )}
                {m.organisme && <p className="mt-2 text-sm text-[#14110B]/60">{m.organisme}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
