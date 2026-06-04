'use client'

import { useState } from 'react'
import { FileText, Download, Lock } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentCategorie =
  | 'textes_statutaires'
  | 'textes_reglementaires'
  | 'docs_politique_economique'
  | 'pv_reunion'
  | 'ressources'

interface DocMedia {
  url?: string | null
  filesize?: number | null
}

interface Doc {
  id: number | string
  titre: string
  description?: string | null
  categorie: string
  acces: string
  fichier?: DocMedia | null
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES_PUBLIC: { value: DocumentCategorie | 'all'; label: string }[] = [
  { value: 'all',                        label: 'Tous' },
  { value: 'textes_statutaires',         label: 'Textes statutaires' },
  { value: 'textes_reglementaires',      label: 'Textes réglementaires' },
  { value: 'docs_politique_economique',  label: 'Docs politique éco.' },
]

const CATEGORIES_MEMBRE: { value: DocumentCategorie | 'all'; label: string }[] = [
  ...CATEGORIES_PUBLIC,
  { value: 'pv_reunion',   label: 'PV de réunion' },
  { value: 'ressources',   label: 'Ressources' },
]

const CATEGORIE_CONFIG: Record<DocumentCategorie, {
  label:       string
  description: string
  badge:       string
  badgeClass:  string
}> = {
  textes_statutaires: {
    label:       'Textes statutaires',
    description: 'Statuts, règlements intérieurs et textes constitutifs du CAP.',
    badge:       'Statutaire',
    badgeClass:  'bg-black text-white',
  },
  textes_reglementaires: {
    label:       'Textes réglementaires',
    description: 'Décrets, lois, circulaires et textes officiels de référence.',
    badge:       'Réglementaire',
    badgeClass:  'bg-gray-700 text-white',
  },
  docs_politique_economique: {
    label:       'Politique économique',
    description: 'Documents de politique économique et stratégies de développement.',
    badge:       'Politique éco.',
    badgeClass:  'bg-gray-400 text-white',
  },
  pv_reunion: {
    label:       'PV de réunion',
    description: 'Procès-verbaux des réunions et assemblées du CAP.',
    badge:       'PV',
    badgeClass:  'bg-gray-800 text-white',
  },
  ressources: {
    label:       'Ressources',
    description: 'Ressources documentaires et supports de formation.',
    badge:       'Ressource',
    badgeClass:  'bg-gray-600 text-white',
  },
}

const ORDERED_CATEGORIES_PUBLIC: DocumentCategorie[] = [
  'textes_statutaires',
  'textes_reglementaires',
  'docs_politique_economique',
]

const ORDERED_CATEGORIES_MEMBRE: DocumentCategorie[] = [
  ...ORDERED_CATEGORIES_PUBLIC,
  'pv_reunion',
  'ressources',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFilesize(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024)        return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentsFilter({ docs, isLoggedIn }: { docs: Doc[]; isLoggedIn: boolean }) {
  const [active, setActive] = useState<DocumentCategorie | 'all'>('all')

  const categories    = isLoggedIn ? CATEGORIES_MEMBRE        : CATEGORIES_PUBLIC
  const orderedCats   = isLoggedIn ? ORDERED_CATEGORIES_MEMBRE : ORDERED_CATEGORIES_PUBLIC

  const filtered = active === 'all' ? docs : docs.filter(d => d.categorie === active)

  const grouped = Object.fromEntries(
    orderedCats.map(cat => [cat, filtered.filter(d => d.categorie === cat)]),
  ) as Record<DocumentCategorie, Doc[]>

  const visibleCategories = active === 'all'
    ? orderedCats.filter(cat => grouped[cat].length > 0)
    : (orderedCats.includes(active as DocumentCategorie) && grouped[active as DocumentCategorie]?.length > 0
        ? [active as DocumentCategorie]
        : [])

  return (
    <>
      {/* Filter buttons */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActive(value)}
            className={
              active === value
                ? 'rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors'
                : 'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black hover:border-black transition-colors'
            }
          >
            {label}
            {value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-60">
                ({docs.filter(d => d.categorie === value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">Aucun document dans cette catégorie.</p>
      ) : (
        <div className="space-y-12">
          {visibleCategories.map(cat => {
            const catDocs   = grouped[cat]
            const catConfig = CATEGORIE_CONFIG[cat]

            return (
              <section key={cat}>
                <div className="mb-5 flex items-end justify-between border-b-2 border-black pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-black">{catConfig.label}</h2>
                    <p className="mt-0.5 text-sm text-gray-500">{catConfig.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#F5F5F5] px-3 py-0.5 text-sm font-medium text-gray-700">
                    {catDocs.length}
                  </span>
                </div>

                <ul className="divide-y divide-gray-100">
                  {catDocs.map(doc => {
                    const filesize  = formatFilesize(doc.fichier?.filesize)
                    const isMembre  = doc.acces === 'membres'

                    return (
                      <li key={doc.id} className="flex items-start gap-4 py-4">
                        <div className="mt-0.5 shrink-0 rounded-lg bg-[#F5F5F5] p-2.5">
                          <FileText size={18} className="text-gray-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-black leading-snug">{doc.titre}</p>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${catConfig.badgeClass}`}>
                              {catConfig.badge}
                            </span>
                            {isMembre && (
                              <span className="inline-flex items-center gap-1 shrink-0 rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                                <Lock size={9} />
                                Membres
                              </span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                          {filesize && (
                            <p className="mt-0.5 text-xs text-gray-400">PDF · {filesize}</p>
                          )}
                        </div>

                        {doc.fichier?.url && (
                          <a
                            href={doc.fichier.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-black px-3 py-2 text-xs font-semibold text-black hover:bg-black hover:text-white transition-colors"
                            title={`Télécharger ${doc.titre}`}
                          >
                            <Download size={13} />
                            PDF
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
