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

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const membresRes = await payload.find({
    collection:     'membres',
    depth:          1,
    limit:          200,
    overrideAccess: true,
  })

  // Mots-clés dynamiques : noms des membres, fonctions professionnelles et postes au CAP.
  const nomsMembers = membresRes.docs.map(m => `${m.prenom} ${m.nom}`)
  const fonctions = membresRes.docs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map(m => (m.poste as any)?.fonctionProfessionnelle ?? '')
    .filter(Boolean)
  const postesCAP = membresRes.docs
    .map(m => m.poste?.posteCap ?? '')
    .filter(Boolean)

  const allKeywords = [
    'Cercle des Administrateurs Publics',
    'CAP Sénégal',
    'gouvernance parapublic',
    'administrateurs publics',
    'conseil d\'administration',
    'secteur parapublic sénégalais',
    'modernisation administration',
    'Sénégal 2050',
    'organes délibérants',
    'gouvernance publique',
    'Lansana Gagny SAKHO',
    'performance administration publique',
    'établissements publics Sénégal',
    ...new Set(nomsMembers),
    ...new Set(fonctions),
    ...new Set(postesCAP),
  ]

  return {
    title: {
      default: 'CAP - Cercle des Administrateurs Publics du Sénégal',
      template: '%s | CAP Sénégal',
    },
    description: 'Le Cercle des Administrateurs Publics (CAP) rassemble les présidents des conseils d\'administration, de surveillance et d\'orientation des entités du secteur parapublic sénégalais. Un cadre de réflexion, d\'échanges et d\'impulsion d\'idées au service de la modernisation de l\'administration sénégalaise.',
    keywords: allKeywords,
    authors: [{ name: 'Cercle des Administrateurs Publics', url: 'https://cap-senegal.org' }],
    creator: 'DIGISSOL',
    publisher: 'CAP Sénégal',
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      type: 'website',
      locale: 'fr_SN',
      url: 'https://cap-senegal.org',
      siteName: 'CAP - Cercle des Administrateurs Publics',
      title: 'CAP - Cercle des Administrateurs Publics du Sénégal',
      description: 'Le Cercle des Administrateurs Publics rassemble les présidents des organes délibérants du secteur parapublic sénégalais pour promouvoir l\'excellence de la gouvernance publique.',
      images: [{ url: 'https://fc3ao21hfkjktvli.public.blob.vercel-storage.com/cap-logoQ-nP1BOFyniyLA4pkjl2P3xsiEJ1ooZ7.png', width: 1200, height: 630, alt: 'CAP Sénégal' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'CAP - Cercle des Administrateurs Publics du Sénégal',
      description: 'Le Cercle des Administrateurs Publics du Sénégal — gouvernance, performance et modernisation du secteur parapublic.',
      images: ['https://fc3ao21hfkjktvli.public.blob.vercel-storage.com/cap-logoQ-nP1BOFyniyLA4pkjl2P3xsiEJ1ooZ7.png'],
    },
  }
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

  const ORDRE_POSTES = [
    "Président d'honneur", "Présidente d'honneur",
    'Président', 'Présidente',
    'Vice-Président', 'Vice-Présidente',
    'Secrétaire général', 'Secrétaire générale',
    'Secrétaire général adjoint', 'Secrétaire générale adjointe',
    'Trésorier Adjoint', 'Trésorière Adjointe',
    'Trésorier', 'Trésorière',
    'Présidente Commission Actions Sociales',
    'Présidente Commission Communication',
    'Président Commission Stratégie Vulgarisation',
    'President Commission Strategie Vulgarisation',
    'Président Commission Renforcement de Capacités',
    'President Commission Renforcement',
  ]

  const membresBureau = membres
    .filter(m => {
      const p = (m.poste?.posteCap ?? '').trim()
      return p !== '' && p !== 'Membre'
    })
    .sort((a, b) => {
      const ia = ORDRE_POSTES.indexOf((a.poste?.posteCap ?? '').trim())
      const ib = ORDRE_POSTES.indexOf((b.poste?.posteCap ?? '').trim())
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Cercle des Administrateurs Publics",
              "alternateName": "CAP Sénégal",
              "url": "https://cap-senegal.org",
              "logo": "https://fc3ao21hfkjktvli.public.blob.vercel-storage.com/cap-logoQ-nP1BOFyniyLA4pkjl2P3xsiEJ1ooZ7.png",
              "description": "Le Cercle des Administrateurs Publics rassemble les présidents des conseils d'administration, de surveillance et d'orientation des entités du secteur parapublic sénégalais.",
              "foundingDate": "2024-10-12",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Dakar",
                "addressCountry": "SN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "contact@cap-senegal.org",
                "telephone": "+221338000000",
                "contactType": "customer service"
              },
              "sameAs": []
            })
          }}
        />
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main>{children}</main>

        <ScrollActions />

        <AnnuaireSectionWrapper membres={membresBureau} />

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
