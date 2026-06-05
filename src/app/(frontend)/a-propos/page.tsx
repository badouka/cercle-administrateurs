import type { Metadata } from 'next'
import { Users, Target, BookOpen } from 'lucide-react'

export const metadata: Metadata = { title: 'Qui sommes-nous ? — CAP' }

const VALEURS = [
  {
    icon: Users,
    titre: 'Solidarité',
    texte:
      "Nous favorisons les échanges entre membres, le partage d'expériences et l'entraide au sein du réseau des administrateurs publics.",
  },
  {
    icon: Target,
    titre: 'Excellence',
    texte:
      "Nous promouvons les bonnes pratiques de gouvernance et accompagnons le développement des compétences des cadres de l'administration publique.",
  },
  {
    icon: BookOpen,
    titre: 'Transparence',
    texte:
      "Nous agissons dans un esprit d'ouverture et de responsabilité, en rendant compte de nos activités à nos membres et partenaires.",
  },
]

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* En-tête */}
      <div className="mb-12 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">Qui sommes-nous ?</h1>
        <p className="mt-3 max-w-2xl text-gray-500 leading-relaxed">
          Le Cercle des Administrateurs Publics (CAP) est une association professionnelle qui réunit
          les cadres et dirigeants de l'administration publique pour promouvoir l'excellence
          dans la gestion des affaires publiques.
        </p>
      </div>

      {/* Présentation */}
      <div className="grid gap-12 lg:grid-cols-2 mb-16">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Notre histoire</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Fondé il y a plus de vingt ans, le CAP rassemble des professionnels engagés dans
              la modernisation et l'amélioration continue des services publics. Notre réseau
              compte aujourd'hui plusieurs centaines de membres actifs issus de toutes les
              branches de l'administration.
            </p>
            <p>
              Depuis sa création, le Cercle s'est imposé comme un acteur incontournable du
              dialogue entre les acteurs publics, organisant régulièrement des rencontres,
              des conférences et des publications spécialisées.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Notre mission</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Le CAP a pour mission de créer un espace d'échange, de réflexion et de formation
              pour les administrateurs publics. Nous organisons des événements, publions des
              ressources et facilitons la mise en réseau entre professionnels du secteur public.
            </p>
            <p>
              Nous travaillons également à la valorisation du rôle des administrateurs publics
              dans la société et à la promotion d'une gouvernance efficace, transparente et
              responsable.
            </p>
          </div>
        </div>
      </div>

      {/* Valeurs */}
      <div>
        <h2 className="text-xl font-semibold text-black mb-6">Nos valeurs</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {VALEURS.map(({ icon: Icon, titre, texte }) => (
            <div
              key={titre}
              className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-black p-2.5">
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-black">{titre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{texte}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
