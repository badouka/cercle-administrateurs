'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, User } from 'lucide-react'

interface BureauAutoCarouselProps {
  membres: Array<{
    id: string
    prenom: string
    nom: string
    slug?: string | null
    photo?: { url?: string | null } | null
    poste?: { posteCap?: string | null; organisme?: string | null } | null
  }>
}

export function BureauAutoCarousel({ membres }: BureauAutoCarouselProps) {
  const [visibleCount, setVisibleCount] = useState(1)
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    function updateVisibleCount() {
      setVisibleCount(window.innerWidth >= 1024 ? 4 : 1)
    }
    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  const maxIndex = Math.max(0, membres.length - visibleCount)

  useEffect(() => {
    setIndex(i => Math.min(i, maxIndex))
  }, [maxIndex])

  useEffect(() => {
    if (isHovered || maxIndex === 0) return
    const id = setInterval(() => {
      setIndex(i => (i >= maxIndex ? 0 : i + 1))
    }, 3000)
    return () => clearInterval(id)
  }, [isHovered, maxIndex])

  function goPrev() {
    setIndex(i => (i <= 0 ? maxIndex : i - 1))
  }

  function goNext() {
    setIndex(i => (i >= maxIndex ? 0 : i + 1))
  }

  return (
    <section className="bg-[#F5F4EF] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[#14B53A]">
            Organe exécutif de l&apos;association
          </p>
          <h2 className="mt-2 font-serif text-4xl font-bold text-ink">Les membres du bureau</h2>
        </div>

        {membres.length === 0 ? (
          <p className="text-center text-ink/50">
            Aucun membre du bureau renseigné pour le moment.
          </p>
        ) : (
          <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${index * (100 / visibleCount)}%)` }}
              >
                {membres.map(membre => {
                  const photoUrl = membre.photo?.url ?? null
                  const posteCap  = membre.poste?.posteCap?.trim()
                  const organisme = membre.poste?.organisme?.trim()

                  return (
                    <div
                      key={membre.id}
                      className="shrink-0 px-3"
                      style={{ width: `${100 / visibleCount}%` }}
                    >
                      <Link href={`/annuaire/${membre.slug || membre.id}`} className="group block">
                        <div className="h-64 w-full overflow-hidden rounded-xl bg-gray-700">
                          {photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photoUrl}
                              alt={`${membre.prenom} ${membre.nom}`}
                              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-700">
                              <User size={48} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <p className="mt-3 font-bold text-ink">
                          {membre.prenom} {membre.nom}
                        </p>
                        {posteCap && <p className="text-sm text-ink/60">{posteCap}</p>}
                        {organisme && <p className="text-sm text-ink/50">{organisme}</p>}
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>

            {maxIndex > 0 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={goPrev}
                  aria-label="Précédent"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-[#14B53A] hover:text-[#14B53A]"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={goNext}
                  aria-label="Suivant"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-[#14B53A] hover:text-[#14B53A]"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/annuaire"
            className="inline-flex items-center gap-2 rounded-lg bg-[#14B53A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#14B53A]/90"
          >
            Voir l&apos;annuaire de tous les membres du CAP
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
