'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import Lightbox from './Lightbox'

interface GalerieGridProps {
  photos: Media[]
  titre: string
}

export default function GalerieGrid({ photos, titre }: GalerieGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevPhoto = useCallback(() => {
    setLightboxIndex(i => i === null ? null : (i - 1 + photos.length) % photos.length)
  }, [photos.length])
  const nextPhoto = useCallback(() => {
    setLightboxIndex(i => i === null ? null : (i + 1) % photos.length)
  }, [photos.length])

  return (
    <>
      <div style={{ columns: '3 300px', gap: '8px' }}>
        {photos.map((photo, index) => (
          <figure
            key={photo.id ?? index}
            style={{ breakInside: 'avoid', marginBottom: '8px' }}
            className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-gray-50 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={photo.url!}
              alt={photo.alt || titre}
              width={photo.width ?? 800}
              height={photo.height ?? 600}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </figure>
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
