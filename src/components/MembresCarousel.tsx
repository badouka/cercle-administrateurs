'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MembreCard {
  id: string | number
  prenom: string
  nom: string
  slug?: string | null
  photo?: string | null
  poste?: { posteCap?: string | null; organisme?: string | null } | null
}

interface MembresCarouselProps {
  membres: MembreCard[]
}

function initiales(prenom: string, nom: string): string {
  return `${(prenom ?? '').charAt(0)}${(nom ?? '').charAt(0)}`.toUpperCase()
}

export function MembresCarousel({ membres }: MembresCarouselProps) {
  const [perView, setPerView] = useState(4)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const update = () => setPerView(window.innerWidth >= 1024 ? 4 : 1)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const pageCount = Math.max(1, Math.ceil(membres.length / perView))

  // Garde la page courante dans les bornes quand perView change.
  useEffect(() => {
    setPage(p => Math.min(p, pageCount - 1))
  }, [pageCount])

  const goTo = (p: number) => setPage(Math.max(0, Math.min(p, pageCount - 1)))

  if (membres.length === 0) {
    return <p className="text-[#14110B]/50">L&apos;annuaire sera bientôt disponible.</p>
  }

  const pages = Array.from({ length: pageCount }, (_, i) =>
    membres.slice(i * perView, i * perView + perView),
  )

  return (
    <div className="relative overflow-hidden">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((group, gi) => (
            <div
              key={gi}
              className="grid w-full flex-shrink-0 gap-4"
              style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
            >
              {group.map(membre => {
                const posteCap = membre.poste?.posteCap?.trim()
                const organisme = membre.poste?.organisme?.trim()
                return (
                  <Link
                    key={membre.id}
                    href={`/annuaire/${membre.slug || membre.id}`}
                    className="block cursor-pointer overflow-hidden rounded-2xl border border-[#14110B]/10 bg-white transition-colors hover:border-[#C9A227]/50"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {membre.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={membre.photo}
                          alt={`${membre.prenom} ${membre.nom}`}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#0B6B3A]/10">
                          <span className="font-serif text-3xl font-bold text-[#0B6B3A]">
                            {initiales(membre.prenom, membre.nom)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-serif text-base font-bold text-[#14110B]">
                        {membre.prenom} {membre.nom}
                      </p>
                      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[#C9A227]">
                        {posteCap || 'MEMBRE'}
                      </p>
                      {organisme && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-[#14110B]/60">
                          <span>○</span> {organisme}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label="Précédent"
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-[#14110B]/10 bg-white shadow-md transition-colors hover:border-[#C9A227] disabled:opacity-40"
          >
            <ChevronLeft size={18} className="text-[#14110B]" />
          </button>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page === pageCount - 1}
            aria-label="Suivant"
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-[#14110B]/10 bg-white shadow-md transition-colors hover:border-[#C9A227] disabled:opacity-40"
          >
            <ChevronRight size={18} className="text-[#14110B]" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            {pages.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Page ${i + 1}`}
                className={
                  i === page
                    ? 'h-2 w-6 rounded-full bg-[#C9A227]'
                    : 'h-2 w-2 rounded-full bg-[#14110B]/20'
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
