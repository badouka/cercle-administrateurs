'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import Lightbox from './Lightbox'

interface GaleriePostProps {
  photos: Media[]
  titre: string
}

export default function GaleriePost({ photos, titre }: GaleriePostProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevPhoto = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i - 1 + photos.length) % photos.length))
  }, [photos.length])
  const nextPhoto = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i + 1) % photos.length))
  }, [photos.length])

  if (photos.length === 0) return null

  // Défilement continu seulement s'il y a plus d'une miniature.
  // La piste est dupliquée pour un défilement en boucle sans couture.
  const shouldScroll = photos.length > 1
  const items = shouldScroll ? [...photos, ...photos] : photos
  // Vitesse constante : ~3 s par miniature, boucle continue et fluide.
  const durationSec = photos.length * 3

  return (
    <>
      <div className="marquee-container overflow-hidden">
        <div
          className={shouldScroll ? 'marquee-track flex w-max' : 'flex flex-wrap gap-3'}
          style={shouldScroll ? { animationDuration: `${durationSec}s` } : undefined}
        >
          {items.map((photo, i) => {
            const realIndex = i % photos.length
            const isClone = i >= photos.length
            return (
              <button
                key={i}
                type="button"
                onClick={() => openLightbox(realIndex)}
                aria-hidden={isClone}
                tabIndex={isClone ? -1 : 0}
                aria-label={`Agrandir l'image ${realIndex + 1}`}
                className={`group relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-[#E5E5E5] bg-gray-50 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B6B3A]${
                  shouldScroll ? ' mr-3' : ''
                }`}
              >
                <Image
                  src={photo.url!}
                  alt={photo.alt || titre}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="128px"
                />
              </button>
            )
          })}
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
