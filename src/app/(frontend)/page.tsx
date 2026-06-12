import { getPayload } from 'payload'
import Link from 'next/link'
import Image from 'next/image'
import config from '@payload-config'
import type { Membre, Media, Activity, Document } from '@/payload-types'
import { ArrowRight, Award, HeartHandshake, Eye, User, Building2, FileText, CalendarDays, MapPin } from 'lucide-react'
import { ContactForm } from './ContactForm'

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

const PILIERS = [
  {
    icon:  Award,
    titre: 'Excellence',
    texte: "Promouvoir les plus hauts standards de compétence, de rigueur et de performance dans la conduite des affaires publiques.",
  },
  {
    icon:  HeartHandshake,
    titre: 'Solidarité',
    texte: "Cultiver l'entraide et la cohésion entre administrateurs publics autour de valeurs et d'une ambition communes.",
  },
  {
    icon:  Eye,
    titre: 'Transparence',
    texte: "Défendre une gouvernance ouverte, redevable et fondée sur l'intégrité à tous les niveaux de l'administration.",
  },
]

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
    .slice(0, 8)

  const membresCarousel = tousLesMembres.slice(0, 16)

  const activites = activitesRes.docs as Activity[]
  const magazine  = (magazinesRes.docs[0] as Document | undefined) ?? null

  const couverture = magazine && typeof magazine.couverture === 'object' && magazine.couverture
    ? (magazine.couverture as Media)
    : null
  const fichier = magazine && typeof magazine.fichier === 'object' && magazine.fichier
    ? (magazine.fichier as Media)
    : null

  return (
    <div>
      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink bg-grain">
        <div className="absolute inset-0 bg-gradient-to-br from-forest/50 via-ink to-ink" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-28 text-center sm:px-6 sm:py-40 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">
            Cercle des Administrateurs Publics
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl font-serif text-4xl font-medium leading-tight text-cream sm:text-5xl lg:text-6xl">
            Au service d&apos;une gouvernance publique exemplaire
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cream/60">
            Nous réunissons les hauts fonctionnaires et administrateurs publics du Sénégal autour
            de l&apos;excellence, de l&apos;éthique et de l&apos;innovation au service de l&apos;État.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/a-propos"
              className="inline-flex items-center justify-center rounded-lg bg-bordeaux px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-bordeaux/90"
            >
              Découvrir
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center rounded-lg border border-cream/25 px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              Rejoindre
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Trois piliers ────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-3">
            {PILIERS.map(({ icon: Icon, titre, texte }) => (
              <div key={titre} className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-bordeaux/10 text-bordeaux">
                  <Icon size={26} strokeWidth={1.75} />
                </div>
                <h3 className="font-serif text-xl font-medium text-ink">{titre}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Bureau exécutif ──────────────────────────────────────────────── */}
      <section className="bg-cream py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">Gouvernance</p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">Bureau exécutif</h2>
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
                    <div className="mb-4 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-ink/5 ring-2 ring-transparent transition-all group-hover:ring-bordeaux">
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
                      <p className="mt-1 text-sm text-bordeaux">{membre.poste.posteCap}</p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/annuaire?filtre=bureau"
              className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-bordeaux hover:text-bordeaux"
            >
              Voir l&apos;annuaire
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Ateliers & séminaires ────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">Activités</p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">Ateliers &amp; séminaires</h2>
          </div>

          {activites.length === 0 ? (
            <p className="text-center text-ink/50">
              Aucune activité disponible pour le moment.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {activites.map(activite => {
                const image   = typeof activite.image === 'object' && activite.image ? activite.image as Media : null
                const excerpt = lexicalToExcerpt(activite.description)
                const href    = activite.slug ? `/activites/${activite.slug}` : '/activites'

                return (
                  <article
                    key={activite.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-cream transition-shadow hover:shadow-lg"
                  >
                    <Link href={href} className="relative block aspect-video bg-ink/5">
                      {image?.url ? (
                        <Image
                          src={image.url}
                          alt={image.alt || activite.titre}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="select-none font-serif text-3xl font-medium text-ink/15">CAP</span>
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col gap-3 p-5">
                      {activite.type && (
                        <span className="self-start rounded-full bg-bordeaux/10 px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-bordeaux">
                          {TYPE_LABELS[activite.type] ?? activite.type}
                        </span>
                      )}

                      <Link href={href}>
                        <h3 className="font-serif text-lg font-medium leading-snug text-ink transition-colors hover:text-bordeaux">
                          {activite.titre}
                        </h3>
                      </Link>

                      {excerpt && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-ink/60">{excerpt}</p>
                      )}

                      <ul className="mt-auto flex flex-col gap-1.5 pt-2 text-sm text-ink/50">
                        <li className="flex items-center gap-2">
                          <CalendarDays size={14} className="shrink-0 text-bordeaux" />
                          {formatDate(activite.date_debut)}
                        </li>
                        {activite.lieu && (
                          <li className="flex items-center gap-2">
                            <MapPin size={14} className="shrink-0 text-bordeaux" />
                            {activite.lieu}
                          </li>
                        )}
                      </ul>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/activites"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-bordeaux"
            >
              Voir toutes les activités
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Magazine CAP ──────────────────────────────────────────────────── */}
      <section className="bg-forest py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            <div className={magazine ? 'order-2 lg:order-1' : 'lg:col-span-2 text-center'}>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">Publication</p>
              <h2 className="mt-3 font-serif text-3xl font-medium text-cream sm:text-4xl">Magazine CAP</h2>

              {magazine ? (
                <>
                  <h3 className="mt-6 text-xl font-medium text-cream">{magazine.titre}</h3>
                  {magazine.description && (
                    <p className="mt-3 leading-relaxed text-cream/60">{magazine.description}</p>
                  )}
                  {fichier?.url && (
                    <a
                      href={fichier.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-bordeaux px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-bordeaux/90"
                    >
                      Lire la revue
                      <ArrowRight size={16} />
                    </a>
                  )}
                </>
              ) : (
                <p className="mx-auto mt-4 max-w-md text-cream/60">
                  Aucun magazine disponible pour le moment. Retrouvez bientôt ici la dernière revue du CAP.
                </p>
              )}
            </div>

            {magazine && (
              <div className="order-1 lg:order-2">
                <div className="relative mx-auto aspect-[3/4] w-56 overflow-hidden rounded-xl bg-cream/5 shadow-2xl ring-1 ring-cream/10">
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
                      <FileText size={36} className="text-cream/20" strokeWidth={1.5} />
                      <span className="font-mono text-xs uppercase tracking-widest text-cream/20">CAP</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── 6. Membres ───────────────────────────────────────────────────────── */}
      <section className="bg-cream py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">Communauté</p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">Nos membres</h2>
          </div>
        </div>

        {membresCarousel.length === 0 ? (
          <p className="text-center text-ink/50">Aucun membre à afficher pour le moment.</p>
        ) : (
          <div className="scrollbar-hide mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
            {membresCarousel.map(membre => {
              const photo = typeof membre.photo === 'object' && membre.photo
                ? (membre.photo as Media)
                : null

              return (
                <Link
                  key={membre.id}
                  href={`/annuaire/${membre.slug || membre.id}`}
                  className="group flex w-44 shrink-0 flex-col items-center rounded-xl border border-ink/10 bg-white p-5 text-center transition-shadow hover:shadow-lg"
                >
                  <div className="mb-3 h-20 w-20 shrink-0 overflow-hidden rounded-full bg-ink/5 ring-2 ring-transparent transition-all group-hover:ring-bordeaux">
                    {photo?.url ? (
                      <Image
                        src={photo.url}
                        alt={`${membre.prenom} ${membre.nom}`}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User size={28} className="text-ink/30" />
                      </div>
                    )}
                  </div>
                  <p className="font-serif text-sm font-medium leading-tight text-ink">
                    {membre.prenom} {membre.nom}
                  </p>
                  {membre.poste?.organisme && (
                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-ink/50 line-clamp-1">
                      <Building2 size={11} className="shrink-0 text-bordeaux" />
                      {membre.poste.organisme}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/annuaire"
            className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-bordeaux hover:text-bordeaux"
          >
            Voir l&apos;annuaire
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── 7. Contact & adhésion ───────────────────────────────────────────── */}
      <section className="bg-forest py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">Contact</p>
              <h2 className="mt-3 font-serif text-3xl font-medium text-cream sm:text-4xl">Échangeons</h2>
              <p className="mt-4 text-cream/60">
                Une question, une suggestion ? Écrivez-nous et notre équipe vous répondra rapidement.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-cream/15 bg-cream/5 p-8 text-center lg:p-10">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">Adhésion</p>
              <h3 className="mt-3 font-serif text-2xl font-medium text-cream">Rejoignez le CAP</h3>
              <p className="mt-4 leading-relaxed text-cream/60">
                Devenez membre du Cercle des Administrateurs Publics et participez à une dynamique
                collective au service de l&apos;excellence et de la gouvernance publique sénégalaise.
              </p>
              <Link
                href="/inscription"
                className="mt-8 inline-flex items-center justify-center gap-2 self-center rounded-lg bg-bordeaux px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-bordeaux/90"
              >
                Devenir membre
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
