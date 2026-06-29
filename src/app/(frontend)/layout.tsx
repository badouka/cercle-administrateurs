import type { Metadata } from 'next'
import React from 'react'
import { Newsreader, IBM_Plex_Mono, Archivo, Crimson_Pro, DM_Sans } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ScrollActions } from '@/components/ScrollActions'
import './styles.css'

const crimsonPro = Crimson_Pro({ subsets: ['latin'], variable: '--font-crimson' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

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

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${newsreader.variable} ${ibmPlexMono.variable} ${archivo.variable}`}>
      <body className={`${crimsonPro.variable} ${dmSans.variable} min-h-screen bg-white font-sans text-ink antialiased`}>
        <Navbar />
        <main>{children}</main>

        <ScrollActions />

        {/* Filet tricolore */}
        <div className="w-full h-1.5 flex">
          <div className="flex-1 bg-[#0B6B3A]"></div>
          <div className="flex-1 bg-[#C9A227] relative flex items-center justify-center">
            <span className="absolute text-[#0B6B3A] text-[8px] leading-none">★</span>
          </div>
          <div className="flex-1 bg-[#E2231A]"></div>
        </div>

        <Footer />

      </body>
    </html>
  )
}
