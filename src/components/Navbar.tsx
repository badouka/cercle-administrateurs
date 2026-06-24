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
      { href: '/a-propos/nos-partenaires',  label: 'Nos partenaires' },
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
  // Lien "Activités" temporairement désactivé (page /activites désactivée)
  // { href: '/activites',  label: 'Activités' },
  { href: '/documents',  label: 'Documents' },
  {
    href: '/magazines',
    label: 'Magazines',
    children: [
      { href: '/magazines',   label: 'Magazines' },
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

  // "Blog" n'apparaît que pour les membres connectés
  const navLinks: NavItem[] = isLoggedIn
    ? [...NAV_LINKS, { href: '/blog', label: 'Blog' }]
    : NAV_LINKS

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-75 transition-opacity"
          >
            <span className="rounded bg-[#14B53A] px-2 py-0.5 text-sm font-extrabold text-cream tracking-wide">
              CAP
            </span>
            <span className="hidden sm:inline font-serif text-sm font-medium text-ink/80 tracking-wide">
              Cercle des Administrateurs Publics
            </span>
          </Link>

          {/* Liens desktop */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(item =>
              item.children ? (
                /* Dropdown desktop */
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors border-b-2',
                      isParentActive(item)
                        ? 'font-semibold text-ink border-[#14B53A]'
                        : 'font-medium text-ink/50 border-transparent hover:text-ink hover:border-ink/20',
                    )}
                  >
                    {item.label}
                    <ChevronDown size={13} className="mt-0.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="absolute top-full left-0 hidden group-hover:block pt-1">
                    <div className="bg-cream border border-ink/10 rounded-lg shadow-lg py-1 min-w-[160px]">
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'block px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors',
                            isChildActive(child.href)
                              ? 'font-semibold text-ink bg-ink/5'
                              : 'font-medium text-ink/50 hover:text-ink hover:bg-ink/5',
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
                    'px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors border-b-2',
                    pathname === item.href
                      ? 'font-semibold text-ink border-[#14B53A]'
                      : 'font-medium text-ink/50 border-transparent hover:text-ink hover:border-ink/20',
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
              <div className="h-8 w-24 rounded-md bg-ink/5 animate-pulse" />
            ) : isLoggedIn ? (
              <>
                {(user?.role === 'gestionnaire' || user?.role === 'admin') && (
                  <Link
                    href="/gestionnaire"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors border-b-2',
                      pathname.startsWith('/gestionnaire')
                        ? 'text-ink font-semibold border-[#14B53A]'
                        : 'text-ink/50 border-transparent hover:text-ink hover:border-ink/20',
                    )}
                  >
                    <Settings2 size={15} />
                    Gestion
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors border-b-2',
                    pathname.startsWith('/dashboard')
                      ? 'text-ink font-semibold border-[#14B53A]'
                      : 'text-ink/50 border-transparent hover:text-ink hover:border-ink/20',
                  )}
                >
                  <LayoutDashboard size={15} />
                  Mon espace
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink/60 hover:border-bordeaux hover:text-bordeaux transition-colors disabled:opacity-50"
                >
                  <LogOut size={15} />
                  {loggingOut ? '…' : 'Déconnexion'}
                </button>
              </>
            ) : (
              <Link
                href="/connexion"
                className="inline-flex items-center rounded-md bg-[#14B53A] px-4 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-cream hover:bg-ink transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(prev => !prev)}
            className="md:hidden rounded-md p-2 text-ink/60 hover:bg-ink/5 hover:text-ink transition-colors"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden border-t border-ink/10 bg-cream">
          <nav className="flex flex-col px-4 py-2 gap-0.5">
            {navLinks.map(item =>
              item.children ? (
                /* Parent + sous-liens indentés mobile */
                <div key={item.href}>
                  <span
                    className={cn(
                      'block px-3 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold border-l-2',
                      isParentActive(item)
                        ? 'text-ink border-[#14B53A]'
                        : 'text-ink/70 border-transparent',
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
                        'block pl-7 pr-3 py-2 font-mono text-xs uppercase tracking-wider border-l-2 transition-colors',
                        isChildActive(child.href)
                          ? 'font-semibold text-ink border-[#14B53A] bg-ink/5'
                          : 'font-medium text-ink/50 border-transparent hover:text-ink hover:border-ink/20 hover:bg-ink/5',
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
                    'px-3 py-2.5 font-mono text-xs uppercase tracking-wider border-l-2 transition-colors',
                    pathname === item.href
                      ? 'font-semibold text-ink border-[#14B53A] bg-ink/5'
                      : 'font-medium text-ink/50 border-transparent hover:text-ink hover:border-ink/20 hover:bg-ink/5',
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
                      className="flex items-center gap-2 rounded-md border border-ink/15 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink/5 transition-colors"
                    >
                      <Settings2 size={15} />
                      Gestion
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md border border-ink/15 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink/5 transition-colors"
                  >
                    <LayoutDashboard size={15} />
                    Mon espace
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2 rounded-md border border-ink/15 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-ink/60 hover:bg-ink/5 transition-colors disabled:opacity-50"
                  >
                    <LogOut size={15} />
                    {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
                  </button>
                </>
              ) : (
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className="flex justify-center rounded-md bg-[#14B53A] px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-cream hover:bg-ink transition-colors"
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
