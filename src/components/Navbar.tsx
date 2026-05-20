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
  const pathname        = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-75 transition-opacity"
          >
            <span className="rounded bg-black px-2 py-0.5 text-sm font-extrabold text-white tracking-wide">
              CAP
            </span>
            <span className="hidden sm:inline text-sm font-medium text-gray-700 tracking-wide">
              Cercle des Administrateurs Publics
            </span>
          </Link>

          {/* Liens desktop */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 text-sm transition-colors border-b-2',
                  pathname === href
                    ? 'font-semibold text-black border-black'
                    : 'font-medium text-gray-500 border-transparent hover:text-black hover:border-gray-300',
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
              className="hidden md:inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Connexion
            </Link>

            <button
              onClick={() => setOpen(prev => !prev)}
              className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col px-4 py-2 gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-2.5 text-sm border-l-2 transition-colors',
                  pathname === href
                    ? 'font-semibold text-black border-black bg-gray-50'
                    : 'font-medium text-gray-500 border-transparent hover:text-black hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/connexion"
              onClick={() => setOpen(false)}
              className="mt-2 mb-1 inline-flex justify-center rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Connexion
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
