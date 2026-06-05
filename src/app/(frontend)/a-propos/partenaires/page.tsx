import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export const metadata: Metadata = { title: 'Nos partenaires — CAP' }

const PARTENAIRES = [
  {
    categorie: 'Institutions publiques',
    items: [
      { nom: 'Ministère de la Fonction Publique',      description: 'Partenaire institutionnel pour la formation et la mobilité des agents.' },
      { nom: "École Nationale d'Administration",      description: 'Partenaire académique pour les programmes de développement des compétences.' },
      { nom: "Direction Générale de l'Administration", description: 'Collaboration sur les projets de modernisation administrative.' },
    ],
  },
  {
    categorie: 'Organisations professionnelles',
    items: [
      { nom: 'Association des Directeurs Généraux',    description: 'Réseau partenaire pour les échanges de pratiques de direction.' },
      { nom: 'Fédération des Cadres Publics',          description: 'Partenaire pour la défense et la valorisation des métiers publics.' },
      { nom: 'Institut du Management Public',          description: 'Partenaire formation pour les programmes de leadership public.' },
    ],
  },
  {
    categorie: 'Partenaires académiques',
    items: [
      { nom: 'Université Paris-Dauphine',              description: 'Partenariat de recherche sur la gouvernance publique.' },
      { nom: 'Sciences Po',                            description: "Collaboration pour les programmes d'études et de recherche." },
    ],
  },
]

export default function PartenairesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Retour */}
      <Link
        href="/a-propos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Qui sommes-nous ?
      </Link>

      {/* En-tête */}
      <div className="mb-12 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">Nos partenaires</h1>
        <p className="mt-3 max-w-2xl text-gray-500 leading-relaxed">
          Le CAP s'appuie sur un réseau de partenaires institutionnels, professionnels et
          académiques pour développer ses missions et enrichir ses offres à destination des membres.
        </p>
      </div>

      {/* Liste par catégorie */}
      <div className="space-y-12">
        {PARTENAIRES.map(({ categorie, items }) => (
          <section key={categorie}>
            <h2 className="text-lg font-semibold text-black mb-4 pb-2 border-b border-gray-100">
              {categorie}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(({ nom, description }) => (
                <div
                  key={nom}
                  className="group rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-black text-sm leading-snug">{nom}</h3>
                    <ExternalLink
                      size={14}
                      className="shrink-0 mt-0.5 text-gray-300 group-hover:text-gray-500 transition-colors"
                    />
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA partenariat */}
      <div className="mt-16 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-black mb-2">Devenir partenaire</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto text-sm leading-relaxed">
          Vous souhaitez rejoindre notre réseau de partenaires et contribuer au développement
          de l'administration publique ? Contactez-nous pour en savoir plus.
        </p>
        <a
          href="mailto:contact@cap.fr"
          className="inline-flex items-center rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          Nous contacter
        </a>
      </div>
    </div>
  )
}
