'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Membre } from '@/payload-types'
import { StatutActions, PosteEditButton } from '@/app/(frontend)/gestionnaire/MembreActionButtons'

function formatDate(d: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

export function MembresTableClient({ membres }: { membres: Membre[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return membres
    return membres.filter(m => {
      const prenom    = m.prenom?.toLowerCase() ?? ''
      const nom       = m.nom?.toLowerCase() ?? ''
      const organisme = m.poste?.organisme?.toLowerCase() ?? ''
      return prenom.includes(q) || nom.includes(q) || organisme.includes(q)
    })
  }, [membres, query])

  return (
    <div>
      {/* Recherche */}
      <div className="relative mb-6 w-full max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14110B]/30" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par nom, prénom ou organisme…"
          className="w-full rounded-xl border border-[#14110B]/15 bg-[#FAF8F3] pl-11 pr-5 py-3 text-sm outline-none focus:border-[#14110B]/40 transition-colors"
        />
      </div>

      {membres.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun membre enregistré.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun membre ne correspond à « {query} ».</p>
      ) : (
        <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F9F9F9]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prénom</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organisme</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N° Adhésion</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Poste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#14110B]">{m.prenom}</td>
                    <td className="px-5 py-3.5 font-bold text-[#14110B] uppercase">{m.nom}</td>
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
                      <StatutActions membreId={m.id} statut={m.adhesion?.statut ?? 'inactif'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">
                          {m.poste?.posteCap ?? <span className="text-gray-300">—</span>}
                        </span>
                        <PosteEditButton membreId={m.id} nom={`${m.prenom} ${m.nom}`} currentPoste={m.poste?.posteCap} />
                      </div>
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
