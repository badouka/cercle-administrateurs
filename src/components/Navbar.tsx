'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',           label: 'Accueil' },
  { href: '/annuaire',   label: 'Annuaire' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/activites',  label: 'Activités' },
  { href: '/documents',  label: 'Documents' },
]

export function Navbar() {
  const pathname  = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-cap-800 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-wide hover:opacity-90 transition-opacity"
          >
            <span className="rounded bg-gold-500 px-2 py-0.5 text-cap-900 text-sm font-extrabold">
              CAP
            </span>
            <span className="hidden sm:inline text-white/90 text-sm font-medium">
              Cercle des Administrateurs Publics
            </span>
          </Link>

          {/* Liens desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-cap-700 text-white'
                    : 'text-white/80 hover:bg-cap-700 hover:text-white',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Bouton connexion + hamburger */}
          <div className="flex items-center gap-2">
            <Link
              href="/connexion"
              className="hidden md:inline-flex items-center rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-cap-900 hover:bg-gold-400 transition-colors"
            >
              Connexion
            </Link>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setOpen(prev => !prev)}
              className="md:hidden rounded-md p-2 text-white/80 hover:bg-cap-700 hover:text-white transition-colors"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden border-t border-cap-700">
          <nav className="flex flex-col px-4 py-2 gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-cap-700 text-white'
                    : 'text-white/80 hover:bg-cap-700 hover:text-white',
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/connexion"
              onClick={() => setOpen(false)}
              className="mt-2 mb-1 inline-flex justify-center rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-cap-900 hover:bg-gold-400 transition-colors"
            >
              Connexion
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
