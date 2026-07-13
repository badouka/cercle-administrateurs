import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — CAP',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div>
      <PageHero
        title="Politique de Confidentialité"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Politique de Confidentialité', href: '/politique-confidentialite' },
        ]}
      />

      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#14110B]">Collecte des données</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
              Le CAP — Cercle des Administrateurs Publics collecte les données personnelles que vous
              nous transmettez volontairement, notamment lors de votre adhésion, de votre inscription
              à une activité ou de votre prise de contact&nbsp;: nom, prénom, coordonnées, fonction et
              organisme de rattachement. Aucune donnée n&apos;est collectée à votre insu.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#14110B]">Utilisation des données</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
              Les données recueillies sont utilisées exclusivement pour la gestion des adhésions,
              l&apos;organisation des activités du Cercle, la diffusion d&apos;informations relatives à
              nos actions et la tenue de l&apos;annuaire des membres. Elles ne sont ni vendues, ni
              cédées à des tiers à des fins commerciales.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#14110B]">Vos droits</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
              Conformément à la réglementation en vigueur sur la protection des données personnelles,
              vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;opposition et de
              suppression des données vous concernant. Vous pouvez exercer ces droits à tout moment en
              nous contactant.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#14110B]">Contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
              Pour toute question relative à la présente politique ou à l&apos;exercice de vos droits,
              vous pouvez nous écrire à l&apos;adresse suivante&nbsp;:{' '}
              <a
                href="mailto:contact@cap-senegal.org"
                className="text-[#1a7a3a] font-semibold transition-colors hover:text-[#C8A24A]"
              >
                contact@cap-senegal.org
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
