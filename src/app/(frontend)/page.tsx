import { getPayload } from 'payload'
import Link from 'next/link'
import Image from 'next/image'
import { Fragment } from 'react'
import config from '@payload-config'
import type { Membre, Media, Activity, Document, Page } from '@/payload-types'
import {
  ArrowRight,
  GraduationCap,
  Award,
  MessageSquare,
  Lightbulb,
  Target,
  User,
  FileText,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lexicalToExcerpt(content: any, maxChars = 160): string {
  try {
    let text = ''
    for (const node of content?.root?.children ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const child of ((node as any).children ?? []) as any[]) {
        if (typeof child.text === 'string') text += child.text + ' '
      }
      if (text.length >= maxChars) break
    }
    const t = text.trim()
    return t.length > maxChars ? t.slice(0, maxChars).trimEnd() + '…' : t
  } catch {
    return ''
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

const TYPE_LABELS: Record<string, string> = {
  atelier:   'Atelier',
  seminaire: 'Séminaire',
}

const ENGAGEMENTS = [
  {
    icon:  GraduationCap,
    titre: 'Renforcer les capacités',
    texte: "Des programmes de formation continue sur la gouvernance, la gestion des risques et la performance des organes dirigeants.",
  },
  {
    icon:  Award,
    titre: 'Promouvoir les meilleures pratiques',
    texte: "Diffusion de référentiels et d'outils de gouvernance issus des meilleures pratiques africaines et internationales.",
  },
  {
    icon:  MessageSquare,
    titre: 'Structurer le dialogue institutionnel',
    texte: "Un dialogue permanent avec les ministères de tutelle et les corps de contrôle de l'État.",
  },
  {
    icon:  Lightbulb,
    titre: 'Être une force de proposition',
    texte: "La promotion d'une culture de la performance et du contrat de performance au sein du secteur parapublic.",
  },
  {
    icon:  Target,
    titre: "Incarner l'exigence de résultats",
    texte: "Un suivi rigoureux des objectifs à travers des tableaux de bord et des organes délibérants engagés.",
  },
]

async function fetchPresidentPage(): Promise<Page | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection:     'pages',
    where:          { slug: { equals: 'mot-du-president' } },
    depth:          0,
    limit:          1,
    overrideAccess: true,
  })
  return (docs[0] as Page | undefined) ?? null
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [presidentPage, membresRes, activitesRes, magazinesRes] = await Promise.all([
    fetchPresidentPage(),
    payload.find({
      collection:     'membres',
      depth:          1,
      limit:          500,
      sort:           'nom',
      overrideAccess: true,
    }),
    payload.find({
      collection:     'activities',
      sort:           '-date_debut',
      depth:          1,
      limit:          4,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'documents',
      where: {
        and: [
          { categorie: { equals: 'magazines' } },
          { acces: { equals: 'public' } },
        ],
      },
      depth:          1,
      sort:           '-createdAt',
      limit:          1,
      overrideAccess: true,
    }),
  ])

  const tousLesMembres = membresRes.docs as Membre[]

  const bureau = tousLesMembres
    .filter(isAuBureau)
    .sort((a, b) => {
      const diff = rankPoste(a.poste?.posteCap) - rankPoste(b.poste?.posteCap)
      if (diff !== 0) return diff
      return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr')
    })

  const president = tousLesMembres.find(m => {
    const p = (m.poste?.posteCap ?? '').trim()
    return p === 'Président' || p === 'Présidente'
  }) ?? null

  const citation = lexicalToExcerpt(presidentPage?.contenu, 320)

  const activites = activitesRes.docs as Activity[]
  const magazine  = (magazinesRes.docs[0] as Document | undefined) ?? null

  const couverture = magazine && typeof magazine.couverture === 'object' && magazine.couverture
    ? (magazine.couverture as Media)
    : null

  return (
    <div>
      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 bg-grain bg-[url('/api/media/file/cercle-administrateurs.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 z-[1] bg-black/60" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">
            République du Sénégal · Secteur parapublic
          </p>
          <h1 className="mx-auto mt-6 font-serif text-5xl font-medium leading-tight text-white sm:text-6xl lg:text-7xl">
            Cercle des Administrateurs Publics
          </h1>
          <p className="mt-6 font-mono text-sm uppercase tracking-[0.3em] text-white/70">
            Gouvernance · Performance · Intégrité
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center rounded-lg bg-[#14B53A] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#14B53A]/90"
            >
              Adhérer
            </Link>
            <Link
              href="/a-propos"
              className="inline-flex items-center justify-center rounded-lg border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Découvrir le Cercle
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Nos cinq engagements ─────────────────────────────────────────── */}
      <section className="bg-[#FBF9F2] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">
              01 / Notre raison d&apos;être
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
              Nos Cinq Engagements
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink/70">
              Né de la volonté de fédérer les dirigeants des organes délibérants, le Cercle
              accompagne l&apos;État dans sa stratégie de modernisation et de rationalisation
              du secteur parapublic.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-5">
            {ENGAGEMENTS.map(({ icon: Icon, titre, texte }) => (
              <div key={titre} className="flex flex-col gap-4 bg-white p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#14B53A]/10 text-[#14B53A]">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3 className="font-serif text-lg font-medium text-ink">{titre}</h3>
                <p className="text-sm leading-relaxed text-ink/60">{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Mot du Président ─────────────────────────────────────────────── */}
      <section className="bg-[#1B1A17] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FCD116]">
            02 / Mots du président
          </p>

          <div className="mt-10 grid gap-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-1">
              <div className="mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                {president?.photo && typeof president.photo === 'object' && president.photo.filename ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/media/file/${president.photo.filename}`}
                    alt={`${president.prenom} ${president.nom}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User size={48} className="text-white/20" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-4">
              {citation ? (
                <p className="font-serif text-2xl italic leading-relaxed text-white sm:text-3xl">
                  « {citation} »
                </p>
              ) : (
                <p className="font-serif text-2xl italic leading-relaxed text-white/50 sm:text-3xl">
                  Le mot du président n&apos;est pas encore disponible.
                </p>
              )}

              <div className="mt-8">
                <p className="font-serif text-lg font-medium text-white">
                  {president ? `${president.prenom} ${president.nom}` : 'Lansana Gagny SAKHO'}
                </p>
                <p className="mt-1 text-sm text-[#14B53A]">
                  Président du Cercle des Administrateurs Publics
                </p>
              </div>

              <Link
                href="/a-propos/mot-du-president"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#FCD116] transition-colors hover:text-white"
              >
                Lire le mot du président
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Bureau exécutif ──────────────────────────────────────────────── */}
      <section className="bg-[#FBF9F2] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">
            03 / Gouvernance interne
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Le Bureau Exécutif
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">
            Des présidents de conseils d&apos;administration, de surveillance et d&apos;orientation
          </p>

          <div className="mt-10 border-t border-ink/10 pt-8">
            {bureau.length === 0 ? (
              <p className="text-ink/50">
                Aucun membre du bureau renseigné pour le moment.
              </p>
            ) : (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-4 text-base">
                {bureau.map((membre, i) => {
                  const posteCap   = (membre.poste?.posteCap ?? '').trim()
                  const organisme  = membre.poste?.organisme

                  return (
                    <Fragment key={membre.id}>
                      <Link
                        href={`/annuaire/${membre.slug || membre.id}`}
                        className="group inline-flex flex-wrap items-baseline gap-1.5"
                      >
                        {posteCap && (
                          <span className="font-mono text-xs uppercase tracking-wider text-[#14B53A]">
                            {posteCap}
                          </span>
                        )}
                        <span className="font-medium text-ink transition-colors group-hover:text-[#14B53A]">
                          {membre.prenom} {membre.nom}
                        </span>
                        {organisme && (
                          <span className="text-ink/40">({organisme})</span>
                        )}
                      </Link>
                      {i < bureau.length - 1 && (
                        <span className="text-ink/25">·</span>
                      )}
                    </Fragment>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-10">
            <Link
              href="/annuaire"
              className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-[#14B53A] hover:text-[#14B53A]"
            >
              Voir l&apos;annuaire complet
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Ateliers & séminaires ────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">
            04 / Activités récentes
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Ateliers &amp; séminaires
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">
            Rencontres dédiées à la formation des présidents d&apos;organes
          </p>

          <div className="mt-10 flex flex-col divide-y divide-ink/10 border-t border-ink/10">
            {activites.length === 0 ? (
              <p className="py-8 text-ink/50">
                Aucune activité disponible pour le moment.
              </p>
            ) : (
              activites.map(activite => {
                const href    = activite.slug ? `/activites/${activite.slug}` : '/activites'
                const excerpt = lexicalToExcerpt(activite.description, 160)

                return (
                  <Link
                    key={activite.id}
                    href={href}
                    className="group flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-8"
                  >
                    <div className="flex shrink-0 items-center gap-3 sm:w-56">
                      {activite.type && (
                        <span className="rounded-full bg-[#14B53A]/10 px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-[#14B53A]">
                          {TYPE_LABELS[activite.type] ?? activite.type}
                        </span>
                      )}
                      <span className="font-mono text-xs text-ink/50">
                        {formatDate(activite.date_debut)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-medium text-ink transition-colors group-hover:text-[#14B53A]">
                        {activite.titre}
                      </h3>
                      {excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink/60">{excerpt}</p>
                      )}
                    </div>
                  </Link>
                )
              })
            )}
          </div>

          <div className="mt-10">
            <Link
              href="/activites"
              className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-[#14B53A] hover:text-[#14B53A]"
            >
              Toutes les activités
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. CAP Revue ─────────────────────────────────────────────────────── */}
      <section className="bg-[#1B1A17] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            <div className={magazine ? 'order-2 lg:order-1' : 'text-center lg:col-span-2'}>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FCD116]">Publication</p>
              <h2 className="mt-3 font-serif text-3xl font-medium text-white sm:text-4xl">CAP Revue</h2>

              {magazine ? (
                <>
                  <h3 className="mt-6 text-xl font-medium text-white">{magazine.titre}</h3>
                  {magazine.description && (
                    <p className="mt-3 leading-relaxed text-white/60">{magazine.description}</p>
                  )}
                  <Link
                    href="/magazines"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#14B53A] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#14B53A]/90"
                  >
                    Lire le magazine
                    <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <p className="mx-auto mt-4 max-w-md text-white/60">
                  Aucun magazine disponible pour le moment. Retrouvez bientôt ici la dernière revue du CAP.
                </p>
              )}
            </div>

            {magazine && (
              <div className="order-1 lg:order-2">
                <div className="relative mx-auto aspect-[3/4] w-56 overflow-hidden rounded-xl bg-white/5 shadow-2xl ring-1 ring-white/10">
                  {couverture?.url ? (
                    <Image
                      src={couverture.url}
                      alt={couverture.alt || magazine.titre}
                      fill
                      className="object-cover"
                      sizes="224px"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                      <FileText size={36} className="text-white/20" strokeWidth={1.5} />
                      <span className="font-mono text-xs uppercase tracking-widest text-white/20">CAP</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── 7. Rejoindre le Cercle ───────────────────────────────────────────── */}
      <section className="bg-[#14B53A] py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/80">
            Rejoindre le Cercle
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-white sm:text-4xl">
            Vous présidez un organe délibérant du secteur parapublic ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
            Rejoignez un cadre d&apos;échange, de réflexion et de mobilisation au service de la
            modernisation de l&apos;administration publique sénégalaise.
          </p>
          <Link
            href="/inscription"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B1A17] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            Demander une adhésion
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
