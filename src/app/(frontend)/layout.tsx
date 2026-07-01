import type { Metadata } from 'next'
import React, { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Newsreader, IBM_Plex_Mono, Archivo, Crimson_Pro, DM_Sans } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ScrollActions } from '@/components/ScrollActions'
import { AnnuaireSectionWrapper } from '@/components/AnnuaireSectionWrapper'
import { PartenairesSection } from '@/components/PartenairesSection'
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

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const membresRes = await payload.find({
    collection:     'membres',
    depth:          1,
    limit:          100,
    sort:           'nom',
    overrideAccess: true,
  })
  const membres = membresRes.docs.map(m => ({
    id: String(m.id),
    prenom: m.prenom,
    nom: m.nom,
    slug: m.slug ?? null,
    photo:
      m.photo && typeof m.photo === 'object' && 'filename' in m.photo
        ? { filename: (m.photo as { filename?: string | null }).filename ?? null }
        : null,
    poste: m.poste
      ? { posteCap: m.poste.posteCap ?? null, organisme: m.poste.organisme ?? null }
      : null,
  }))

  const partenairesRes = await payload.find({
    collection:     'partenaires',
    depth:          1,
    limit:          50,
    sort:           'ordre',
    overrideAccess: true,
  })
  const partenaires = partenairesRes.docs.map(p => ({
    id: String(p.id),
    nom: p.nom,
    logo:
      p.logo && typeof p.logo === 'object' && 'filename' in p.logo
        ? { filename: (p.logo as { filename?: string | null }).filename ?? null }
        : null,
    site_web: p.site_web ?? null,
  }))

  return (
    <html lang="fr" className={`${newsreader.variable} ${ibmPlexMono.variable} ${archivo.variable}`}>
      <body className={`${crimsonPro.variable} ${dmSans.variable} min-h-screen bg-white font-sans text-ink antialiased`}>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main>{children}</main>

        <ScrollActions />

        <AnnuaireSectionWrapper membres={membres} />

        <PartenairesSection partenaires={partenaires} />

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
