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

  // Pages à exclure (l'accueil a déjà sa propre section Annuaire)
  const excluded = ['/', '/annuaire', '/annuaire/bureau']
  if (excluded.some(path => pathname === path || pathname.startsWith(path + '/'))) {
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
              <span className="block w-10 h-0.5 bg-[#C8A24A]"></span>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A]">ANNUAIRE</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#14110B]">Le Cercle</h2>
            <p className="text-[#14110B]/60 mt-1 text-sm">
              Les administrateurs publics qui composent le Cercle.
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
