'use client'

import { useMemo, useState } from 'react'
import { Download, LockOpen, Lock } from 'lucide-react'

export interface DocumentItem {
  id: string | number
  titre: string
  slug?: string | null
  description?: string | null
  categorie: string
  acces: string // 'public' | 'membres'
  fileType?: string | null // ex. "PDF" — sûr à exposer
  filename?: string | null // uniquement pour les documents publics (téléchargement)
  url?: string | null // URL Blob directe — uniquement pour les documents publics
  createdAt?: string | null
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'textes_statutaires', label: 'Textes statutaires' },
  { value: 'textes_reglementaires', label: 'Textes réglementaires' },
  { value: 'pv_reunion', label: 'PV de réunion' },
  { value: 'ressources', label: 'Ressources' },
  { value: 'docs_politique_economique', label: 'Politique économique' },
]

const BADGE: Record<string, { label: string; cls: string }> = {
  textes_statutaires: { label: 'Statutaire', cls: 'bg-[#EEF6F1] text-[#1a7a3a]' },
  textes_reglementaires: { label: 'Réglementaire', cls: 'bg-[#FAF4E0] text-[#8A6E18]' },
  pv_reunion: { label: 'PV Réunion', cls: 'bg-[#FAF8F3] text-[#14110B]/60' },
  ressources: { label: 'Ressource', cls: 'bg-blue-50 text-blue-700' },
  docs_politique_economique: { label: 'Politique éco.', cls: 'bg-amber-50 text-amber-700' },
  magazines: { label: 'Magazine', cls: 'bg-purple-50 text-purple-700' },
}

export function DocumentsClient({
  documents,
  isLoggedIn = false,
}: {
  documents: DocumentItem[]
  isLoggedIn?: boolean
}) {
  const [q, setQ] = useState('')
  const [activeCategorie, setActiveCategorie] = useState('all')
  const [activeAcces, setActiveAcces] = useState<'public' | 'membres'>('public')

  // Filtre par accès : "public" → publics seulement ; "membres" → tous.
  const parAcces = useMemo(
    () => documents.filter(d => (activeAcces === 'public' ? d.acces === 'public' : true)),
    [documents, activeAcces],
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: parAcces.length }
    for (const cat of CATEGORIES) c[cat.value] = parAcces.filter(d => d.categorie === cat.value).length
    return c
  }, [parAcces])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return parAcces.filter(d => {
      if (activeCategorie !== 'all' && d.categorie !== activeCategorie) return false
      if (!query) return true
      return `${d.titre} ${d.description ?? ''}`.toLowerCase().includes(query)
    })
  }, [parAcces, activeCategorie, q])

  const catBtn = (active: boolean) =>
    `flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
      active ? 'bg-[#1a7a3a] font-semibold text-white' : 'text-[#14110B]/60 hover:bg-[#FAF8F3]'
    }`
  const countBadge = (active: boolean) =>
    `text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-[#FAF8F3] text-[#14110B]/40'}`
  const accesBtn = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
      active ? 'bg-[#EEF6F1] font-semibold text-[#1a7a3a]' : 'text-[#14110B]/60 hover:bg-[#FAF8F3]'
    }`

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[250px_1fr]">
      {/* ── Sidebar filtres ─────────────────────────────────────────────── */}
      <aside className="rounded-xl border border-[#14110B]/10 bg-white p-5 lg:sticky lg:top-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#C8A24A] font-bold">Filtres</p>

        <p className="mb-2 text-[10px] font-bold uppercase text-[#14110B]/40">Catégorie</p>
        <div className="flex flex-col gap-1">
          <button type="button" onClick={() => setActiveCategorie('all')} className={catBtn(activeCategorie === 'all')}>
            <span>Tous</span>
            <span className={countBadge(activeCategorie === 'all')}>{counts.all}</span>
          </button>
          {CATEGORIES.map(cat => {
            const active = activeCategorie === cat.value
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategorie(cat.value)}
                className={catBtn(active)}
              >
                <span className="text-left">{cat.label}</span>
                <span className={countBadge(active)}>{counts[cat.value] ?? 0}</span>
              </button>
            )
          })}
        </div>

        <div className="my-4 border-t border-[#14110B]/10" />

        <p className="mb-2 text-[10px] font-bold uppercase text-[#14110B]/40">Accès</p>
        <div className="flex flex-col gap-1">
          <button type="button" onClick={() => setActiveAcces('public')} className={accesBtn(activeAcces === 'public')}>
            🌐 Public
          </button>
          <button type="button" onClick={() => setActiveAcces('membres')} className={accesBtn(activeAcces === 'membres')}>
            🔒 Membres
          </button>
        </div>
      </aside>

      {/* ── Liste documents ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Rechercher un document…"
          className="w-full rounded-xl border border-[#14110B]/15 bg-[#FAF8F3] px-5 py-3 text-sm text-[#14110B] placeholder:text-[#14110B]/40 focus:border-[#1a7a3a] focus:outline-none"
        />

        {filtered.length === 0 ? (
          <p className="text-[#14110B]/50">Aucun document dans cette catégorie.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map(d => {
              const badge = BADGE[d.categorie] ?? { label: d.categorie, cls: 'bg-[#FAF8F3] text-[#14110B]/60' }
              return (
                <div
                  key={d.id}
                  className="flex items-start gap-4 rounded-xl border border-[#14110B]/10 bg-white p-4 transition-all hover:border-[#C8A24A]/40 hover:shadow-sm"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-[#EAD79A] bg-[#FAF4E0] text-xs font-black text-[#8A6E18]">
                    {d.fileType || 'DOC'}
                  </span>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    <h3 className="mt-1 line-clamp-2 font-serif text-sm font-semibold text-[#14110B]">
                      {d.titre}
                    </h3>
                    {d.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-[#14110B]/50">{d.description}</p>
                    )}

                    {d.url && (d.acces === 'public' || isLoggedIn) ? (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#1a7a3a] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#1a7a3a]/90"
                      >
                        {d.acces === 'membres' ? <LockOpen size={11} /> : <Download size={12} />} Télécharger
                      </a>
                    ) : d.acces === 'membres' && !isLoggedIn ? (
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#FAF8F3] px-3 py-1.5 text-xs font-semibold text-[#14110B]/40">
                        <Lock size={11} /> Membres
                      </span>
                    ) : (
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#FAF8F3] px-3 py-1.5 text-xs font-semibold text-[#14110B]/40">
                        Indisponible
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
