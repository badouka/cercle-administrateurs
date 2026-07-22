'use client'

import { useEffect, useRef, useState } from 'react'

type Partenaire = {
  id: string
  nom: string
  logo?: { url?: string | null } | null
  site_web?: string | null
}

export function PartenairesSection({ partenaires }: { partenaires: Partenaire[] }) {
  const [offset, setOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const pauseRef = useRef(false)

  useEffect(() => {
    if (partenaires.length === 0) return
    const interval = setInterval(() => {
      if (!pauseRef.current) {
        setOffset(prev => {
          const max = partenaires.length * 180
          return (prev + 1) % max
        })
      }
    }, 20)
    return () => clearInterval(interval)
  }, [partenaires.length])

  if (partenaires.length === 0) return null

  // Double la liste pour l'effet infini
  const doubled = [...partenaires, ...partenaires]

  return (
    <section className="bg-white py-10 border-t border-[#14110B]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex items-center gap-3">
          <span className="block w-6 h-0.5 bg-[#C8A24A]"></span>
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#C8A24A]">NOS PARTENAIRES</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseEnter={() => { pauseRef.current = true }}
        onMouseLeave={() => { pauseRef.current = false }}
      >
        <div
          className="flex gap-8 items-center"
          style={{ transform: `translateX(-${offset}px)`, transition: 'none', width: 'max-content' }}
        >
          {doubled.map((p, i) => (
            p.site_web ? (
              <a
                key={`${p.id}-${i}`}
                href={p.site_web}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-none w-40 h-20 bg-white rounded-xl border border-[#14110B]/10 flex items-center justify-center p-4 hover:border-[#C8A24A]/50 hover:shadow-sm transition-all cursor-pointer"
              >
                {p.logo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo.url} alt={p.nom} className="max-h-12 max-w-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-[#14110B]/40 text-center">{p.nom}</span>
                )}
              </a>
            ) : (
              <div
                key={`${p.id}-${i}`}
                className="flex-none w-40 h-20 bg-white rounded-xl border border-[#14110B]/10 flex items-center justify-center p-4 hover:border-[#C8A24A]/50 hover:shadow-sm transition-all"
              >
                {p.logo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo.url} alt={p.nom} className="max-h-12 max-w-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-[#14110B]/40 text-center">{p.nom}</span>
                )}
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  )
}
