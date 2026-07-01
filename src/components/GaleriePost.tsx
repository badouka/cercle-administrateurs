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

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {photos.map((photo, index) => (
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
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
            />
          </button>
        ))}
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
