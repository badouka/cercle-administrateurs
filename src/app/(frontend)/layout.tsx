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
import { ChatWidget } from '@/components/ChatWidget'
import { SITE_URL } from '@/lib/site'
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

// Google Tag Manager. L'identifiant est surchargeable par NEXT_PUBLIC_GTM_ID
// (utile pour un conteneur de recette). Le marqueur n'est pas chargé en
// développement : les visites depuis localhost fausseraient les statistiques.
const GTM_ID    = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-PJL7FMWF'
const GTM_ACTIF = process.env.NODE_ENV === 'production' && Boolean(GTM_ID)

// Mots-clés thématiques, statiques. La balise `keywords` est ignorée par
// Google depuis 2009 : la liste était auparavant complétée par le nom de chaque
// membre, ce qui imposait une requête de 200 membres à chaque rendu de page
// sans le moindre bénéfice au référencement. Les noms des membres restent
// indexés via les fiches /annuaire/[slug], désormais présentes au sitemap.
const KEYWORDS = [
  'Cercle des Administrateurs Publics',
  'CAP Sénégal',
  'gouvernance parapublic',
  'administrateurs publics',
  "conseil d'administration",
  'secteur parapublic sénégalais',
  'modernisation administration',
  'Sénégal 2050',
  'organes délibérants',
  'gouvernance publique',
  'performance administration publique',
  'établissements publics Sénégal',
]

export function generateMetadata(): Metadata {
  return {
    // Base des URL relatives (canoniques, images OG) et hôte de référence.
    metadataBase: new URL(SITE_URL),
    // Le site répond aussi sur *.vercel.app : sans canonique, ces hôtes sont
    // vus comme du contenu dupliqué. './' résout vers l'URL de la page courante.
    alternates: { canonical: './' },
    title: {
      default: 'CAP - Cercle des Administrateurs Publics du Sénégal',
      template: '%s | CAP Sénégal',
    },
    description: 'Le Cercle des Administrateurs Publics (CAP) rassemble les présidents des conseils d\'administration, de surveillance et d\'orientation des entités du secteur parapublic sénégalais. Un cadre de réflexion, d\'échanges et d\'impulsion d\'idées au service de la modernisation de l\'administration sénégalaise.',
    keywords: KEYWORDS,
    authors: [{ name: 'Cercle des Administrateurs Publics', url: SITE_URL }],
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
      url: SITE_URL,
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
        {/* Google Tag Manager — volet noscript, à placer juste après <body>. */}
        {GTM_ACTIF && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {/* Volet script. `afterInteractive` est la stratégie recommandée pour
            GTM dans l'App Router : Next l'injecte tôt dans la page, sans
            bloquer le rendu — l'équivalent du « le plus haut possible dans
            <head> » de la consigne Google, qui vise le HTML statique. */}
        {GTM_ACTIF && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Cercle des Administrateurs Publics",
              "alternateName": "CAP Sénégal",
              "url": SITE_URL,
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
                "email": "contact@cercle-administrateurs.sn",
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

        <ChatWidget />
      </body>
    </html>
  )
}
