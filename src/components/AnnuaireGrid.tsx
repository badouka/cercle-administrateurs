'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, User } from 'lucide-react'
import type { Membre, Media } from '@/payload-types'

interface AnnuaireGridProps {
  membres: Membre[]
}

type PosteFilter = 'tous' | 'bureau' | 'membres'
type SortOption  = 'nom-asc' | 'nom-desc' | 'organisme-asc'

const POSTE_FILTERS: { value: PosteFilter; label: string }[] = [
  { value: 'tous',    label: 'Tous' },
  { value: 'bureau',  label: 'Bureau' },
  { value: 'membres', label: 'Membres' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'nom-asc',       label: 'Nom A-Z' },
  { value: 'nom-desc',      label: 'Nom Z-A' },
  { value: 'organisme-asc', label: 'Organisme A-Z' },
]

function normalizeStr(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function isAuBureau(m: Membre): boolean {
  const posteCap = (m.poste?.posteCap ?? '').trim()
  return posteCap !== '' && posteCap !== 'Membre'
}

export function AnnuaireGrid({ membres }: AnnuaireGridProps) {
  const [query,       setQuery]       = useState('')
  const [posteFilter, setPosteFilter] = useState<PosteFilter>('tous')
  const [sort,        setSort]        = useState<SortOption>('nom-asc')

  const filtered = useMemo(() => {
    const q = normalizeStr(query.trim())

    let result = membres.filter(m => {
      if (posteFilter === 'bureau')  return isAuBureau(m)
      if (posteFilter === 'membres') return !isAuBureau(m)
      return true
    })

    if (q) {
      result = result.filter(m => {
        const nom       = normalizeStr(`${m.prenom} ${m.nom}`)
        const organisme = normalizeStr(m.poste?.organisme ?? '')
        return nom.includes(q) || organisme.includes(q)
      })
    }

    return [...result].sort((a, b) => {
      switch (sort) {
        case 'nom-desc':
          return `${b.prenom} ${b.nom}`.localeCompare(`${a.prenom} ${a.nom}`, 'fr', { sensitivity: 'base' })
        case 'organisme-asc':
          return (a.poste?.organisme ?? '').localeCompare(b.poste?.organisme ?? '', 'fr', { sensitivity: 'base' })
        case 'nom-asc':
        default:
          return `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, 'fr', { sensitivity: 'base' })
      }
    })
  }, [membres, query, posteFilter, sort])

  const hasActiveFilters = query.trim() !== '' || posteFilter !== 'tous'

  return (
    <div>
      {/* Barre de recherche + filtres */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Rechercher par nom ou organisme…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {POSTE_FILTERS.map((f, i) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setPosteFilter(f.value)}
                className={`px-3.5 py-2 text-xs font-medium transition-colors ${
                  i > 0 ? 'border-l border-gray-200' : ''
                } ${
                  posteFilter === f.value
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            aria-label="Trier les membres"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {hasActiveFilters ? 'Aucun membre ne correspond à votre recherche.' : 'Aucun membre à afficher.'}
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-6">
            {filtered.length} membre{filtered.length > 1 ? 's' : ''}
            {query.trim() ? ` pour « ${query.trim()} »` : ''}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(membre => {
              const photo = typeof membre.photo === 'object' && membre.photo
                ? (membre.photo as Media)
                : null

              return (
                <Link
                  key={membre.id}
                  href={`/annuaire/${membre.id}`}
                  className="group flex flex-col items-center rounded-xl border border-[#E5E5E5] bg-white p-5 text-center hover:border-black hover:shadow-md transition-all"
                >
                  {/* Avatar */}
                  <div className="mb-3 h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200 group-hover:ring-black transition-all">
                    {photo?.url ? (
                      <Image
                        src={photo.url}
                        alt={`${membre.prenom} ${membre.nom}`}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {membre.prenom} {membre.nom}
                  </p>
                  {(membre.poste?.posteCap || membre.poste?.fonctionProfessionnelle) && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                      {membre.poste.posteCap || membre.poste.fonctionProfessionnelle}
                    </p>
                  )}
                  {membre.poste?.organisme && (
                    <p className="mt-0.5 text-xs font-medium text-gray-700 line-clamp-1">
                      {membre.poste.organisme}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
