'use client'

import Link from 'next/link'
import { useState } from 'react'

const NAVIGUER = [
  { href: '/',           label: 'Accueil' },
  { href: '/a-propos',   label: 'À propos' },
  { href: '/annuaire',   label: 'Annuaire' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/blog',       label: 'Blog' },
]

const RESSOURCES = [
  { href: '/documents',                 label: 'Documents' },
  { href: '/magazines',                 label: 'Magazines' },
  { href: '/a-propos/nos-partenaires',  label: 'Partenaires' },
]

const TITRE_COLONNE = 'mb-4 font-mono text-xs uppercase tracking-widest text-[#fcd116]'
const LIEN_COLONNE = 'text-sm text-[#14110B]/70 transition-colors hover:text-[#14b53a]'

export function Footer() {
  const [logoError, setLogoError] = useState(false)

  return (
    <footer className="border-t border-[#14110B]/10 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[4fr_2fr_2fr_4fr] gap-8 items-start">

          {/* Colonne 1 — Logo + description */}
          <div className="flex flex-col gap-3 items-start">
            {logoError ? (
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#14b53a] px-2 py-1 text-sm font-black text-white">CAP</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/cap-logo.png"
                alt="CAP"
                style={{ height: '55px', width: 'auto' }}
                onError={() => setLogoError(true)}
              />
            )}
            <p className="max-w-xs text-sm leading-relaxed text-[#14110B]/60">
              Au service de la modernisation de la gouvernance du secteur parapublic sénégalais.
            </p>
          </div>

          {/* Colonne 2 — Naviguer */}
          <div>
            <h3 className={TITRE_COLONNE}>Naviguer</h3>
            <div className="flex flex-col gap-3">
              {NAVIGUER.map(({ href, label }) => (
                <Link key={href} href={href} className={LIEN_COLONNE}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne 3 — Ressources */}
          <div>
            <h3 className={TITRE_COLONNE}>Ressources</h3>
            <div className="flex flex-col gap-3">
              {RESSOURCES.map(({ href, label }) => (
                <Link key={href} href={href} className={LIEN_COLONNE}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne 4 — Contact */}
          <div>
            <h3 className={TITRE_COLONNE}>Contact</h3>
            <div className="flex flex-col gap-3 text-sm text-[#14110B]/70">
              <span>📍 Dakar, Sénégal</span>
              <a href="mailto:contact@cap-senegal.org" className="transition-colors hover:text-[#14b53a]">
                ✉️ contact@cap-senegal.org
              </a>
              <a href="tel:+221338000000" className="transition-colors hover:text-[#14b53a]">
                📞 +221 33 800 00 00
              </a>
            </div>
          </div>
        </div>

        {/* Barre bas */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-[#14110B]/10 pt-8 text-xs text-[#14110B]/40 sm:flex-row">
          <p className="text-xs text-[#14110B]/40 text-center">
            Copyright © 2025 CAP. Tous droits réservés. | Développé et hébergé par{' '}
            <a href="https://digissol.com/" target="_blank" rel="noopener noreferrer" className="text-[#14b53a] font-semibold hover:text-[#fcd116] transition-colors underline">
              DIGISSOL
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
