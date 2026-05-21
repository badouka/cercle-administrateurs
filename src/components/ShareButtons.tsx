'use client'

import { useEffect, useState } from 'react'
import { Link2, Check } from 'lucide-react'

interface ShareButtonsProps {
  title: string
  path:  string
}

export function ShareButtons({ title, path }: ShareButtonsProps) {
  const [origin,  setOrigin]  = useState('')
  const [copied,  setCopied]  = useState(false)

  useEffect(() => { setOrigin(window.location.origin) }, [])

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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  const btnBase = 'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400">Partager :</span>

      {links.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} border-gray-300 text-gray-700 hover:border-black hover:text-black hover:bg-black hover:text-white`}
        >
          {label}
        </a>
      ))}

      <button
        onClick={handleCopy}
        className={`${btnBase} ${
          copied
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-300 text-gray-700 hover:border-black hover:text-black'
        }`}
        title="Copier le lien"
      >
        {copied ? <Check size={12} /> : <Link2 size={12} />}
        {copied ? 'Copié !' : 'Copier'}
      </button>
    </div>
  )
}
