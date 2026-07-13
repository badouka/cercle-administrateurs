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
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const total = photos.length

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevPhoto = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i - 1 + total) % total))
  }, [total])
  const nextPhoto = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i + 1) % total))
  }, [total])

  // Fenêtre glissante : n'avance que s'il y a plus de 3 images.
  const isScrolling = total > PER_VIEW

  // Défilement automatique : avance d'une image toutes les 3 s, en pause au survol.
  useEffect(() => {
    if (isHovered || !isScrolling) return
    const id = setInterval(() => {
      setIndex(i => (i + 1) % total)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [isHovered, isScrolling, total])

  if (total === 0) return null

  // Les 3 images visibles : fenêtre glissante avec bouclage par modulo.
  // Moins de 4 images : on les affiche toutes, sans défilement.
  const visible = isScrolling
    ? Array.from({ length: PER_VIEW }, (_, k) => (index + k) % total)
    : photos.map((_, i) => i)

  return (
    <>
      <div
        className="grid grid-cols-3 gap-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {visible.map(realIndex => {
          const photo = photos[realIndex]
          return (
            <button
              key={photo.id ?? realIndex}
              type="button"
              onClick={() => openLightbox(realIndex)}
              aria-label={`Agrandir l'image ${realIndex + 1}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-[#E5E5E5] bg-gray-50 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a7a3a]"
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
