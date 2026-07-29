'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { useOrigin } from '@/hooks/useOrigin'
import { IconeX } from '@/components/IconeX'

interface ShareButtonsProps {
  title: string
  path:  string
}

export function ShareButtons({ title, path }: ShareButtonsProps) {
  const origin               = useOrigin()
  const [copied,  setCopied] = useState(false)

  if (!origin) return null

  const url          = `${origin}${path}`
  const encodedUrl   = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    { key: 'Facebook', label: 'Facebook',   href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { key: 'LinkedIn', label: 'LinkedIn',   href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { key: 'X',        label: <IconeX />,   href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { key: 'WhatsApp', label: 'WhatsApp',   href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
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

      {links.map(({ key, label, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partager sur ${key}`}
          title={`Partager sur ${key}`}
          className={`${btnBase} border-gray-300 text-gray-700 hover:border-black hover:bg-black hover:text-white`}
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
