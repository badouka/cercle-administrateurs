import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@payload-config'
import { PageHero } from '@/components/PageHero'
import { AnnuaireClient, type AnnuaireMembre } from '@/components/AnnuaireClient'
import type { Membre, Media } from '@/payload-types'

export const metadata: Metadata = { title: 'Bureau exécutif' }

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
  'Trésorier',
  'Trésorière',
  'Trésorier Adjoint',
  'Trésorière Adjointe',
  'Présidente Commission Actions Sociales',
  'Présidente Commission Communication',
  'Président Commission Stratégie et Vulgarisation des Politiques Publiques',
  'Président Commission Renforcement de Capacités',
]

function rankPoste(posteCap: string | null | undefined): number {
  const idx = ORDRE_POSTES.indexOf((posteCap ?? '').trim())
  return idx === -1 ? 999 : idx
}

export default async function BureauPage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'membres',
    depth:          1,
    limit:          500,
    sort:           'nom',
    overrideAccess: true,
  })

  const bureau: AnnuaireMembre[] = (docs as Membre[])
    .filter(m => {
      const p = (m.poste?.posteCap ?? '').trim()
      return p !== '' && p !== 'Membre'
    })
    .sort((a, b) => {
      const diff = rankPoste(a.poste?.posteCap) - rankPoste(b.poste?.posteCap)
      if (diff !== 0) return diff
      return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr')
    })
    .map(m => {
      const photoMedia = m.photo && typeof m.photo === 'object' ? (m.photo as Media) : null
      return {
        id: String(m.id),
        prenom: m.prenom,
        nom: m.nom,
        slug: m.slug ?? null,
        photo: photoMedia?.url ?? null,
        posteCap: m.poste?.posteCap ?? null,
        fonctionProfessionnelle: m.poste?.fonctionProfessionnelle ?? null,
        organisme: m.poste?.organisme ?? null,
        isBureau: true,
      }
    })

  return (
    <div>
      <PageHero
        title="Le Bureau Exécutif"
        subtitle="L'organe dirigeant du Cercle des Administrateurs Publics."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Annuaire', href: '/annuaire' },
          { label: 'Bureau Exécutif', href: '/annuaire/bureau' },
        ]}
      />

      <section className="bg-[#FAF8F3] border-b border-[#14110B]/10 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-10 h-0.5 bg-[#C8A24A]"></span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A]">
              Bureau Exécutif
            </span>
          </div>
          <p className="text-[#14110B]/70 text-base leading-relaxed max-w-3xl">
            Le bureau exécutif est composé de onze (11) membres élus par l&apos;Assemblée Générale.
            Il joue le rôle d&apos;organe exécutif de l&apos;Association.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <AnnuaireClient membres={bureau} initialFiltre="bureau" hideBadgeFilter={true} />
        </div>
      </section>
    </div>
  )
}
