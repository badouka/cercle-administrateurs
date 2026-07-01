'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import Lightbox from './Lightbox'

interface GaleriePostProps {
  photos: Media[]
  titre: string
}

const PER_VIEW = 3
const INTERVAL_MS = 3000

export default function GaleriePost({ photos, titre }: GaleriePostProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [group, setGroup] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevPhoto = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i - 1 + photos.length) % photos.length))
  }, [photos.length])
  const nextPhoto = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i + 1) % photos.length))
  }, [photos.length])

  const pageCount = Math.max(1, Math.ceil(photos.length / PER_VIEW))

  // Défilement automatique par groupe toutes les 3 s, en pause au survol.
  useEffect(() => {
    if (isHovered || pageCount <= 1) return
    const id = setInterval(() => {
      setGroup(g => (g + 1) % pageCount)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [isHovered, pageCount])

  if (photos.length === 0) return null

  // Regroupe les photos par pages de 3 (dernier groupe éventuellement incomplet).
  const pages = Array.from({ length: pageCount }, (_, p) =>
    photos.slice(p * PER_VIEW, p * PER_VIEW + PER_VIEW),
  )

  return (
    <>
      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${group * 100}%)` }}
        >
          {pages.map((page, p) => (
            <div key={p} className="grid w-full flex-shrink-0 grid-cols-3 gap-3">
              {page.map((photo, j) => {
                const index = p * PER_VIEW + j
                return (
                  <button
                    key={photo.id ?? index}
                    type="button"
                    onClick={() => openLightbox(index)}
                    aria-label={`Agrandir l'image ${index + 1}`}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-[#E5E5E5] bg-gray-50 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B6B3A]"
                  >
                    <Image
                      src={photo.url!}
                      alt={photo.alt || titre}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 33vw, 240px"
                    />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </>
  )
}
