'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CarouselImage {
  url: string
  alt: string
}

export function ImageCarousel({ images }: { images: CarouselImage[] }) {
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const count = images.length

  // Défilement automatique toutes les 4s, en pause au survol.
  useEffect(() => {
    if (isHovered || count <= 1) return
    const id = setInterval(() => {
      setIndex(i => (i + 1) % count)
    }, 4000)
    return () => clearInterval(id)
  }, [isHovered, count])

  if (count === 0) return null

  const go = (i: number) => setIndex((i + count) % count)

  return (
    <div
      className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl bg-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Piste des images */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="relative h-full w-full flex-shrink-0">
            <Image
              src={img.url}
              alt={img.alt}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          {/* Flèches de navigation */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Image précédente"
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#14110B]/10 bg-white/90 shadow-md backdrop-blur-sm transition-colors hover:border-[#C9A227] hover:bg-white"
          >
            <ChevronLeft size={18} className="text-[#14110B]" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Image suivante"
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#14110B]/10 bg-white/90 shadow-md backdrop-blur-sm transition-colors hover:border-[#C9A227] hover:bg-white"
          >
            <ChevronRight size={18} className="text-[#14110B]" />
          </button>

          {/* Indicateurs de position */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {images.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => go(i)}
                aria-label={`Aller à l'image ${i + 1}`}
                className={
                  i === index
                    ? 'h-2 w-6 rounded-full bg-[#C9A227] transition-all'
                    : 'h-2 w-2 rounded-full bg-white/70 transition-all hover:bg-white'
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
