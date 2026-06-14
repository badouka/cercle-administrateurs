import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Membre, Media } from '@/payload-types'
import {
  ChevronRight,
  GraduationCap,
  Award,
  MessageSquare,
  Lightbulb,
  Target,
  User,
  ArrowRight,
} from 'lucide-react'

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

const MISSIONS = [
  {
    icon:  GraduationCap,
    titre: 'Renforcer les capacités',
    texte: "Offrir aux administrateurs publics les formations, outils et retours d'expérience nécessaires pour exercer leurs fonctions avec compétence et rigueur.",
  },
  {
    icon:  Award,
    titre: 'Promouvoir les meilleures pratiques',
    texte: "Diffuser les standards de bonne gouvernance, d'éthique et de performance au sein des conseils d'administration et de surveillance.",
  },
  {
    icon:  MessageSquare,
    titre: 'Structurer le dialogue institutionnel',
    texte: "Créer un cadre d'échange permanent entre administrateurs, autorités de tutelle et partenaires autour des enjeux du secteur parapublic.",
  },
  {
    icon:  Lightbulb,
    titre: 'Être une force de proposition',
    texte: "Formuler des recommandations concrètes pour l'amélioration des politiques et des cadres de gouvernance publique.",
  },
  {
    icon:  Target,
    titre: "Incarner l'exigence de résultats",
    texte: "Ancrer une culture de la performance, de la redevabilité et de l'impact au service du développement durable.",
  },
]

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
      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink bg-grain">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14B53A]/25 via-ink to-ink" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-white/50">
            <Link href="/" className="transition-colors hover:text-[#FCD116]">
              Accueil
            </Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white/80">Qui sommes-nous ?</span>
          </nav>
          <h1 className="mt-6 font-serif text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
            Qui sommes-nous ?
          </h1>
          <div className="mt-6 h-1 w-16 rounded-full bg-[#FCD116]" />
        </div>
      </section>

      {/* ── 2. Vision ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">Notre raison d&apos;être</p>
              <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">Notre Vision</h2>
              <p className="mt-6 text-lg leading-relaxed text-ink/70">
                Être le pilier de référence de la gouvernance du secteur parapublic sénégalais — un cercle
                d&apos;excellence où chaque administrateur public est un acteur conscient, compétent et engagé
                de la transformation nationale, au service du développement durable et de l&apos;intérêt général.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {MISSIONS.map(({ icon: Icon, titre, texte }) => (
                <div key={titre} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#14B53A]/10 text-[#14B53A]">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-ink">{titre}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/60">{texte}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Contexte ─────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F5F5] py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">Contexte</p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
              Le secteur parapublic sénégalais
            </h2>
          </div>

          <div className="flex flex-col gap-6 text-base leading-relaxed text-ink/70">
            <p>
              Le secteur parapublic sénégalais regroupe les sociétés nationales, les sociétés à
              participation publique, les agences et les établissements publics qui concourent,
              chacun dans son domaine, à la mise en œuvre des politiques de l&apos;État. La loi
              n° 2022-08 portant réforme du cadre de gouvernance du secteur parapublic a profondément
              renouvelé les règles applicables aux organes dirigeants de ces entités, en renforçant
              les exigences de compétence, d&apos;intégrité et de redevabilité attendues des
              administrateurs publics.
            </p>
            <p>
              Cette réforme s&apos;est poursuivie en 2025 avec l&apos;adoption de plusieurs décrets
              d&apos;application précisant les modalités de désignation, de formation et
              d&apos;évaluation des administrateurs siégeant dans les conseils d&apos;administration
              et de surveillance. Ces textes consacrent la professionnalisation de la fonction
              d&apos;administrateur public et instaurent de nouvelles obligations en matière de
              reddition de comptes et de pilotage stratégique des entreprises et organismes publics.
            </p>
            <p>
              Cette dynamique s&apos;inscrit pleinement dans la Vision Sénégal 2050, qui fait de la
              bonne gouvernance et de l&apos;efficacité de l&apos;action publique des leviers
              essentiels de la transformation économique et sociale du pays. Les administrateurs
              publics se trouvent ainsi placés au cœur de cette ambition, en tant que relais de la
              performance et de la transparence au sein des entités du secteur parapublic.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Pourquoi le CAP ? ────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">Notre histoire</p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">Pourquoi le CAP ?</h2>
          </div>

          <div className="flex flex-col gap-6 text-base leading-relaxed text-ink/70">
            <p>
              Face à ces mutations profondes du cadre de gouvernance, les administrateurs publics ont
              ressenti le besoin de disposer d&apos;un espace commun de réflexion, d&apos;échange et de
              montée en compétences, à la hauteur des nouvelles responsabilités qui leur sont confiées.
              C&apos;est pour répondre à cette attente que le Cercle des Administrateurs Publics (CAP)
              a été créé le 12 octobre 2024.
            </p>
            <p>
              Le CAP réunit des présidents et membres de conseils d&apos;administration et de
              surveillance, des administrateurs représentant l&apos;État ainsi que des cadres dirigeants
              d&apos;entreprises et d&apos;organismes du secteur parapublic. Il se positionne comme un
              véritable espace de transformation, où se construisent collectivement les repères, les
              outils et les pratiques d&apos;une gouvernance publique exemplaire.
            </p>
            <p>
              Au-delà du partage d&apos;expériences, le CAP ambitionne d&apos;accompagner durablement la
              mise en œuvre de la réforme du secteur parapublic, en consolidant les liens entre
              administrateurs et en portant une voix commune auprès des pouvoirs publics et des
              partenaires du Sénégal.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Bureau exécutif ──────────────────────────────────────────────── */}
      <section className="bg-[#F5F5F5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FCD116]">Gouvernance</p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">Le Bureau Exécutif</h2>
          </div>

          {bureau.length === 0 ? (
            <p className="text-center text-ink/50">
              Aucun membre du bureau renseigné pour le moment.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {bureau.map(membre => {
                const photo = typeof membre.photo === 'object' && membre.photo
                  ? (membre.photo as Media)
                  : null

                return (
                  <Link
                    key={membre.id}
                    href={`/annuaire/${membre.slug || membre.id}`}
                    className="group flex flex-col items-center rounded-xl border border-ink/10 bg-white p-6 text-center transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-4 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-ink/5 ring-2 ring-transparent transition-all group-hover:ring-[#14B53A]">
                      {photo?.url ? (
                        <Image
                          src={photo.url}
                          alt={`${membre.prenom} ${membre.nom}`}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User size={32} className="text-ink/30" />
                        </div>
                      )}
                    </div>
                    <p className="font-serif text-base font-medium text-ink">
                      {membre.prenom} {membre.nom}
                    </p>
                    {membre.poste?.posteCap && (
                      <p className="mt-1 text-sm text-[#14B53A]">{membre.poste.posteCap}</p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/annuaire?filtre=bureau"
              className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-[#14B53A] hover:text-[#14B53A]"
            >
              Voir l&apos;annuaire
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
