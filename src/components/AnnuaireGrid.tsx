'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, User } from 'lucide-react'
import type { Membre, Media } from '@/payload-types'

interface AnnuaireGridProps {
  membres: Membre[]
}

function normalizeStr(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function AnnuaireGrid({ membres }: AnnuaireGridProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = normalizeStr(query.trim())
    if (!q) return membres
    return membres.filter(m => {
      const nom       = normalizeStr(`${m.prenom} ${m.nom}`)
      const organisme = normalizeStr(m.poste?.organisme ?? '')
      return nom.includes(q) || organisme.includes(q)
    })
  }, [membres, query])

  return (
    <div>
      {/* Barre de recherche */}
      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Rechercher par nom ou organisme…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-cap-600 focus:outline-none focus:ring-2 focus:ring-cap-600/20"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun membre ne correspond à votre recherche.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">
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
                  className="group flex flex-col items-center rounded-xl border border-gray-200 p-5 text-center hover:border-cap-600 hover:shadow-md transition-all"
                >
                  {/* Avatar */}
                  <div className="mb-3 h-20 w-20 shrink-0 overflow-hidden rounded-full bg-cap-100 ring-2 ring-cap-200 group-hover:ring-cap-600 transition-all">
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
                        <User size={32} className="text-cap-500" />
                      </div>
                    )}
                  </div>

                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {membre.prenom} {membre.nom}
                  </p>
                  {membre.poste?.titre && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">{membre.poste.titre}</p>
                  )}
                  {membre.poste?.organisme && (
                    <p className="mt-0.5 text-xs font-medium text-cap-700 line-clamp-1">
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
