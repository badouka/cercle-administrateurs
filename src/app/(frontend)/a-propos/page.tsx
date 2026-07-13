import type { Metadata } from 'next'
import { getPayload } from 'payload'
import Link from 'next/link'
import config from '@payload-config'
import type { Membre } from '@/payload-types'
import { PageHero } from '@/components/PageHero'
import { Award, GraduationCap, MessageSquare, Lightbulb, Target, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Qui sommes-nous ? — CAP',
}

// ── Contenu éditorial (en constantes pour éviter l'échappement JSX) ──────────────

const INTRO_LEAD =
  "Le secteur parapublic sénégalais occupe une place stratégique dans l'architecture de l'État. Entreprises nationales, établissements publics, agences d'exécution, offices et fonds : ces entités sont le bras opérationnel des politiques publiques, les instruments par lesquels l'État traduit ses ambitions en actes concrets au bénéfice des citoyens."

const INTRO_RIGHT = [
  "Leur performance n'est pas une question de gestion interne — c'est une question de souveraineté économique et de développement national.",
  "Or ce secteur traverse une période charnière. La loi d'orientation n° 2022-08 a posé les fondations d'une gouvernance modernisée. Les décrets d'application de 2025 ont précisé les règles de fonctionnement des organes délibérants, institué le Comité de Suivi du Secteur Parapublic et fixé les statuts-types des sociétés nationales. Le Plan de Transformation Sénégal 2050 du Président Bassirou Diomaye Faye a élevé la performance de l'administration publique au rang de priorité nationale. Le cadre existe. L'ambition est affirmée.",
  "Il reste à accomplir l'essentiel : opérationnaliser ces réformes dans la réalité quotidienne des entités parapubliques.",
]

const DIAGNOSTIC_TITRE = 'Un écart persistant entre la qualité du cadre et la réalité des pratiques'
const DIAGNOSTIC_TEXTE =
  "L'expérience accumulée au sein du secteur révèle un écart persistant entre la qualité du cadre normatif et la réalité des pratiques. Les contrats de performance existent rarement à l'état de véritables engagements évalués. Les comités d'audit fonctionnent trop souvent comme des organes de validation formelle plutôt que comme des outils de pilotage des risques. Les plans stratégiques pluriannuels sont adoptés en conseil mais rarement revisités en cours d'exercice. La culture de la reddition des comptes et de la mesure des résultats peine à s'imposer face à une logique procédurale qui privilégie la conformité sur la performance. Cette situation ne reflète pas un manque de textes : elle révèle un déficit de doctrine opérationnelle, de formation adaptée et de dialogue institutionnel structuré entre les organes délibérants, les directions générales et les autorités de tutelle. C'est précisément ce vide que le CAP a vocation à combler."

const RAISON_TITRE = "La gouvernance se construit d'abord dans les organes délibérants"
const RAISON_PARAS = [
  "C'est pour répondre à ce défi que le Cercle des Administrateurs Publics a été créé. Le CAP rassemble les présidents des conseils d'administration, de surveillance et d'orientation des entités du secteur parapublic autour d'une conviction fondatrice : la qualité de la gouvernance se construit d'abord dans les organes délibérants.",
  "Le CAP n'est pas une chambre de représentation. Il est un espace de transformation — un lieu où les administrateurs publics se forment, échangent, se challengent mutuellement et construisent ensemble les standards d'une gouvernance publique à la hauteur des ambitions du Sénégal 2050.",
]

const ENGAGEMENTS_TITLE = "Ce que le CAP s'engage à faire"
const ENGAGEMENTS = [
  {
    Icon: GraduationCap,
    titre: 'Renforcer les capacités',
    texte:
      'Des programmes de formation continue sur la gouvernance, la gestion des risques et la performance des organes dirigeants.',
  },
  {
    Icon: Award,
    titre: 'Promouvoir les meilleures pratiques',
    texte:
      "Diffusion de référentiels et d'outils de gouvernance issus des meilleures pratiques africaines et internationales.",
  },
  {
    Icon: MessageSquare,
    titre: 'Structurer le dialogue institutionnel',
    texte: "Un dialogue permanent avec les ministères de tutelle et les corps de contrôle de l'État.",
  },
  {
    Icon: Lightbulb,
    titre: 'Être une force de proposition',
    texte:
      "La promotion d'une culture de la performance et du contrat de performance au sein du secteur parapublic.",
  },
  {
    Icon: Target,
    titre: "Incarner l'exigence de résultats",
    texte:
      'Un suivi rigoureux des objectifs à travers des tableaux de bord et des organes délibérants engagés.',
  },
]

const CADRE_SUB =
  "Le secteur parapublic traverse une période charnière : le cadre existe, l'ambition est affirmée. Il reste à l'opérationnaliser."
