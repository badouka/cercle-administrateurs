import type { Metadata } from 'next'
import React from 'react'
import { Navbar } from '@/components/Navbar'
import './styles.css'

export const metadata: Metadata = {
  title: {
    default: 'CAP — Cercle des Administrateurs Publics',
    template: '%s | CAP',
  },
  description:
    'Plateforme du Cercle des Administrateurs Publics du Sénégal — actualités, activités, annuaire des membres et ressources documentaires.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Navbar />
        <main>{children}</main>
        <footer className="mt-16 border-t border-gray-200 bg-cap-900 text-white/70">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© {new Date().getFullYear()} Cercle des Administrateurs Publics du Sénégal</p>
            <p className="text-white/50">Plateforme gérée avec Payload CMS</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
