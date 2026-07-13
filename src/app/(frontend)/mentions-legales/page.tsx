import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Mentions Légales — CAP',
}

export default function MentionsLegalesPage() {
  return (
    <div>
      <PageHero
        title="Mentions Légales"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Mentions Légales', href: '/mentions-legales' },
        ]}
      />

      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#14110B]">Éditeur du site</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
              Ce site est édité par le <strong>CAP — Cercle des Administrateurs Publics</strong>.
              <br />
              Dakar, Sénégal
              <br />
              <a
                href="mailto:contact@cap-senegal.org"
                className="text-[#1a7a3a] font-semibold transition-colors hover:text-[#C8A24A]"
              >
                contact@cap-senegal.org
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#14110B]">Hébergement</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
              Ce site est développé et hébergé par{' '}
              <a
                href="https://digissol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a7a3a] font-semibold transition-colors hover:text-[#C8A24A]"
              >
                DIGISSOL
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#14110B]">Propriété intellectuelle</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
              L&apos;ensemble des contenus présents sur ce site (textes, images, logos, graphismes,
              documents téléchargeables) est la propriété exclusive du CAP — Cercle des Administrateurs
              Publics, sauf mention contraire. Toute reproduction, représentation, modification,
              publication ou adaptation, totale ou partielle, de ces éléments, quel que soit le moyen
              ou le procédé utilisé, est interdite sans l&apos;autorisation écrite préalable du CAP.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#14110B]">Responsabilité</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
              Le CAP s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations
              diffusées sur ce site. Toutefois, il ne saurait être tenu responsable des erreurs,
              omissions ou d&apos;une éventuelle indisponibilité du site. Les liens vers des sites
              tiers sont fournis à titre informatif&nbsp;; le CAP décline toute responsabilité quant à
              leur contenu.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
