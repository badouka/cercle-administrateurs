'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'

export interface ActualitePost {
  id: string | number
  titre: string
  slug?: string | null
  excerpt: string
  imageUrl?: string | null // media .url (Blob CDN)
  categorie?: string | null
  date?: string | null
  type?: string | null
}

type Filtre = 'tous' | 'actualites' | 'ateliers_seminaires'

const FILTRES: { key: Filtre; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'actualites', label: 'Actualités' },
  { key: 'ateliers_seminaires', label: 'Ateliers & Séminaires' },
]

function categorieLabel(cat?: string | null, type?: string | null): string {
  const v = `${cat ?? ''} ${type ?? ''}`.toLowerCase()
  if (v.includes('atelier') || v.includes('seminaire') || v.includes('ateliers_seminaires')) {
    return 'Ateliers & Séminaires'
  }
  return 'Actualités'
}

function matchFiltre(post: ActualitePost, filtre: Filtre): boolean {
  if (filtre === 'tous') return true
  const v = `${post.categorie ?? ''} ${post.type ?? ''}`.toLowerCase()
  if (filtre === 'actualites') return v.includes('actualite')
  if (filtre === 'ateliers_seminaires') return v.includes('atelier') || v.includes('seminaire')
  return true
}

export function ActualitesClient({ posts }: { posts: ActualitePost[] }) {
  const [query, setQuery] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(p => {
      if (!matchFiltre(p, filtre)) return false
      if (!q) return true
      return `${p.titre} ${p.excerpt}`.toLowerCase().includes(q)
    })
  }, [posts, query, filtre])

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Rechercher un article…"
        className="mb-6 w-full rounded-xl border border-[#14110B]/15 bg-[#FAF8F3] px-5 py-3 text-sm text-[#14110B] placeholder:text-[#14110B]/40 focus:border-[#0B6B3A] focus:outline-none"
      />

      <div className="mb-8 flex flex-wrap gap-3">
        {FILTRES.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFiltre(f.key)}
            className={
              filtre === f.key
                ? 'cursor-pointer rounded-full border border-[#0B6B3A] bg-[#0B6B3A] px-5 py-2 text-sm font-semibold text-white transition-all'
                : 'cursor-pointer rounded-full border border-[#14110B]/20 bg-transparent px-5 py-2 text-sm font-semibold text-[#14110B]/60 transition-all hover:border-[#0B6B3A]/40 hover:text-[#14110B]'
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#14110B]/50">Aucun article ne correspond à votre recherche.</p>
      ) : (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => {
            const lien = `${origin}/actualites/${p.slug || p.id}`
            const shareBtn =
              'inline-flex items-center gap-1.5 text-xs font-medium text-[#14110B]/60 border border-[#14110B]/15 px-3 py-1.5 rounded-lg hover:border-[#0B6B3A] hover:text-[#0B6B3A] transition-colors'
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-[#14110B]/10 bg-white transition-all hover:border-[#C9A227]/30 hover:shadow-md"
              >
                <Link href={`/actualites/${p.slug || p.id}`} className="block cursor-pointer">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#EEF6F1]">
                    {p.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.titre}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0B6B3A] backdrop-blur-sm">
                      {categorieLabel(p.categorie, p.type)}
                    </span>
                    {p.date && (
                      <span className="absolute bottom-3 left-3 rounded-lg bg-[#C9A227] px-3 py-1 text-xs font-bold text-[#14110B]">
                        {p.date}
                      </span>
                    )}
                  </div>
                  <div className="px-5 pt-5">
                    <h3 className="line-clamp-2 font-serif text-lg font-bold leading-tight text-[#062812]">
                      {p.titre}
                    </h3>
                    {p.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#14110B]/60">
                        {p.excerpt}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0B6B3A]">
                      Lire l&apos;article <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>

                {/* Partage */}
                <div className="px-5 pb-5">
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#14110B]/10 pt-4">
                    <span className="self-center text-xs text-[#14110B]/40">Partager :</span>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lien)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={shareBtn}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      Facebook
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(lien)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={shareBtn}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      LinkedIn
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(lien)}&text=${encodeURIComponent(p.titre)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={shareBtn}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      X
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${p.titre} - ${lien}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={shareBtn}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(lien)}
                      className={shareBtn}
                    >
                      🔗 Copier
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
