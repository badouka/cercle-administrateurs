'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Menu, X, LayoutDashboard, LogOut, Settings2, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type NavChild = { href: string; label: string }
type NavItem =
  | { href: string; label: string; children?: undefined }
  | { href: string; label: string; children: NavChild[] }

const NAV_LINKS: NavItem[] = [
  { href: '/', label: 'Accueil' },
  {
    href: '/a-propos',
    label: 'À propos',
    children: [
      { href: '/a-propos', label: 'Qui sommes-nous' },
      { href: '/a-propos/mot-du-president', label: 'Mot du Président' },
      { href: '/a-propos/nos-partenaires', label: 'Nos Partenaires' },
    ],
  },
  {
    href: '/annuaire',
    label: 'Annuaire',
    children: [
      { href: '/annuaire/bureau', label: 'Bureau exécutif' },
      { href: '/annuaire', label: 'Tous les membres' },
    ],
  },
  { href: '/actualites', label: 'Actualités' },
  { href: '/blog', label: 'Blog' },
  { href: '/documents', label: 'Documents' },
  { href: '/magazines', label: 'Magazines' },
]

interface AuthUser {
  email: string
  role?: 'membre' | 'gestionnaire' | 'admin'
}

const dmSans = '[font-family:var(--font-dm-sans)]'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const rawSearchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const currentFullPath =
    pathname + (rawSearchParams.toString() ? `?${rawSearchParams.toString()}` : '')

  function isChildActive(href: string) {
    if (href.includes('?')) return currentFullPath === href
    return pathname === href && !rawSearchParams.toString()
  }

  function isParentActive(item: NavItem) {
    if (pathname === item.href) return true
    return item.children?.some(c => pathname.startsWith(c.href.split('?')[0])) ?? false
  }

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then((data: { user?: AuthUser } | null) =>
        setUser(data?.user ? { email: data.user.email, role: data.user.role } : null),
      )
      .catch(() => setUser(null))
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => null)
    setUser(null)
    setOpen(false)
    router.push('/')
    router.refresh()
    setLoggingOut(false)
  }

  const isLoggedIn = Boolean(user)
  const isManager = user?.role === 'gestionnaire' || user?.role === 'admin'
  const isHome = pathname === '/'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        scrolled
          ? 'bg-white shadow-md border-b border-[#0B6B3A]/10'
          : isHome
            ? 'bg-transparent'
            : 'bg-[#FAF8F3]/95 border-b border-[#0B6B3A]/10',
        dmSans,
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-1 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {logoError ? (
            <div className="flex items-center gap-2">
              <span className="bg-[#0B6B3A] text-white font-bold px-2 py-1 rounded text-sm">
                CAP
              </span>
              <span className="text-xs text-[#0B6B3A] font-medium">
                Cercle des Administrateurs Publics du Sénégal
              </span>
            </div>
          ) : (
            <img
              src="/api/media/file/cap-logo.png"
              alt="CAP"
              style={{ height: '55px', width: 'auto' }}
              onError={() => setLogoError(true)}
            />
          )}
        </Link>

        {/* Liens centre — desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(item =>
            item.children ? (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1 text-sm transition-colors py-1',
                    isParentActive(item)
                      ? 'text-[#0B6B3A] font-semibold border-b-2 border-[#C9A227]'
                      : 'font-medium text-[#14110B]/70 hover:text-[#0B6B3A]',
                  )}
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className="transition-transform group-hover:rotate-180"
                  />
                </Link>
                <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white rounded-xl shadow-lg border border-[#0B6B3A]/10 py-2 min-w-[220px] z-50">
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-4 py-2.5 text-sm transition-colors hover:bg-[#FAF8F3]',
                        isChildActive(child.href)
                          ? 'text-[#0B6B3A] font-semibold'
                          : 'text-[#14110B]/70 hover:text-[#0B6B3A]',
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition-colors py-1',
                  pathname === item.href
                    ? 'text-[#0B6B3A] font-semibold border-b-2 border-[#C9A227]'
                    : 'font-medium text-[#14110B]/70 hover:text-[#0B6B3A]',
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Boutons droite — desktop */}
        <div className="hidden lg:flex items-center gap-3">
          {user === undefined ? (
            <div className="h-9 w-40 rounded-lg bg-[#0B6B3A]/5 animate-pulse" />
          ) : isLoggedIn ? (
            <>
              {isManager && (
                <Link
                  href="/gestionnaire"
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm px-4 py-2 transition-colors',
                    pathname.startsWith('/gestionnaire')
                      ? 'text-[#0B6B3A] font-semibold'
                      : 'text-[#14110B] font-medium hover:text-[#0B6B3A]',
                  )}
                >
                  <Settings2 size={16} />
                  Gestion
                </Link>
              )}
              <Link
                href="/dashboard"
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm px-4 py-2 transition-colors',
                  pathname.startsWith('/dashboard')
                    ? 'text-[#0B6B3A] font-semibold'
                    : 'text-[#14110B] font-medium hover:text-[#0B6B3A]',
                )}
              >
                <LayoutDashboard size={16} />
                Mon Espace
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#14110B]/70 px-4 py-2 hover:text-[#0B6B3A] transition-colors disabled:opacity-50"
              >
                <LogOut size={16} />
                {loggingOut ? '…' : 'Déconnexion'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="text-[#14110B] font-medium text-sm px-4 py-2 hover:text-[#0B6B3A] transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="bg-[#0B6B3A] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#0B6B3A]/90 transition-colors"
              >
                Devenir membre
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setOpen(prev => !prev)}
          className="lg:hidden p-2 text-[#14110B] hover:text-[#0B6B3A] transition-colors"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div
          className={cn(
            'lg:hidden fixed inset-x-0 top-[60px] bg-[#FAF8F3] shadow-lg border-b border-[#0B6B3A]/10 py-6 px-6 flex flex-col gap-4',
            dmSans,
          )}
        >
          {NAV_LINKS.map(item =>
            item.children ? (
              <div key={item.href} className="flex flex-col gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isParentActive(item) ? 'text-[#0B6B3A]' : 'text-[#14110B]',
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
                      'pl-4 text-sm transition-colors',
                      isChildActive(child.href)
                        ? 'text-[#0B6B3A] font-semibold'
                        : 'font-medium text-[#14110B]/70 hover:text-[#0B6B3A]',
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
                  'text-sm transition-colors',
                  pathname === item.href
                    ? 'text-[#0B6B3A] font-semibold'
                    : 'font-medium text-[#14110B]/70 hover:text-[#0B6B3A]',
                )}
              >
                {item.label}
              </Link>
            ),
          )}

          <div className="mt-2 flex flex-col gap-3 border-t border-[#0B6B3A]/10 pt-4">
            {isLoggedIn ? (
              <>
                {isManager && (
                  <Link
                    href="/gestionnaire"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#14110B] hover:text-[#0B6B3A] transition-colors"
                  >
                    <Settings2 size={16} />
                    Gestion
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#14110B] hover:text-[#0B6B3A] transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Mon Espace
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#14110B]/70 hover:text-[#0B6B3A] transition-colors disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {loggingOut ? 'Déconnexion…' : 'Déconnexion'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className="text-center text-[#14110B] font-medium text-sm px-4 py-2.5 hover:text-[#0B6B3A] transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setOpen(false)}
                  className="text-center bg-[#0B6B3A] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#0B6B3A]/90 transition-colors"
                >
                  Devenir membre
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
