import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import { Newsreader, IBM_Plex_Mono, Archivo } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import './styles.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CAP — Cercle des Administrateurs Publics',
    template: '%s | CAP',
  },
  description:
    'Plateforme du Cercle des Administrateurs Publics du Sénégal — actualités, activités, annuaire des membres et ressources documentaires.',
}

const NAV_LINKS = [
  { href: '/',             label: 'Accueil' },
  { href: '/annuaire',     label: 'Annuaire' },
  { href: '/actualites',   label: 'Actualités' },
  { href: '/activites',    label: 'Activités' },
  { href: '/documents',    label: 'Documents' },
  { href: '/magazines',    label: 'Magazines' },
  { href: '/mediatheque',  label: 'Médiathèque' },
]

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${newsreader.variable} ${ibmPlexMono.variable} ${archivo.variable}`}>
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        <Navbar />
        <main>{children}</main>

        <footer className="mt-16 bg-ink text-cream">
          {/* Section principale */}
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

              {/* Colonne 1 — Identité */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-bordeaux px-2 py-0.5 text-sm font-extrabold tracking-wide text-cream">
                    CAP
                  </span>
                  <span className="font-serif text-sm font-medium tracking-wide text-cream/80">
                    Cercle des Administrateurs Publics
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-cream/50">
                  Le Cercle des Administrateurs Publics accompagne les pouvoirs publics dans
                  la modernisation de l'administration sénégalaise.
                </p>
                {/* Réseaux sociaux */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/15 text-cream/50 transition-colors hover:border-bordeaux hover:text-bordeaux"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/15 text-cream/50 transition-colors hover:border-bordeaux hover:text-bordeaux"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/15 text-cream/50 transition-colors hover:border-bordeaux hover:text-bordeaux"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Colonne 2 — Navigation */}
              <div className="flex flex-col gap-4">
                <h3 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-cream/35">
                  Navigation
                </h3>
                <ul className="flex flex-col gap-2">
                  {NAV_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm text-cream/60 transition-colors hover:text-bordeaux"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Colonne 3 — Contact */}
              <div className="flex flex-col gap-4">
                <h3 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-cream/35">
                  Contact
                </h3>
                <ul className="flex flex-col gap-3 text-sm text-cream/60">
                  <li className="flex items-start gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 mt-0.5 shrink-0 text-bordeaux">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
                    </svg>
                    <span>Dakar, Sénégal</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0 text-bordeaux">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    <a href="mailto:contact@cap-senegal.org" className="transition-colors hover:text-bordeaux">
                      contact@cap-senegal.org
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0 text-bordeaux">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
                    </svg>
                    <a href="tel:+221338000000" className="transition-colors hover:text-bordeaux">
                      +221 33 800 00 00
                    </a>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Barre du bas */}
          <div className="border-t border-cream/10">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/35">
              <p>© 2026 Cercle des Administrateurs Publics du Sénégal. Tous droits réservés.</p>
              <div className="flex items-center gap-4">
                <Link href="/confidentialite" className="transition-colors hover:text-cream">
                  Politique de confidentialité
                </Link>
                <span className="text-cream/15">|</span>
                <Link href="/mentions-legales" className="transition-colors hover:text-cream">
                  Mentions légales
                </Link>
              </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
