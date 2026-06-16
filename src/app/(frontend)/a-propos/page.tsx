import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Membre } from '@/payload-types'
import { BureauAutoCarousel } from '@/components/BureauAutoCarousel'
import { PageHero } from '@/components/PageHero'

// ── Helpers ────────────────────────────────────────────────────────────────────

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
  const p = (posteCap ?? '').trim()
  const idx = ORDRE_POSTES.indexOf(p)
  return idx === -1 ? 999 : idx
}

function isAuBureau(m: Membre): boolean {
  const posteCap = (m.poste?.posteCap ?? '').trim()
  return posteCap !== '' && posteCap !== 'Membre'
}

const ENGAGEMENTS = [
  {
    numero: '01',
    titre:  'Renforcer les capacités',
    texte:  "Le CAP organise des programmes de formation continue centrés sur les enjeux concrets du mandat d'administrateur : lecture et analyse des états financiers, évaluation des contrats de performance, gestion des risques.",
  },
  {
    numero: '02',
    titre:  'Promouvoir les meilleures pratiques',
    texte:  "Le CAP documente, diffuse et promeut les pratiques de gouvernance les plus efficaces au sein du secteur parapublic sénégalais et à travers les expériences africaines les plus probantes.",
  },
  {
    numero: '03',
    titre:  'Structurer le dialogue institutionnel',
    texte:  "Le CAP entretient un dialogue permanent avec les ministères de tutelle, la Direction Générale du Secteur Parapublic et les corps de contrôle de l'État.",
  },
  {
    numero: '04',
    titre:  'Être une force de proposition',
    texte:  "Le CAP soumet aux pouvoirs publics des recommandations fondées sur l'expérience de terrain de ses membres pour améliorer le cadre législatif et réglementaire.",
  },
  {
    numero: '05',
    titre:  "Incarner l'exigence de résultats",
    texte:  "Le CAP promeut une culture de la performance qui place l'atteinte des objectifs au même niveau que la conformité réglementaire.",
  },
]

