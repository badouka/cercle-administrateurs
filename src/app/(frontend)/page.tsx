import { getPayload } from 'payload'
import Link from 'next/link'
import Image from 'next/image'
import config from '@payload-config'
import type { Membre, Media, Activity, Document, Page } from '@/payload-types'
import { BureauCarousel } from '@/components/BureauCarousel'
import {
  ArrowRight,
  ArrowUpRight,
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
  'Président Commission Stratégie',
  'Président Commission Renforcement',
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

const ENGAGEMENTS = [
  {
    numero: '01',
    titre:  'Renforcer les capacités',
    texte:  'Des programmes de formation continue sur la gouvernance et la gestion des risques.',
  },
  {
    numero: '02',
    titre:  'Promouvoir les meilleures pratiques',
    texte:  'Diffusion de référentiels issus des meilleures pratiques africaines.',
  },
  {
    numero: '03',
    titre:  'Structurer le dialogue',
    texte:  'Un dialogue permanent avec les ministères de tutelle et les corps de contrôle.',
  },
  {
    numero: '04',
    titre:  'Être une force de proposition',
    texte:  "Promotion d'une culture de la performance au sein du secteur parapublic.",
  },
  {
    numero: '05',
    titre:  "Incarner l'exigence de résultats",
    texte:  'Un suivi rigoureux des objectifs à travers des tableaux de bord.',
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
      limit:          3,
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
      <section className="relative w-full -mt-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/api/media/file/cap-banner.png"
          alt="Cercle des Administrateurs Publics"
          className="w-full h-auto block"
        />
        <div className="absolute bottom-[23%] left-[6%]">
          <Link
            href="/a-propos"
            className="inline-flex items-center gap-2 bg-[#14B53A] text-white rounded-full px-7 py-3 font-semibold text-sm hover:bg-[#14B53A]/90 transition-colors"
          >
            En savoir plus <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── 2. Nos cinq engagements ─────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">
            01 / Notre raison d&apos;être
          </p>
          <h2 className="mt-2 font-serif text-4xl font-bold text-ink">Nos Cinq Engagements</h2>
          <p className="mt-4 max-w-2xl text-ink/60">
            Né de la volonté de fédérer les dirigeants des organes délibérants, le Cercle
            accompagne l&apos;État dans sa stratégie de modernisation et de rationalisation
            du secteur parapublic.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {ENGAGEMENTS.map(({ numero, titre, texte }, index) => {
              const isGreen = index % 2 === 0
              return (
                <div key={numero} className="flex flex-col items-center text-center">
                  <div
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full font-mono text-lg font-bold ${
                      isGreen ? 'bg-[#14B53A] text-white' : 'bg-[#FCD116] text-[#1B1A17]'
                    }`}
                  >
                    {numero}
                  </div>
                  <div className={`mx-auto mt-3 h-0.5 w-10 rounded-full ${isGreen ? 'bg-[#14B53A]' : 'bg-[#FCD116]'}`} />
                  <h3 className="mt-3 font-serif text-sm font-bold text-ink">{titre}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink/60">{texte}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/a-propos"
              className="inline-flex items-center gap-2 bg-[#14B53A] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#14B53A]/90 transition-colors"
            >
              En savoir plus <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Mot du Président ─────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-3 -skew-x-12 bg-[#14B53A]" />
            <span className="h-9 w-3 -skew-x-12 bg-[#FCD116]" />
            <span className="ml-1 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-ink">
              CAP
            </span>
          </div>
                   <h2 className="mt-4 font-serif text-3xl font-bold text-ink sm:text-4xl">
                Mot du président
              </h2>

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
                <p className="font-serif text-2xl italic leading-relaxed text-ink sm:text-3xl">
                  « {citation} »
                </p>
              ) : (
                <p className="font-serif text-2xl italic leading-relaxed text-ink/50 sm:text-3xl">
                  Le mot du président n&apos;est pas encore disponible.
                </p>
              )}

              <div className="mt-8">
                <p className="font-serif text-lg font-medium text-ink">
                  {president ? `${president.prenom} ${president.nom}` : 'Lansana Gagny SAKHO'}
                </p>
                <p className="mt-1 text-sm text-[#14B53A]">
                  Président du Cercle des Administrateurs Publics
                </p>
              </div>

              <Link
                href="/a-propos/mot-du-president"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#14B53A] transition-colors hover:text-ink"
              >
                Lire le mot du président
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Bureau exécutif ──────────────────────────────────────── */}
      <BureauCarousel membres={bureau.map(m => ({
        id: String(m.id),
        prenom: m.prenom,
        nom: m.nom,
        slug: m.slug,
        photo: m.photo && typeof m.photo === 'object' && 'filename' in m.photo
          ? { filename: (m.photo as { filename?: string | null }).filename ?? null }
          : null,
        poste: m.poste
          ? { posteCap: m.poste.posteCap ?? null, organisme: m.poste.organisme ?? null }
          : null,
      }))} />

      {/* ── 5. Nos dernières activités ───────────────────────────────── */}
      <section className="bg-[#F5F4EF] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-3 -skew-x-12 bg-[#14B53A]" />
                <span className="h-9 w-3 -skew-x-12 bg-[#FCD116]" />
                <span className="ml-1 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-ink">
                  CAP
                </span>
              </div>
              <h2 className="mt-4 font-serif text-3xl font-bold text-ink sm:text-4xl">
                Nos dernières activités
              </h2>
              <p className="mt-2 text-base text-ink/60">
                Les articles récents qui vous tiennent informés de nos activités
              </p>
            </div>

            <Link
              href="/actualites"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14B53A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#14B53A]/90"
            >
              Voir plus
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {activites.length === 0 ? (
            <p className="mt-12 text-ink/50">
              Aucune activité disponible pour le moment.
            </p>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {activites.map(activite => {
                const image = typeof activite.image === 'object' && activite.image
                  ? (activite.image as Media)
                  : null
                const categorie = activite.type === 'atelier' || activite.type === 'seminaire'
                  ? 'Ateliers et Séminaires'
                  : 'Actualités'
                const href = activite.slug ? `/activites/${activite.slug}` : '/activites'

                return (
                  <Link
                    key={activite.id}
                    href={href}
                    className="group flex flex-col gap-4"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-ink/10">
                      {image?.filename && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/media/file/${image.filename}`}
                          alt={activite.titre}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-ink/15 px-3 py-1 text-sm text-ink/70">
                        {categorie}
                      </span>
                      <span className="text-sm text-ink/50">{formatDate(activite.date_debut)}</span>
                    </div>

                    <h3 className="line-clamp-2 font-serif text-xl font-bold text-ink transition-colors group-hover:text-[#14B53A]">
                      {activite.titre}
                    </h3>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <p className="font-mono text-sm font-semibold text-bordeaux">
              1 ── {activites.length}
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. CAP Revue ─────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F4EF] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#14B53A]">PUBLICATION</p>
          <h2 className="font-serif text-4xl font-bold text-ink mt-2">CAP Revue</h2>
        </div>

        {magazine ? (
          <div className="max-w-3xl mx-auto px-4">
            <div className="rounded-2xl overflow-hidden shadow-xl grid grid-cols-[1fr_220px]">

              {/* Colonne gauche */}
              <div className="bg-white p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="0" y="0" width="8" height="20" fill="#14B53A" />
                    <rect x="10" y="0" width="10" height="20" fill="#FCD116" />
                  </svg>
                  <span className="font-serif text-xl font-bold text-ink">CAP Revue</span>
                </div>
                <p className="font-mono text-xs text-[#14B53A] tracking-widest mt-2">
                  {magazine.titre}
                </p>
                <p className="text-ink/60 text-sm leading-relaxed mt-4">
                  {magazine.description ?? "La revue du Cercle rassemble les analyses, témoignages et réflexions des présidents d'organes délibérants du secteur parapublic sénégalais."}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={magazine.fichier && typeof magazine.fichier === 'object' && magazine.fichier.filename
                      ? `/api/media/file/${magazine.fichier.filename}`
                      : '/magazines'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#14B53A] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#14B53A]/90 transition-colors text-center"
                  >
                    Lire la revue →
                  </a>
                  <Link
                    href="/magazines"
                    className="border border-ink/20 text-ink/60 px-5 py-2.5 rounded-lg text-sm font-semibold hover:border-[#14B53A] hover:text-[#14B53A] transition-colors text-center"
                  >
                    Voir tous les magazines
                  </Link>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="bg-[#1B1A17] flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full min-h-[300px] rounded-none overflow-hidden">
                  {couverture?.filename ? (
                    <Image
                      src={`/api/media/file/${couverture.filename}`}
                      alt={couverture.alt || magazine.titre}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/10">
                      <FileText size={28} className="text-white/20" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-ink/60">Retrouvez bientôt ici la dernière revue du CAP.</p>
            <Link href="/magazines" className="mt-4 inline-block text-[#14B53A] text-sm font-semibold hover:underline">
              Voir les magazines →
            </Link>
          </div>
        )}
      </section>

      {/* ── 7. Rejoindre le Cercle ───────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="border-l-4 border-[#14B53A] pl-8">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/50">
                Rejoindre le Cercle
              </p>
              <h2 className="mt-4 font-serif text-4xl font-bold text-ink sm:text-5xl">
                Vous présidez un organe délibérant du secteur parapublic ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink/70">
                Rejoignez un cadre d&apos;échange, de réflexion et de mobilisation au service de la
                modernisation de l&apos;administration publique sénégalaise.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4">
              <Link
                href="/inscription"
                className="rounded-lg bg-[#14B53A] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#14B53A]/90"
              >
                Demander une adhésion
              </Link>
              <Link
                href="/contact"
                className="text-base font-semibold text-ink transition-colors hover:text-[#14B53A]"
              >
                Nous contacter →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
