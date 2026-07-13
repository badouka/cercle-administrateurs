'use client'

import { useMemo, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocMedia {
  url?: string | null
  filename?: string | null
  filesize?: number | null
}

interface Doc {
  id: number | string
  titre: string
  categorie: string
  acces: string
  createdAt: string
  fichier?: DocMedia | null
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIE_FILTERS = [
  { value: 'all',                   label: 'Tous' },
  { value: 'textes_statutaires',    label: 'Textes statutaires' },
  { value: 'textes_reglementaires', label: 'Textes réglementaires' },
  { value: 'pv_reunion',            label: 'PV de réunion' },
  { value: 'ressources',            label: 'Ressources' },
]

const ACCES_FILTERS = [
  { value: 'public',  label: '🌐 Public' },
  { value: 'membres', label: '🔒 Membres' },
]

const CATEGORIE_BADGE: Record<string, { label: string; className: string }> = {
  textes_statutaires:        { label: 'Statutaire',     className: 'bg-[#1a7a3a]/15 text-[#1a7a3a]' },
  textes_reglementaires:     { label: 'Réglementaire',  className: 'bg-[#FCD116]/20 text-[#b8870a]' },
  pv_reunion:                { label: 'PV Réunion',     className: 'bg-ink/10 text-ink/60' },
  ressources:                { label: 'Ressource',      className: 'bg-blue-50 text-blue-700' },
  magazines:                 { label: 'Magazine',       className: 'bg-purple-50 text-purple-700' },
  docs_politique_economique: { label: 'Politique éco.', className: 'bg-ink/10 text-ink/60' },
}

const FILE_TYPE_BADGE: Record<string, { label: string; className: string }> = {
  pdf:  { label: 'PDF',  className: 'bg-red-50 text-red-600' },
  doc:  { label: 'DOC',  className: 'bg-indigo-50 text-indigo-600' },
  docx: { label: 'DOC',  className: 'bg-indigo-50 text-indigo-600' },
  xls:  { label: 'XLSX', className: 'bg-blue-50 text-blue-700' },
  xlsx: { label: 'XLSX', className: 'bg-blue-50 text-blue-700' },
  ppt:  { label: 'PPT',  className: 'bg-orange-50 text-orange-600' },
  pptx: { label: 'PPT',  className: 'bg-orange-50 text-orange-600' },
}

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

function formatFilesize(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024)        return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function getCategorieBadge(categorie: string) {
  return CATEGORIE_BADGE[categorie] ?? { label: categorie, className: 'bg-ink/10 text-ink/60' }
}

function getFileTypeBadge(filename?: string | null) {
  const ext = (filename?.split('.').pop() ?? '').toLowerCase()
  return FILE_TYPE_BADGE[ext] ?? { label: ext ? ext.toUpperCase() : 'FILE', className: 'bg-ink/10 text-ink/40' }
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function DocCard({ doc, isLoggedIn }: { doc: Doc; isLoggedIn: boolean }) {
  const categorieBadge = getCategorieBadge(doc.categorie)
  const fileBadge      = getFileTypeBadge(doc.fichier?.filename)
  const filesize       = formatFilesize(doc.fichier?.filesize)
  const isLocked       = doc.acces === 'membres' && !isLoggedIn

  const content = (
    <>
      <div className={`flex h-14 w-12 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${fileBadge.className}`}>
        {fileBadge.label}
      </div>
      <div className="min-w-0">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${categorieBadge.className}`}>
          {categorieBadge.label}
        </span>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink">{doc.titre}</p>
        <p className="mt-1 text-xs text-ink/40">
          {formatDate(doc.createdAt)}{filesize && ` · ${filesize}`}
        </p>
      </div>

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 text-xl">
          🔒
        </div>
      )}
    </>
  )

  if (isLocked) {
    return (
      <div className="relative flex cursor-not-allowed items-start gap-3 rounded-xl border border-ink/10 bg-white p-4">
        {content}
      </div>
    )
  }

  return (
    <a
      href={doc.fichier?.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 bg-white p-4 transition-colors hover:border-[#1a7a3a]/30"
    >
      {content}
    </a>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function DocumentsFilter({ docs, isLoggedIn }: { docs: Doc[]; isLoggedIn: boolean }) {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery]        = useState('')

  const categorieCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const doc of docs) counts[doc.categorie] = (counts[doc.categorie] ?? 0) + 1
    return counts
  }, [docs])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return docs.filter(doc => {
      if (selectedFilter === 'public' || selectedFilter === 'membres') {
        if (doc.acces !== selectedFilter) return false
      } else if (selectedFilter !== 'all') {
        if (doc.categorie !== selectedFilter) return false
      }
      if (query && !doc.titre.toLowerCase().includes(query)) return false
      return true
    })
  }, [docs, selectedFilter, searchQuery])

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[220px_1fr] gap-6 px-4 py-8">

      {/* COLONNE GAUCHE — Filtres */}
      <aside className="h-fit rounded-xl border border-ink/10 bg-white p-5">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#1a7a3a]">Filtres</p>

        <p className="mb-2 text-xs font-semibold uppercase text-ink/50">Catégorie</p>
        <ul className="flex flex-col gap-1">
          {CATEGORIE_FILTERS.map(({ value, label }) => {
            const active = selectedFilter === value
            const count  = value === 'all' ? docs.length : (categorieCounts[value] ?? 0)
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => setSelectedFilter(value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    active ? 'bg-[#1a7a3a] font-semibold text-white' : 'text-ink/70 hover:bg-ink/5'
                  }`}
                >
                  <span>{label}</span>
                  <span className={active ? 'rounded-full bg-white px-2 py-0.5 text-xs text-[#1a7a3a]' : 'text-xs text-ink/40'}>
                    {count}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="my-4 border-t border-ink/10" />

        <p className="mb-2 text-xs font-semibold uppercase text-ink/50">Accès</p>
        <ul className="flex flex-col gap-1">
          {ACCES_FILTERS.map(({ value, label }) => {
            const active = selectedFilter === value
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => setSelectedFilter(active ? 'all' : value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    active ? 'bg-[#1a7a3a] font-semibold text-white' : 'text-ink/70 hover:bg-ink/5'
                  }`}
                >
                  <span>{label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* COLONNE DROITE — Recherche + grille */}
      <div>
        <input
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher un document…"
          className="mb-6 w-full rounded-xl border border-ink/10 bg-white px-5 py-3 text-sm focus:border-[#1a7a3a] focus:outline-none"
        />

        {filtered.length === 0 ? (
          <p className="text-ink/50">Aucun document trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map(doc => (
              <DocCard key={doc.id} doc={doc} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