function LogoMark() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-8 w-2.5 -skew-x-12 bg-[#14B53A]" />
      <span className="h-8 w-2.5 -skew-x-12 bg-[#FCD116]" />
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Qui sommes-nous ? — CAP',
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function AProposPage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection:     'membres',
    depth:          1,
    limit:          500,
    sort:           'nom',
    overrideAccess: true,
  })

  const bureau = (docs as Membre[])
    .filter(isAuBureau)
    .sort((a, b) => {
      const diff = rankPoste(a.poste?.posteCap) - rankPoste(b.poste?.posteCap)
      if (diff !== 0) return diff
      return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr')
    })

  return (
    <div>
      <PageHero
        title="Qui sommes-nous?"
        breadcrumb={[{ label: 'Accueil', href: '/' }, { label: 'À propos', href: '/a-propos' }]}
      />

      {/* ── 1. Diagnostic ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-4 flex items-center gap-3">
            <LogoMark />
            <h2 className="font-serif text-2xl font-bold text-ink">
              Un secteur parapublic au cœur de la transformation nationale
            </h2>
          </div>
          <p className="text-base leading-relaxed text-ink/70">
            Le secteur parapublic sénégalais occupe une place stratégique dans l&apos;architecture
            de l&apos;État. Entreprises nationales, établissements publics, agences
            d&apos;exécution, offices et fonds : ces entités sont le bras opérationnel des
            politiques publiques, les instruments par lesquels l&apos;État traduit ses ambitions
            en actes concrets au bénéfice des citoyens. Leur performance n&apos;est pas une
            question de gestion interne — c&apos;est une question de souveraineté économique et
            de développement national.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Or ce secteur traverse une période charnière. La loi d&apos;orientation n°2022-08 a
            posé les fondations d&apos;une gouvernance modernisée. Les décrets d&apos;application
            de 2025 ont précisé les règles de fonctionnement des organes délibérants, institué le
            Comité de Suivi du Secteur Parapublic et fixé les statuts-types des sociétés
            nationales. Le Plan de Transformation Sénégal 2050 du Président Bassirou Diomaye Faye
            a élevé la performance de l&apos;administration publique au rang de priorité
            nationale. Le cadre existe. L&apos;ambition est affirmée.
          </p>
          <p className="mt-4 text-base font-bold leading-relaxed text-ink">
            Il reste à accomplir l&apos;essentiel : opérationnaliser ces réformes dans la réalité
            quotidienne des entités parapubliques.
          </p>

          <div className="my-12 border-t border-ink/10" />

          <div className="mb-4 flex items-center gap-3">
            <LogoMark />
            <h2 className="font-serif text-2xl font-bold text-ink">Un diagnostic lucide</h2>
          </div>
          <p className="text-base leading-relaxed text-ink/70">
            L&apos;expérience accumulée au sein du secteur révèle un écart persistant entre la
            qualité du cadre normatif et la réalité des pratiques. Les contrats de performance
            existent rarement à l&apos;état de véritables engagements évalués. Les comités
            d&apos;audit fonctionnent trop souvent comme des organes de validation formelle plutôt
            que comme des outils de pilotage des risques. Les plans stratégiques pluriannuels sont
            adoptés en conseil mais rarement revisités en cours d&apos;exercice. La culture de la
            reddition des comptes et de la mesure des résultats peine à s&apos;imposer face à une
            logique procédurale qui privilégie la conformité sur la performance.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Cette situation ne reflète pas un manque de textes. Elle révèle un déficit de doctrine
            opérationnelle, de formation adaptée et de dialogue institutionnel structuré entre les
            organes délibérants, les directions générales et les autorités de tutelle. C&apos;est
            précisément ce vide que le CAP a vocation à combler.
          </p>

          <div className="my-12 border-t border-ink/10" />

          <div className="mb-4 flex items-center gap-3">
            <LogoMark />
            <h2 className="font-serif text-2xl font-bold text-ink">La raison d&apos;être du CAP</h2>
          </div>
          <p className="text-base leading-relaxed text-ink/70">
            C&apos;est pour répondre à ce défi que le Cercle des Administrateurs Publics a été
            créé le 12 octobre 2024. Le CAP rassemble les présidents des conseils
            d&apos;administration, de surveillance et d&apos;orientation des entités du secteur
            parapublic autour d&apos;une conviction fondatrice : la qualité de la gouvernance se
            construit d&apos;abord dans les organes délibérants, et la performance d&apos;une
            entité publique dépend avant tout de la compétence, de la posture et de
            l&apos;exigence collective de ceux qui la dirigent.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Le CAP n&apos;est pas une chambre de représentation. Il est un espace de
            transformation — un lieu où les administrateurs publics se forment, échangent, se
            challengent mutuellement et construisent ensemble les standards d&apos;une gouvernance
            publique à la hauteur des ambitions du Sénégal 2050.
          </p>
        </div>
      </section>

      {/* ── 2. Nos engagements ──────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">Nos engagements</p>
          <h2 className="mt-2 font-serif text-4xl font-bold text-ink">Nos cinq engagements</h2>

          <div className="mt-12 flex flex-col gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10">
            {ENGAGEMENTS.map(({ numero, titre, texte }, index) => (
              <div
                key={numero}
                className={`grid grid-cols-[80px_1fr_1fr] items-center gap-6 px-8 py-6 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#F5F4EF]'
                }`}
              >
                <span className="font-mono text-5xl font-bold text-[#14B53A] opacity-40">{numero}</span>
                <h3 className="font-serif text-lg font-bold text-ink">{titre}</h3>
                <p className="text-sm text-ink/60">{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Notre Vision ─────────────────────────────────────────────────── */}
      <section className="bg-[#F5F4EF] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <LogoMark />
                <p className="font-mono text-xs uppercase tracking-widest text-[#14B53A]">Notre Vision</p>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-ink">Notre Vision</h2>
              <div className="mt-6 border-l-4 border-[#14B53A] pl-6">
                <p className="font-serif text-lg italic text-ink/80">
                  Être le pilier de référence de la gouvernance du secteur parapublic sénégalais —
                  un cercle d&apos;excellence où chaque administrateur public est un acteur
                  conscient, compétent et engagé de la transformation nationale, au service du
                  développement durable et de l&apos;intérêt général.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                <p className="font-serif text-2xl font-bold text-ink">12 oct. 2024</p>
                <p className="mt-1 text-sm text-ink/60">Date de création du CAP</p>
              </div>
              <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                <p className="font-serif text-2xl font-bold text-ink">{bureau.length}</p>
                <p className="mt-1 text-sm text-ink/60">Membres du bureau exécutif</p>
              </div>
              <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
                <p className="font-serif text-2xl font-bold text-ink">Sénégal 2050</p>
                <p className="mt-1 text-sm text-ink/60">Horizon de transformation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Bureau exécutif ──────────────────────────────────────────────── */}
      <BureauAutoCarousel
        membres={bureau.map(membre => ({
          id:     String(membre.id),
          prenom: membre.prenom,
          nom:    membre.nom,
          slug:   membre.slug,
          photo:  typeof membre.photo === 'object' && membre.photo
            ? { filename: membre.photo.filename }
            : null,
          poste: membre.poste
            ? { posteCap: membre.poste.posteCap, organisme: membre.poste.organisme }
            : null,
        }))}
      />
    </div>
  )
}
