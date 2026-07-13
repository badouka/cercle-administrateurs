import { getPayload } from 'payload'
import type { Metadata } from 'next'
import Link from 'next/link'
import config from '@payload-config'
import { PageHero } from '@/components/PageHero'
import type { Document, Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Magazines | CAP',
  description: 'Publications du Cercle des Administrateurs Publics du Sénégal',
}

export default async function MagazinesPage() {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'documents',
    where: { categorie: { equals: 'magazines' } },
    depth: 1,
    limit: 50,
    sort: '-createdAt',
    overrideAccess: true,
  })
  const magazines = res.docs as Document[]

  return (
    <div>
      <PageHero
        title="La revue du CAP"
        subtitle="Notre regard trimestriel sur la modernisation de l'administration publique sénégalaise."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Magazines', href: '/magazines' },
        ]}
      />

      <section className="bg-[#FAF8F3] py-16">
        <div className="max-w-7xl mx-auto px-6">

          {/* En-tête */}
          <div className="flex items-center gap-3 mb-10">
            <span className="block w-10 h-0.5 bg-[#C8A24A]"></span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A]">PUBLICATIONS</span>
          </div>

          {magazines.length === 0 ? (
            <p className="text-[#14110B]/50">Aucun magazine disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-7">
              {magazines.map(mag => {
                const couverture = mag.couverture && typeof mag.couverture === 'object'
                  ? (mag.couverture as Media)
                  : null
                const fichier = mag.fichier && typeof mag.fichier === 'object'
                  ? (mag.fichier as Media)
                  : null

                return (
                  <div key={mag.id} className="group cursor-pointer bg-white rounded-2xl border border-[#14110B]/10 hover:border-[#C8A24A]/50 hover:shadow-md transition-all p-3">
                    <Link
                      href={fichier?.url ?? '/magazines'}
                      {...(fichier?.url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="block"
                    >
                      {/* Couverture */}
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#062812] shadow-lg group-hover:shadow-xl transition-shadow">
                        {couverture?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={couverture.url}
                            alt={mag.titre}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      {/* Titre (cliquable) */}
                      <h3 className="mt-3 px-1 font-serif font-bold text-[#14110B] text-sm leading-tight line-clamp-2 hover:text-[#0B6B3A] transition-colors cursor-pointer">
                        {mag.titre}
                      </h3>
                    </Link>

                    {/* Date + lien */}
                    <div className="flex justify-between items-center mt-2 px-1">
                      <span className="text-xs text-[#14110B]/50">
                        {mag.createdAt ? new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(mag.createdAt)) : ''}
                      </span>
                      {fichier?.url ? (
                        <a
                          href={fichier.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B6B3A] hover:underline"
                        >
                          Lire →
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-[#0B6B3A]">Lire →</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
