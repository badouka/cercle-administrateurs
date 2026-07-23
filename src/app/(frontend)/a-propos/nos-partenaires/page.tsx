import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Partenaire, Media } from '@/payload-types'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Nos Partenaires — CAP',
}

export default async function NosPartenairesPage() {
  const payload = await getPayload({ config })

  const headersList = await headers()
  let isGestionnaire = false
  try {
    const { user } = await payload.auth({ headers: headersList })
    isGestionnaire = user?.role === 'gestionnaire' || user?.role === 'admin'
  } catch (e) {
    isGestionnaire = false
  }

  const { docs } = await payload.find({
    collection:     'partenaires',
    depth:          1,
    limit:          100,
    sort:           'ordre',
    overrideAccess: true,
  })

  const partenaires = docs as Partenaire[]

  return (
    <div>
      {isGestionnaire && (
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
          <Link
            href="/gestionnaire/pages/partenaires"
            className="flex items-center gap-2 bg-[#1a7a3a] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-[#C8A24A] hover:text-[#14110B] transition-colors"
          >
            ✏️ Modifier cette page
          </Link>
        </div>
      )}
      <PageHero
        title="Nos Partenaires"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'À propos', href: '/a-propos' },
          { label: 'Nos Partenaires', href: '/a-propos/nos-partenaires' },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {partenaires.length === 0 ? (
          <p className="text-center text-ink/50">
            Aucun partenaire renseigné pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {partenaires.map(partenaire => {
              const logo = typeof partenaire.logo === 'object' && partenaire.logo
                ? (partenaire.logo as Media)
                : null

              const card = (
                <div className="flex h-full flex-col items-center rounded-xl border border-ink/10 bg-white p-6 text-center transition-shadow hover:shadow-lg">
                  <div className="flex h-20 w-full items-center justify-center">
                    {logo?.url && (
                      <Image
                        src={logo.url}
                        alt={partenaire.nom}
                        width={160}
                        height={80}
                        className="max-h-20 w-auto object-contain"
                      />
                    )}
                  </div>
                  <p className="mt-4 font-serif text-sm font-medium text-ink">{partenaire.nom}</p>
                </div>
              )

              return partenaire.site_web ? (
                <Link
                  key={partenaire.id}
                  href={partenaire.site_web}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {card}
                </Link>
              ) : (
                <div key={partenaire.id}>{card}</div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
