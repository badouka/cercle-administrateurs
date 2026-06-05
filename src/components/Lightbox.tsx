'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Media } from '@/payload-types'

interface LightboxProps {
  photos: Media[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function Lightbox({ photos, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const photo = photos[currentIndex]

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') onPrev()
    if (e.key === 'ArrowRight') onNext()
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!photo?.url) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="Fermer"
      >
        <X size={30} />
      </button>

      <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm select-none">
        {currentIndex + 1} / {photos.length}
      </span>

      {photos.length > 1 && (
        <button
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Photo précédente"
        >
          <ChevronLeft size={44} />
        </button>
      )}

      <div
        className="relative"
        style={{ maxHeight: '90vh', maxWidth: '90vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.url}
          alt={photo.alt || ''}
          width={photo.width ?? 1200}
          height={photo.height ?? 900}
          style={{ maxHeight: '90vh', maxWidth: '90vw', width: 'auto', height: 'auto' }}
          priority
        />
      </div>

      {photos.length > 1 && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Photo suivante"
        >
          <ChevronRight size={44} />
        </button>
      )}
    </div>
  )
}
