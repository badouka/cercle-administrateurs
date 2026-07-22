import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@payload-config'
import type { Membre, Media } from '@/payload-types'
import { PageHero } from '@/components/PageHero'
import { AnnuaireClient, type AnnuaireFiltre, type AnnuaireMembre } from '@/components/AnnuaireClient'

export const metadata: Metadata = {
  title: 'Annuaire des membres',
  description: 'Annuaire des présidents d\'organes délibérants membres du Cercle des Administrateurs Publics du Sénégal.',
}

const ORDRE_POSTES = [
  "Président d'honneur",
  "Présidente d'honneur",
  'Président',
  'Présidente',
  'Vice-Président',
  'Vice-Présidente',
  'Secrétaire général',
  'Secrétaire générale',
  'Secrétaire général adjoint',
  'Secrétaire générale adjointe',
  'Trésorier Adjoint',
  'Trésorière Adjointe',
  'Trésorier',
  'Trésorière',
  'Présidente Commission Actions Sociales',
  'Présidente Commission Communication',
  'Président Commission Stratégie et Vulgarisation des Politiques Publiques',
  'Président Commission Renforcement de Capacités',
]

function rankPoste(posteCap: string | null | undefined): number {
  const p = (posteCap ?? '').trim()
  const idx = ORDRE_POSTES.indexOf(p)
  return idx === -1 ? 999 : idx
}

function estAuBureau(posteCap: string | null | undefined): boolean {
  const p = (posteCap ?? '').trim()
  return p !== '' && p !== 'Membre'
}

type PageProps = { searchParams: Promise<{ filtre?: string }> }

export default async function AnnuairePage({ searchParams }: PageProps) {
  const { filtre } = await searchParams
  const initialFiltre: AnnuaireFiltre =
    filtre === 'bureau' ? 'bureau' : filtre === 'membres' ? 'membres' : 'tous'

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'membres',
    depth:          1,
    limit:          500,
    sort:           'nom',
    overrideAccess: true,
  })

  const membres: AnnuaireMembre[] = (docs as Membre[])
    .slice()
    .sort((a, b) => {
      const diff = rankPoste(a.poste?.posteCap) - rankPoste(b.poste?.posteCap)
      if (diff !== 0) return diff
      return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr')
    })
    .map(m => {
      const photoMedia = m.photo && typeof m.photo === 'object' ? (m.photo as Media) : null
      const posteCap = m.poste?.posteCap ?? null
      return {
        id: String(m.id),
        prenom: m.prenom,
        nom: m.nom,
        slug: m.slug ?? null,
        photo: photoMedia?.url ?? null,
        posteCap,
        fonctionProfessionnelle: m.poste?.fonctionProfessionnelle ?? null,
        organisme: m.poste?.organisme ?? null,
        isBureau: estAuBureau(posteCap),
      }
    })

  return (
    <div>
      <PageHero
        title="L'annuaire du Cercle"
        subtitle="Les administrateurs publics qui composent le CAP et son bureau exécutif."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Annuaire', href: '/annuaire' },
        ]}
      />

      <section className="bg-[#FAF8F3] border-b border-[#14110B]/10 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-6 h-0.5 bg-[#C8A24A]"></span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A] font-bold">Membres CAP</span>
          </div>
          <p className="text-[#14110B]/70 text-base leading-relaxed max-w-3xl">
            Le Cercle des administrateurs publics (CAP) regroupe les présidents de conseil d’administration, de surveillance ou d’orientation des établissements du secteur parapublic.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <AnnuaireClient membres={membres} initialFiltre={initialFiltre} />
        </div>
      </section>
    </div>
  )
}
