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

  const links = [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: '𝕏',        href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400">Partager :</span>
      {links.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium px-2.5 py-1 rounded border border-black text-black hover:bg-black hover:text-white transition-colors"
        >
          {label}
        </a>
      ))}
    </div>
  )
}
