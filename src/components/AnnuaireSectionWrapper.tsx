'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MembresCarousel } from './MembresCarousel'

type Membre = {
  id: string
  prenom: string
  nom: string
  slug?: string | null
  photo?: { url?: string | null } | null
  poste?: { posteCap?: string | null; organisme?: string | null } | null
}

export function AnnuaireSectionWrapper({ membres }: { membres: Membre[] }) {
  const pathname = usePathname()

  const included = ['/a-propos', '/a-propos/mot-du-president', '/a-propos/nos-partenaires']

  // Affiche uniquement sur les pages incluses
  if (!included.some(path => pathname === path)) {
    return null
  }

  // MembresCarousel attend `photo` sous forme d'URL : on passe l'URL du média.
  const cards = membres.map(m => ({
    id: m.id,
    prenom: m.prenom,
    nom: m.nom,
    slug: m.slug ?? null,
    photo: m.photo?.url ?? null,
    poste: m.poste ?? null,
  }))

  return (
    <section className="bg-[#FAF8F3] py-16 border-t border-[#14110B]/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="block w-6 h-0.5 bg-[#C8A24A]"></span>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A] font-bold">MEMBRES BUREAU</span>
            </div>
            <p className="text-[#14110B]/60 mt-1 text-sm">
              Les membres du bureau exécutif du Cercle des Administrateurs Publics.
            </p>
          </div>
          <Link
            href="/annuaire"
            className="text-[#1a7a3a] font-semibold text-sm flex items-center gap-1 hover:underline"
          >
            Tout l&apos;annuaire →
          </Link>
        </div>
        <MembresCarousel membres={cards} />
      </div>
    </section>
  )
}
