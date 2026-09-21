'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function ScrollActions() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
      <Link href="/dashboard" className="flex items-center gap-2 text-white px-2 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all" style={{ background: '#1a7a3a' }}>
        <span className="text-lg sm:text-xs leading-none">🔒</span>
        <span className="hidden sm:inline">Accès membres</span>
      </Link>
      <Link href="/contact" className="flex items-center gap-2 text-[#14110B] px-2 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all" style={{ background: '#C8A24A' }}>
        <span className="text-lg sm:text-xs leading-none">✉️</span>
        <span className="hidden sm:inline">Contactez-nous</span>
      </Link>
      <Link href="/inscription" className="flex items-center gap-2 text-white px-2 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all" style={{ background: '#ce0726' }}>
        <span className="text-lg sm:text-xs leading-none">👤</span>
        <span className="hidden sm:inline">Devenir membre</span>
      </Link>
    </div>
  )
}
