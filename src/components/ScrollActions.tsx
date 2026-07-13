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
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
      <Link href="/dashboard" className="flex items-center gap-2 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all" style={{ background: '#1a7a3a' }}>
        🔒 Accès membres
      </Link>
      <Link href="/contact" className="flex items-center gap-2 text-[#14110B] px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all" style={{ background: '#C8A24A' }}>
        ✉️ Contactez-nous
      </Link>
      <Link href="/inscription" className="flex items-center gap-2 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all" style={{ background: '#ce0726' }}>
        👤 Devenir membre
      </Link>
    </div>
  )
}