const CADRE = [
  {
    titre: "Loi d'orientation n° 2022-08",
    texte: "Pose les fondations d'une gouvernance modernisée du secteur parapublic.",
  },
  {
    titre: "Décrets d'application 2025",
    texte: 'Précisent les règles de fonctionnement des organes délibérants et fixent les statuts-types.',
  },
  {
    titre: 'Plan Sénégal 2050',
    texte: "Élève la performance de l'administration publique au rang de priorité nationale.",
  },
]

// ── Sous-composants de présentation ──────────────────────────────────────────────

function Eyebrow({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-0.5 w-8 bg-[#C8A24A]" />
      <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#C8A24A]">
        {children}
      </span>
    </div>
  )
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="h-0.5 w-8 bg-[#C8A24A]" />
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#C8A24A]">
          {eyebrow}
        </span>
        <span className="h-0.5 w-8 bg-[#C8A24A]" />
      </div>
      <h2 className="mt-4 font-serif text-4xl font-bold text-[#062812]">{title}</h2>
      {sub && <p className="mt-3 leading-relaxed text-[#14110B]/60">{sub}</p>}
    </div>
  )
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

  const president = (docs as Membre[]).find(m => {
    const p = (m.poste?.posteCap ?? '').trim()
    return p === 'Président' || p === 'Présidente'
  }) ?? null

  return (
    <div className="bg-[#FAF8F3]">
      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <PageHero
        title="Qui sommes-nous ?"
        breadcrumb={[{ label: 'Accueil', href: '/' }, { label: 'À propos', href: '/a-propos' }]}
      />

      {/* ── 2. Intro éditoriale ─────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            {/* Gauche */}
            <div className="relative pl-6">
              <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#1a7a3a] to-[#C8A24A]" />
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#C8A24A]">
                Le secteur parapublic
              </p>
              <p className="font-serif text-2xl leading-snug text-[#083A1E]">{INTRO_LEAD}</p>
            </div>
            {/* Droite */}
            <div className="flex flex-col gap-5 text-base leading-relaxed text-[#14110B]/70">
              {INTRO_RIGHT.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Diagnostic lucide ────────────────────────────────────────────── */}
      <section className="bg-white pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#BFDDCD] bg-[#EEF6F1] p-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(15,61,46,0.05) 1px, transparent 0)',
                backgroundSize: '22px 22px',
              }}
            />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1a7a3a] to-[#C8A24A]" />
            <div className="relative grid grid-cols-[auto_1fr] items-start gap-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#BFDDCD] bg-white text-[#1a7a3a]">
                <Award size={28} />
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#C8A24A]">
                  Un diagnostic lucide
                </p>
                <h3 className="mb-4 font-serif text-2xl text-[#062812]">{DIAGNOSTIC_TITRE}</h3>
                <p className="leading-relaxed text-[#14110B]/70">{DIAGNOSTIC_TEXTE}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Raison d'être ────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Gauche */}
            <div>
              <Eyebrow>{"La raison d'être du CAP"}</Eyebrow>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-[#062812]">{RAISON_TITRE}</h2>
              <div className="mt-6 flex flex-col gap-4 leading-relaxed text-[#14110B]/70">
                {RAISON_PARAS.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <Link
                href="/inscription"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#1a7a3a] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#1a7a3a]/90"
              >
                Rejoindre le Cercle <ArrowRight size={18} />
              </Link>
            </div>
            {/* Droite */}
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#14110B]/10 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/a-propos.jpg"
                  alt={president ? `${president.prenom} ${president.nom}` : 'Cercle des Administrateurs Publics'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -left-5 bottom-7 max-w-[200px] rounded-xl border-t-4 border-[#C8A24A] bg-white p-5 shadow-xl">
                <p className="font-serif text-xl font-bold text-[#1a7a3a]">12 octobre 2024</p>
                <p className="mt-1 text-xs text-[#14110B]/60">
                  Création du Cercle des Administrateurs Publics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Nos 5 engagements ─────────────────────────────────────────────── */}
      <section className="border-y border-[#14110B]/10 bg-[#FAF8F3] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead eyebrow="Nos cinq engagements" title={ENGAGEMENTS_TITLE} />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ENGAGEMENTS.map(({ Icon, titre, texte }) => (
              <div
                key={titre}
                className="rounded-2xl border border-[#14110B]/10 border-t-4 border-t-[#1a7a3a] bg-white p-7 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#BFDDCD] bg-[#EEF6F1] text-[#1a7a3a]">
                  <Icon size={22} />
                </div>
                <h3 className="mb-2 font-serif text-lg text-[#062812]">{titre}</h3>
                <p className="text-sm leading-relaxed text-[#14110B]/60">{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Le cadre ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead
            eyebrow="Le cadre"
            title="Une réforme posée, une mise en œuvre à accomplir"
            sub={CADRE_SUB}
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CADRE.map(({ titre, texte }) => (
              <div
                key={titre}
                className="rounded-2xl border border-[#14110B]/10 border-t-4 border-t-[#C8A24A] bg-white p-7"
              >
                <h3 className="mb-2 font-serif text-lg text-[#062812]">{titre}</h3>
                <p className="text-sm leading-relaxed text-[#14110B]/60">{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
