'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Menu, X, LayoutDashboard, LogOut, Settings2, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type NavChild = { href: string; label: string }
type NavItem  =
  | { href: string; label: string; children?: undefined }
  | { href: string; label: string; children: NavChild[] }

const NAV_LINKS: NavItem[] = [
  { href: '/',           label: 'Accueil' },
  {
    href: '/a-propos',
    label: 'À propos',
    children: [
      { href: '/a-propos',                  label: 'Qui sommes-nous ?' },
      { href: '/a-propos/mot-du-president', label: 'Mot du Président' },
      { href: '/a-propos/partenaires',      label: 'Nos partenaires' },
    ],
  },
  {
    href: '/annuaire',
    label: 'Annuaire',
    children: [
      { href: '/annuaire',                  label: 'Tous les membres' },
      { href: '/annuaire?filtre=bureau',    label: 'Bureau exécutif' },
      { href: '/annuaire?filtre=membres',   label: 'Membres' },
    ],
  },
  { href: '/actualites', label: 'Actualités' },
  { href: '/activites',  label: 'Activités' },
  { href: '/documents',  label: 'Documents' },
  {
    href: '/magazines',
    label: 'Magazines',
    children: [
      { href: '/magazines',   label: 'Magazines' },
      { href: '/mediatheque', label: 'Médiathèque' },
    ],
  },
]

interface AuthUser { email: string; role?: 'membre' | 'gestionnaire' | 'admin' }

export function Navbar() {
  const pathname              = usePathname()
  const router                = useRouter()
  const rawSearchParams       = useSearchParams()
  const [open, setOpen]       = useState(false)
  const [user, setUser]       = useState<AuthUser | null | undefined>(undefined)
  const [loggingOut, setLoggingOut] = useState(false)

  const currentFullPath = pathname + (rawSearchParams.toString() ? `?${rawSearchParams.toString()}` : '')

  function isChildActive(href: string) {
    if (href.includes('?')) return currentFullPath === href
    return pathname === href && !rawSearchParams.toString()
  }

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then((data: { user?: AuthUser } | null) => setUser(data?.user ? { email: data.user.email, role: data.user.role } : null))
      .catch(() => setUser(null))
  }, [pathname])

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => null)
    setUser(null)
    setOpen(false)
    router.push('/')
    router.refresh()
    setLoggingOut(false)
  }

  function isParentActive(item: NavItem) {
    if (pathname === item.href) return true
    return item.children?.some(c => pathname.startsWith(c.href.split('?')[0])) ?? false
  }

  const isLoggedIn = Boolean(user)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
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
            {NAV_LINKS.map(item =>
              item.children ? (
                /* Dropdown desktop */
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-2 text-sm transition-colors border-b-2',
                      isParentActive(item)
                        ? 'font-semibold text-black border-black'
                        : 'font-medium text-gray-500 border-transparent hover:text-black hover:border-gray-300',
                    )}
                  >
                    {item.label}
                    <ChevronDown size={13} className="mt-0.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="absolute top-full left-0 hidden group-hover:block pt-1">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'block px-4 py-2 text-sm transition-colors',
                            isChildActive(child.href)
                              ? 'font-semibold text-black bg-gray-50'
                              : 'font-medium text-gray-600 hover:text-black hover:bg-gray-50',
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm transition-colors border-b-2',
                    pathname === item.href
                      ? 'font-semibold text-black border-black'
                      : 'font-medium text-gray-500 border-transparent hover:text-black hover:border-gray-300',
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user === undefined ? (
              <div className="h-8 w-24 rounded-md bg-gray-100 animate-pulse" />
            ) : isLoggedIn ? (
              <>
                {(user?.role === 'gestionnaire' || user?.role === 'admin') && (
                  <Link
                    href="/gestionnaire"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors border-b-2',
                      pathname.startsWith('/gestionnaire')
                        ? 'text-black font-semibold border-black'
                        : 'text-gray-500 border-transparent hover:text-black hover:border-gray-300',
                    )}
                  >
                    <Settings2 size={15} />
                    Gestion
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors border-b-2',
                    pathname.startsWith('/dashboard')
                      ? 'text-black font-semibold border-black'
                      : 'text-gray-500 border-transparent hover:text-black hover:border-gray-300',
                  )}
                >
                  <LayoutDashboard size={15} />
                  Mon espace
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-black hover:text-black transition-colors disabled:opacity-50"
                >
                  <LogOut size={15} />
                  {loggingOut ? '…' : 'Déconnexion'}
                </button>
              </>
            ) : (
              <Link
                href="/connexion"
                className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(prev => !prev)}
            className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col px-4 py-2 gap-0.5">
            {NAV_LINKS.map(item =>
              item.children ? (
                /* Parent + sous-liens indentés mobile */
                <div key={item.href}>
                  <span
                    className={cn(
                      'block px-3 py-2.5 text-sm font-semibold border-l-2',
                      isParentActive(item)
                        ? 'text-black border-black'
                        : 'text-gray-700 border-transparent',
                    )}
                  >
                    {item.label}
                  </span>
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'block pl-7 pr-3 py-2 text-sm border-l-2 transition-colors',
                        isChildActive(child.href)
                          ? 'font-semibold text-black border-black bg-gray-50'
                          : 'font-medium text-gray-500 border-transparent hover:text-black hover:border-gray-300 hover:bg-gray-50',
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-3 py-2.5 text-sm border-l-2 transition-colors',
                    pathname === item.href
                      ? 'font-semibold text-black border-black bg-gray-50'
                      : 'font-medium text-gray-500 border-transparent hover:text-black hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  {item.label}
                </Link>
              )
            )}

            <div className="mt-2 mb-1 space-y-1.5">
              {isLoggedIn ? (
                <>
                  {(user?.role === 'gestionnaire' || user?.role === 'admin') && (
                    <Link
                      href="/gestionnaire"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
                    >
                      <Settings2 size={15} />
                      Gestion
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard size={15} />
                    Mon espace
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <LogOut size={15} />
                    {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
                  </button>
                </>
              ) : (
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className="flex justify-center rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  Connexion
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
