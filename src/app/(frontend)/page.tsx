import { getPayload } from 'payload'
import Link from 'next/link'
import config from '@payload-config'
import type { Membre, Media, Activity, Document } from '@/payload-types'
import { MembresCarousel } from '@/components/MembresCarousel'
import { RevealOnScroll } from '@/components/RevealOnScroll'
import { CountUp } from '@/components/CountUp'
import {
  ArrowRight,
  MapPin,
  User,
  FileText,
  Download,
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

function moisAnnee(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

const MOIS_COURT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

function jourMois(dateStr?: string | null): { jour: string; mois: string } {
  if (!dateStr) return { jour: '', mois: '' }
  const d = new Date(dateStr)
  return { jour: String(d.getDate()), mois: MOIS_COURT[d.getMonth()] ?? '' }
}

function statutBadge(statut: Activity['statut']): { label: string; cls: string } {
  if (statut === 'en_cours') return { label: 'En cours', cls: 'bg-[#C9A227] text-[#14110B]' }
  if (statut === 'termine') return { label: 'Terminé', cls: 'bg-[#14110B]/70 text-white' }
  return { label: 'À venir', cls: 'bg-[#0B6B3A] text-white' }
}

function categorieActivite(type: Activity['type']): string {
  return type === 'atelier' || type === 'seminaire' ? 'Ateliers & Séminaires' : 'Actualités'
}

function mediaFilename(m: unknown): string | null {
  return m && typeof m === 'object' && 'filename' in m
    ? ((m as { filename?: string | null }).filename ?? null)
    : null
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [membresRes, activitesRes, magazinesRes] = await Promise.all([
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
      limit:          7,
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
      limit:          4,
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

  const citationFixe =
    "Le Sénégal a toujours fait de la performance de son administration publique un chantier prioritaire. Du plan Sénégal Emergent au plan de Transformation Sénégal 2050 du Président Bassirou Diomaye Faye, la même conviction traverse les ambitions de notre pays : l'Etat ne peut pleinement servir ses citoyens qu'en se réformant lui-même, en s'allégeant, en se concentrent sur ses missions essentielles et en confiant l'exécution de certaines politiques publiques à des structures plus agiles et plus proches du terrain."

  const citationClean = citationFixe.replace(/^[«\s"']+/, '')
  const firstLetter = citationClean.charAt(0)
  const restOfCitation = citationClean.slice(1)

  const activites = activitesRes.docs as Activity[]
  const magazines = magazinesRes.docs as Document[]
  const magazine  = magazines[0] ?? null
  const anciensNumeros = magazines.slice(1, 4)

  const couverture = magazine && typeof magazine.couverture === 'object' && magazine.couverture
    ? (magazine.couverture as Media)
    : null

  // Activités réutilisées comme actualités (section 4)
  const actuVedette = activites[0] ?? null
  const actuSecondaires = activites.slice(1, 4)

  const presidentPhoto = mediaFilename(president?.photo)
  const magazineFichier = mediaFilename(magazine?.fichier)

  return (
    <div className="bg-[#FAF8F3] font-sans">

      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF8F3] pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Gauche */}
            <div className="animate-fade-left">
              <p className="font-mono text-xs uppercase tracking-widest text-[#C9A227]">
                — Plateforme officielle du CAP
              </p>
              <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-[#14110B] lg:text-6xl">
                Cercle des Administrateurs Publics.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-[#14110B]/60">
                Le CAP fédère les dirigeants des organes délibérants du secteur parapublic
                sénégalais et accompagne l&apos;État dans la modernisation de l&apos;administration
                publique.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/inscription"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B6B3A] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#0B6B3A]/90"
                >
                  Devenir membre <ArrowRight size={18} />
                </Link>
                <Link
                  href="/a-propos"
                  className="inline-flex items-center rounded-lg border-2 border-[#0B6B3A] px-7 py-3 font-semibold text-[#0B6B3A] transition-colors hover:bg-[#0B6B3A]/5"
                >
                  Découvrir le Cercle
                </Link>
              </div>
            </div>

            {/* Droite */}
            <div className="relative animate-fade-right">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/media/file/cap-banner.png"
                  alt="Cercle des Administrateurs Publics"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
                  <div className="flex-1 bg-[#0B6B3A]" />
                  <div className="relative flex-1 bg-[#C9A227]">
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-[#0B6B3A]">
                      ★
                    </span>
                  </div>
                  <div className="flex-1 bg-[#E2231A]" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-xl border-t-4 border-[#C9A227] bg-white p-4 shadow-xl">
                <p className="font-serif text-3xl font-bold text-[#0B6B3A]">30+</p>
                <p className="text-xs text-[#14110B]/60">membres du bureau exécutif</p>
              </div>
            </div>
          </div>

          {/* Barre stats */}
          <RevealOnScroll>
          <div className="mt-20 grid grid-cols-2 gap-8 border-t border-[#0B6B3A]/10 pt-10 sm:grid-cols-4">
            {[
              { chiffre: <CountUp end={30} suffix="+" />, label: 'Membres' },
              { chiffre: <CountUp end={50} />, label: 'Organismes' },
              { chiffre: <CountUp end={2} />, label: 'Ans' },
              { chiffre: <CountUp end={10} suffix="+" />, label: 'Activités' },
            ].map(({ chiffre, label }) => (
              <div key={label}>
                <p className="font-serif text-4xl text-[#0B6B3A]">{chiffre}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[#14110B]/50">
                  {label}
                </p>
              </div>
            ))}
          </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── 2. Mot du Président ───────────────────────────────────────────── */}
      <RevealOnScroll>
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 lg:grid-cols-[400px_1fr]">
          {/* Gauche : photo */}
          <div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#FAF8F3] shadow-xl">
              {presidentPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/media/file/${presidentPhoto}`}
                  alt={president ? `${president.prenom} ${president.nom}` : 'Président du CAP'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User size={56} className="text-[#0B6B3A]/20" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 rounded-lg bg-[#C9A227] px-4 py-2 text-sm font-bold text-[#14110B]">
                <span className="block">
                  {president ? `${president.prenom} ${president.nom}` : 'Lansana Gagny SAKHO'}
                </span>
                <span className="block text-xs font-medium">Président du CAP</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 flex z-10">
                <div className="flex-1 bg-[#0B6B3A]"></div>
                <div className="flex-1 bg-[#C9A227] relative flex items-center justify-center">
                  <span className="absolute text-[#0B6B3A] text-[8px] leading-none">★</span>
                </div>
                <div className="flex-1 bg-[#E2231A]"></div>
              </div>
            </div>
          </div>

          {/* Droite : citation */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#C9A227]">
              — Le mot du président
            </p>
            <div className="mt-6">
              <p className="font-serif text-2xl text-[#14110B] leading-relaxed">
                <span className="font-serif text-8xl font-bold text-[#0B6B3A] float-left mr-2 leading-none mt-1">
                  {firstLetter}
                </span>
                {restOfCitation}
              </p>
            </div>
            <Link
              href="/a-propos/mot-du-president"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#0B6B3A] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0B6B3A]/90"
            >
              Lire le message <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      </RevealOnScroll>

      {/* ── 3. Nos activités ──────────────────────────────────────────────── */}
      <RevealOnScroll>
      <section className="bg-[#FAF8F3] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#C9A227]">
                — Nos activités
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold text-[#14110B]">
                Découvrez toutes nos activités
              </h2>
              <p className="mt-3 max-w-xl text-[#14110B]/60">
                Ateliers, séminaires et rencontres qui rythment la vie du Cercle tout au long
                de l&apos;année.
              </p>
            </div>
            <Link
              href="/activites"
              className="inline-flex items-center gap-2 font-semibold text-[#0B6B3A] transition-colors hover:text-[#0B6B3A]/70"
            >
              Tout l&apos;agenda <ArrowRight size={16} />
            </Link>
          </div>

          {activites.length === 0 ? (
            <p className="mt-12 text-[#14110B]/50">Aucune activité disponible pour le moment.</p>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {activites.slice(0, 3).map(activite => {
                const filename = mediaFilename(activite.image)
                const { jour, mois } = jourMois(activite.date_debut)
                const badge = statutBadge(activite.statut)
                const href = activite.slug ? `/activites/${activite.slug}` : '/activites'

                return (
                  <Link
                    key={activite.id}
                    href={href}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#0B6B3A]/5">
                      {filename && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/media/file/${filename}`}
                          alt={activite.titre}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute left-3 top-3 rounded-lg bg-white px-3 py-1 text-center shadow-sm">
                        <span className="block font-bold leading-none text-[#14110B]">{jour}</span>
                        <span className="block text-xs text-[#14110B]/60">{mois}</span>
                      </div>
                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-bold leading-snug text-[#14110B]">
                        {activite.titre}
                      </h3>
                      {activite.lieu && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-[#14110B]/60">
                          <MapPin size={14} /> {activite.lieu}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
      </RevealOnScroll>

      {/* ── 4. La vie du Cercle ───────────────────────────────────────────── */}
      <RevealOnScroll>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#C9A227]">
                — Actualités
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold text-[#14110B]">La vie du Cercle</h2>
              <p className="mt-3 max-w-xl text-[#14110B]/60">
                Retour sur les temps forts et les dernières actualités du Cercle.
              </p>
            </div>
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 font-semibold text-[#0B6B3A] transition-colors hover:text-[#0B6B3A]/70"
            >
              Toutes les actualités <ArrowRight size={16} />
            </Link>
          </div>

          {actuVedette ? (
            <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
              {/* Grande carte */}
              {(() => {
                const filename = mediaFilename(actuVedette.image)
                const { jour, mois } = jourMois(actuVedette.date_debut)
                const href = actuVedette.slug ? `/activites/${actuVedette.slug}` : '/activites'
                const excerpt = lexicalToExcerpt(actuVedette.description, 160)
                return (
                  <Link
                    href={href}
                    className="group overflow-hidden rounded-2xl bg-[#FAF8F3] transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#0B6B3A]/5">
                      {filename && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/media/file/${filename}`}
                          alt={actuVedette.titre}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <span className="absolute bottom-4 left-4 rounded-lg bg-[#C9A227] px-3 py-1 text-sm font-bold text-[#14110B]">
                        {jour} {mois}
                      </span>
                    </div>
                    <div className="p-6">
                      <span className="inline-block rounded-full bg-[#0B6B3A]/10 px-3 py-1 text-xs font-medium text-[#0B6B3A]">
                        {categorieActivite(actuVedette.type)}
                      </span>
                      <h3 className="mt-3 font-serif text-2xl font-bold leading-snug text-[#14110B]">
                        {actuVedette.titre}
                      </h3>
                      {excerpt && (
                        <p className="mt-2 text-sm leading-relaxed text-[#14110B]/60">{excerpt}</p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0B6B3A]">
                        Lire l&apos;article <ArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                )
              })()}

              {/* Petites cartes */}
              <div className="flex flex-col gap-4">
                {actuSecondaires.length === 0 ? (
                  <p className="text-sm text-[#14110B]/50">Pas d&apos;autres actualités récentes.</p>
                ) : (
                  actuSecondaires.map(actu => {
                    const filename = mediaFilename(actu.image)
                    const href = actu.slug ? `/activites/${actu.slug}` : '/activites'
                    return (
                      <Link
                        key={actu.id}
                        href={href}
                        className="group flex gap-4 overflow-hidden rounded-xl bg-[#FAF8F3] p-3 transition-shadow hover:shadow-md"
                      >
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#0B6B3A]/5">
                          {filename && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/media/file/${filename}`}
                              alt={actu.titre}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-xs uppercase tracking-wider text-[#C9A227]">
                            {categorieActivite(actu.type)}
                          </span>
                          <h4 className="mt-1 line-clamp-2 font-serif text-sm font-bold text-[#14110B]">
                            {actu.titre}
                          </h4>
                          <p className="mt-1 text-xs text-[#14110B]/50">
                            {formatDate(actu.date_debut)}
                          </p>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <p className="mt-12 text-[#14110B]/50">Aucune actualité disponible pour le moment.</p>
          )}
        </div>
      </section>
      </RevealOnScroll>

      {/* ── 5. Publications — La revue du CAP ─────────────────────────────── */}
      <RevealOnScroll>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* En-tête */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="h-0.5 w-8 bg-[#C9A227]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#C9A227]">
                  Publications
                </span>
              </div>
              <h2 className="font-serif text-4xl font-bold text-[#14110B]">La revue du CAP</h2>
              <p className="mt-2 text-[#14110B]/60">
                Notre regard trimestriel sur la modernisation de l&apos;administration publique.
              </p>
            </div>
            <Link
              href="/magazines"
              className="flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-[#0B6B3A] transition-colors hover:text-[#0B6B3A]/70"
            >
              Tous les numéros <ArrowRight size={15} />
            </Link>
          </div>

          {magazine ? (
            <>
              {/* Card principale */}
              <div className="mt-10 grid overflow-hidden rounded-2xl border border-[#14110B]/10 bg-white shadow-sm lg:grid-cols-2">
                {/* Colonne gauche : image */}
                <div className="relative min-h-[350px] lg:min-h-[400px] overflow-hidden bg-[#FAF8F3]">
                  {couverture?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={couverture.url}
                      alt={magazine.titre}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#0B6B3A]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14110B]/80 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 bg-[#C9A227] text-[#14110B] font-black text-sm px-3 py-1 rounded-lg">CAP</span>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="w-8 h-0.5 bg-[#C9A227] mb-3"></div>
                    <p className="text-white font-serif text-xl font-bold">{magazine.titre}</p>
                  </div>
                </div>

                {/* Colonne droite : contenu */}
                <div className="flex flex-col justify-center p-8">
                  <span className="mb-4 inline-flex w-fit rounded-full bg-[#C9A227] px-4 py-1.5 text-xs font-bold text-[#14110B]">
                    Dernier numéro
                  </span>
                  <p className="mb-3 font-mono text-sm text-[#14110B]/50">
                    {formatDate(magazine.createdAt)} · CAP Revue
                  </p>
                  <h3 className="font-serif text-2xl font-bold text-[#14110B]">{magazine.titre}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#14110B]/60">
                    {magazine.description ??
                      'Retrouvez dans ce numéro les contributions et analyses des membres du Cercle sur les grands enjeux de l’administration publique sénégalaise.'}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/magazines"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0B6B3A] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B6B3A]/90"
                    >
                      Lire le numéro <ArrowRight size={16} />
                    </Link>
                    {magazineFichier && (
                      <a
                        href={`/api/media/file/${magazineFichier}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#14110B]/20 px-6 py-2.5 text-sm font-semibold text-[#14110B] transition-colors hover:border-[#0B6B3A] hover:text-[#0B6B3A]"
                      >
                        <Download size={16} /> Télécharger le PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Anciens numéros */}
              {anciensNumeros.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {anciensNumeros.map((mag, i) => {
                    const cov =
                      mag.couverture && typeof mag.couverture === 'object'
                        ? (mag.couverture as Media)
                        : null
                    const numero = magazines.length - (i + 1)
                    return (
                      <Link
                        key={mag.id}
                        href="/magazines"
                        className="flex items-center gap-3 rounded-xl border border-[#14110B]/10 bg-white p-3 transition-colors hover:border-[#C9A227]"
                      >
                        {cov?.filename ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/media/file/${cov.filename}`}
                            alt={mag.titre}
                            className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[#0B6B3A]/10">
                            <FileText size={20} className="text-[#0B6B3A]/40" strokeWidth={1.5} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold text-[#C9A227]">
                            N°{numero} {moisAnnee(mag.createdAt)}
                          </p>
                          <h4 className="mt-1 line-clamp-2 font-serif text-sm font-bold text-[#14110B]">
                            {mag.titre}
                          </h4>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-[#14110B]/10 bg-white p-10 text-center shadow-sm">
              <p className="text-[#14110B]/60">Retrouvez bientôt ici la dernière revue du CAP.</p>
              <Link
                href="/magazines"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0B6B3A] hover:underline"
              >
                Voir les magazines <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>
      </RevealOnScroll>

      {/* ── 6. Annuaire — Le Cercle ───────────────────────────────────────── */}
      <RevealOnScroll>
      <section className="bg-[#FAF8F3] py-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* En-tête */}
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="h-0.5 w-10 bg-[#C9A227]" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C9A227]">
                  Annuaire
                </span>
              </div>
              <h2 className="font-serif text-4xl font-bold text-[#14110B]">Le Cercle</h2>
              <p className="mt-2 text-[#14110B]/60">
                Les administrateurs publics qui composent le Cercle et portent sa vision.
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-4">
              <select
                defaultValue="tous"
                aria-label="Filtrer l'annuaire"
                className="rounded-lg border border-[#14110B]/20 bg-white px-3 py-2 text-sm text-[#14110B]"
              >
                <option value="tous">Tous</option>
              </select>
              <Link
                href="/annuaire"
                className="flex items-center gap-1 text-sm font-semibold text-[#0B6B3A] transition-colors hover:text-[#0B6B3A]/70"
              >
                Tout l&apos;annuaire <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <MembresCarousel
            membres={tousLesMembres.slice(0, 12).map(m => {
              const photo = mediaFilename(m.photo)
              return {
                id: m.id,
                prenom: m.prenom,
                nom: m.nom,
                slug: m.slug,
                photo: photo ? `/api/media/file/${photo}` : null,
                poste: m.poste
                  ? { posteCap: m.poste.posteCap ?? null, organisme: m.poste.organisme ?? null }
                  : null,
              }
            })}
          />
        </div>
      </section>
      </RevealOnScroll>

      {/* ── 7. Rejoindre le Cercle ────────────────────────────────────────── */}
      <RevealOnScroll>
      <section className="bg-[#FAF8F3] py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#0B6B3A]/10 bg-white p-12 text-center shadow-lg">
          <p className="font-mono text-xs uppercase tracking-widest text-[#C9A227]">
            — Rejoindre le Cercle
          </p>
          <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-[#14110B]">
            Faites partie de l&apos;excellence du service public sénégalais
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[#14110B]/60">
            Rejoignez un cadre d&apos;échange, de réflexion et de mobilisation au service de la
            modernisation de l&apos;administration publique.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B6B3A] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#0B6B3A]/90"
            >
              Faire une demande d&apos;adhésion <ArrowRight size={18} />
            </Link>
            <Link
              href="/a-propos"
              className="inline-flex items-center rounded-lg border border-[#0B6B3A] px-8 py-3 font-semibold text-[#0B6B3A] transition-colors hover:bg-[#0B6B3A]/5"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
      </RevealOnScroll>
    </div>
  )
}
