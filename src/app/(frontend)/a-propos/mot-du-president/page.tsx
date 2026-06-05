import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Quote } from 'lucide-react'

export const metadata: Metadata = { title: 'Mot du Président — CAP' }

export default function MotDuPresidentPage() {
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
        <h1 className="text-3xl font-bold text-black">Mot du Président</h1>
        <p className="mt-3 text-gray-500">
          Message du Président du Cercle des Administrateurs Publics.
        </p>
      </div>

      <div className="max-w-3xl">

        {/* Citation mise en avant */}
        <div className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-8">
          <Quote size={32} className="text-gray-300 mb-4" />
          <blockquote className="text-xl font-medium text-black leading-relaxed italic">
            « L'administration publique est le reflet de notre engagement collectif envers
            le bien commun. À travers le CAP, nous bâtissons ensemble les ponts entre les
            générations d'administrateurs, entre les expériences et les aspirations. »
          </blockquote>
        </div>

        {/* Message complet */}
        <div className="space-y-5 text-gray-600 leading-relaxed">
          <p>
            Chers membres, chers amis,
          </p>
          <p>
            C'est avec une grande fierté que je m'adresse à vous en tant que Président du
            Cercle des Administrateurs Publics. Notre association représente bien plus qu'un
            simple réseau professionnel : elle incarne une vision partagée de ce que peut
            et doit être le service public dans notre pays.
          </p>
          <p>
            Ces dernières années ont été marquées par des transformations profondes de
            l'environnement administratif. La digitalisation, les nouvelles attentes des
            citoyens, les défis budgétaires et les enjeux environnementaux ont profondément
            redessiné le paysage dans lequel nous évoluons. Face à ces mutations, la
            formation continue et le partage de bonnes pratiques sont devenus des impératifs.
          </p>
          <p>
            Le CAP s'est toujours inscrit dans cette dynamique en offrant à ses membres des
            espaces d'échange, de formation et de réflexion prospective. Nos rencontres,
            nos publications et nos événements visent à doter chaque administrateur des
            outils et des réseaux nécessaires pour relever les défis de demain.
          </p>
          <p>
            Je vous invite à vous impliquer davantage dans la vie de notre cercle, à
            partager vos expériences et à contribuer aux débats qui façonnent l'avenir
            de notre administration.
          </p>
          <p className="font-medium text-black">
            Ensemble, continuons à construire une administration publique performante,
            humaine et au service de tous.
          </p>

          {/* Signature */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="font-semibold text-black">Le Président</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Cercle des Administrateurs Publics
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
