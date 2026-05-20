'use client'

import { useEffect, useState } from 'react'

interface ShareButtonsProps {
  title: string
  path: string
}

export function ShareButtons({ title, path }: ShareButtonsProps) {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  if (!origin) return null

  const url          = `${origin}${path}`
  const encodedUrl   = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400">Partager :</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium px-2.5 py-1 rounded bg-[#1877F2] text-white hover:bg-[#1565D8] transition-colors"
      >
        Facebook
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium px-2.5 py-1 rounded bg-[#0A66C2] text-white hover:bg-[#0855A0] transition-colors"
      >
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium px-2.5 py-1 rounded bg-black text-white hover:bg-gray-800 transition-colors"
      >
        𝕏
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium px-2.5 py-1 rounded bg-[#25D366] text-white hover:bg-[#1DAE55] transition-colors"
      >
        WhatsApp
      </a>
    </div>
  )
}
