import type { Metadata } from 'next'
import React, { Suspense } from 'react'
import Script from 'next/script'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Newsreader, IBM_Plex_Mono, Archivo, Crimson_Pro, DM_Sans } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ScrollActions } from '@/components/ScrollActions'
import { AnnuaireSectionWrapper } from '@/components/AnnuaireSectionWrapper'
import { PartenairesSection } from '@/components/PartenairesSection'
import './styles.css'

// Rendu dynamique de tout le front public : les URLs des médias (CDN Vercel
// Blob) sont générées par le plugin au moment de la lecture. En statique, si le
// token Blob n'est pas présent au build, le plugin se désactive et les URLs
// retombent sur /api/media/file/. Le rendu à la requête garantit des URLs Blob
// correctes (le token étant disponible au runtime).
export const dynamic = 'force-dynamic'

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
      m.photo && typeof m.photo === 'object' && 'url' in m.photo
        ? { url: (m.photo as { url?: string | null }).url ?? null }
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
      p.logo && typeof p.logo === 'object' && 'url' in p.logo
        ? { url: (p.logo as { url?: string | null }).url ?? null }
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
        <div className="w-full h-2 flex">
          <div className="flex-1" style={{ background: '#14b53a' }}></div>
          <div className="flex-1 relative flex items-center justify-center" style={{ background: '#fcd116' }}>
            <span className="absolute text-[16px] font-bold leading-none" style={{ color: '#14b53a' }}>★</span>
          </div>
          <div className="flex-1" style={{ background: '#ce0726' }}></div>
        </div>

        <Footer />

        <Script id="chatlab-config" strategy="afterInteractive">
          {`window.aichatbotApiKey="56e6942e-b0d2-44ef-b0b0-b60b6a777aa1"; window.aichatbotProviderId="f9e9c5e4-6d1a-4b8c-8d3f-3f9e9c5e46d1";`}
        </Script>
        <Script
          src="https://script.chatlab.com/aichatbot.js"
          id="56e6942e-b0d2-44ef-b0b0-b60b6a777aa1"
          strategy="afterInteractive"
        />

      </body>
    </html>
  )
}
