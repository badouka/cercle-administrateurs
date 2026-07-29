// Pages éditoriales gérées depuis /gestionnaire/pages.
// Source unique : la liste du gestionnaire, la validation du slug et les
// chemins à revalider après enregistrement lisent tous ce tableau.

export interface PageSite {
  slug:  string
  label: string
  desc:  string
  path:  string
}

export const PAGES_SITE: PageSite[] = [
  {
    slug:  'a-propos',
    label: 'Qui sommes-nous ?',
    desc:  'Histoire, mission et valeurs',
    path:  '/a-propos',
  },
  {
    slug:  'mot-du-president',
    label: 'Mot du Président',
    desc:  'Message du Président',
    path:  '/a-propos/mot-du-president',
  },
  {
    slug:  'partenaires',
    label: 'Nos partenaires',
    desc:  'Partenaires institutionnels',
    path:  '/a-propos/partenaires',
  },
  {
    slug:  'mentions-legales',
    label: 'Mentions légales',
    desc:  'Éditeur, hébergement, propriété intellectuelle',
    path:  '/mentions-legales',
  },
  {
    slug:  'politique-confidentialite',
    label: 'Politique de confidentialité',
    desc:  'Collecte et utilisation des données personnelles',
    path:  '/politique-confidentialite',
  },
]

export const CHEMIN_PUBLIC: Record<string, string> = Object.fromEntries(
  PAGES_SITE.map(p => [p.slug, p.path]),
)

export const SLUGS_VALIDES = PAGES_SITE.map(p => p.slug)
